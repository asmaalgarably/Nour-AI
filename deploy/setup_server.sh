#!/usr/bin/env bash
# ==========================================================================
# Nour AI — one-time setup on a Linux VPS (Ubuntu/Debian)
#
# Requirements:
#   - Fresh Ubuntu/Debian VPS with a domain A-record pointing to its IP.
#   - The project files must be in this directory (run from project root),
#     or rsync will copy them into /var/www/nour-ai for you.
#
# Run:
#   sudo bash deploy/setup_server.sh --domain yourdomain.com [--email you@example.com]
# ==========================================================================
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
    echo "Run as root: sudo bash deploy/setup_server.sh --domain yourdomain.com" >&2
    exit 1
fi

DOMAIN=""
EMAIL=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --domain) DOMAIN="$2"; shift 2 ;;
        --email)  EMAIL="$2";  shift 2 ;;
        *) echo "Unknown option: $1" >&2; exit 1 ;;
    esac
done
if [[ -z "$DOMAIN" ]]; then
    echo "Usage: sudo bash deploy/setup_server.sh --domain yourdomain.com [--email you@example.com]" >&2
    exit 1
fi
EMAIL="${EMAIL:-admin@$DOMAIN}"

APP_DIR="/var/www/nour-ai"
APP_USER="nour"
APP_GROUP="nour"
DB_NAME="nour_ai"
DB_USER="nour_ai"
DB_PASSWORD="$(openssl rand -hex 16)"
SECRET_KEY="$(openssl rand -base64 48)"

# ------------------------------------------------------------------ packages
echo "==> Installing system packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y python3 python3-venv python3-pip nginx postgresql \
    postgresql-contrib certbot python3-certbot-nginx rsync

# ------------------------------------------------------------------ app user
echo "==> Creating app user '$APP_USER'"
id -u "$APP_USER" &>/dev/null || useradd --system --create-home --home-dir "$APP_DIR" "$APP_USER"

# -------------------------------------------------------------------- project
if [[ "$PWD" != "$APP_DIR" ]]; then
    echo "==> Copying project to $APP_DIR"
    mkdir -p "$APP_DIR"
    rsync -a --exclude .venv --exclude .git --exclude staticfiles \
        --exclude db.sqlite3 ./ "$APP_DIR"/
fi
cd "$APP_DIR"

# ---------------------------------------------------------------------- venv
echo "==> Creating Python virtualenv"
python3 -m venv "$APP_DIR/.venv"
"$APP_DIR/.venv/bin/pip" install --upgrade pip
"$APP_DIR/.venv/bin/pip" install -r "$APP_DIR/requirements.txt"

# ----------------------------------------------------------------- postgres
echo "==> Setting up PostgreSQL"
systemctl enable --now postgresql
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
fi

# ----------------------------------------------------------------------- env
if [[ ! -f "$APP_DIR/.env" ]]; then
    echo "==> Writing $APP_DIR/.env"
    read -rsp "Enter your Gemini API key: " GOOGLE_API_KEY
    echo
    if [[ -z "${GOOGLE_API_KEY:-}" ]]; then
        echo "No API key provided — skipping .env (you can add it later before starting the service)." >&2
    else
        cat > "$APP_DIR/.env" <<EOF
DJANGO_SECRET_KEY=$SECRET_KEY
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=$DOMAIN
CSRF_TRUSTED_ORIGINS=https://$DOMAIN
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@127.0.0.1:5432/$DB_NAME
GOOGLE_API_KEY=$GOOGLE_API_KEY
GEMINI_MODEL=gemini-2.5-flash
EOF
    fi
else
    echo "==> .env already exists — keeping it"
fi

echo "==> Setting ownership"
chown -R "$APP_USER":"$APP_GROUP" "$APP_DIR"

# ---------------------------------------------------------- migrations/static
echo "==> Collecting static files and applying migrations"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && .venv/bin/python manage.py collectstatic --noinput"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && .venv/bin/python manage.py migrate --noinput"

# ------------------------------------------------------------------ systemd
echo "==> Installing systemd service"
cp "$APP_DIR/deploy/nour-ai.service" /etc/systemd/system/nour-ai.service
systemctl daemon-reload
systemctl enable --now nour-ai

# -------------------------------------------------------------------- nginx
echo "==> Configuring nginx"
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/nour-ai
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" /etc/nginx/sites-available/nour-ai
ln -sf /etc/nginx/sites-available/nour-ai /etc/nginx/sites-enabled/nour-ai
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ------------------------------------------------------------------ certbot
echo "==> Issuing HTTPS certificate (Let's Encrypt)"
certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive --redirect

echo ""
echo "Done! Nour AI is live at https://$DOMAIN"
echo "Useful commands:"
echo "  sudo systemctl status nour-ai     # backend status/logs"
echo "  sudo journalctl -u nour-ai -f     # follow backend logs"
echo "  sudo certbot renew --dry-run      # test cert auto-renewal"
