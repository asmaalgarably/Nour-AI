#!/usr/bin/env bash
# ==========================================================================
# Nour AI — redeploy after pulling new code / changing models or settings.
# Run on the server as root:  sudo bash deploy/redeploy.sh
# ==========================================================================
set -euo pipefail

APP_DIR="/var/www/nour-ai"
cd "$APP_DIR"

echo "==> Pulling latest code"
if [[ -d .git ]]; then
    sudo -u nour git pull
fi

echo "==> Updating dependencies"
sudo -u nour bash -c "cd '$APP_DIR' && .venv/bin/pip install -r requirements.txt"

echo "==> Collecting static files"
sudo -u nour bash -c "cd '$APP_DIR' && .venv/bin/python manage.py collectstatic --noinput"

echo "==> Applying migrations"
sudo -u nour bash -c "cd '$APP_DIR' && .venv/bin/python manage.py migrate --noinput"

echo "==> Restarting backend"
systemctl restart nour-ai

echo "Done."
