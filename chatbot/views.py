from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import MoodEntry, Session
from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json

from .services import FALLBACK_REPLY, FALLBACK_REPLY_EN, _message_is_arabic, generate_reply

def index(request):
    return render(request, 'chat/index.html')

def about(request):
    return render(request, 'chat/about.html')

def chat(request):
    return render(request, 'chat/chat.html')

def resources(request):
    return render(request, 'chat/resources.html')

def terms(request):
    return render(request, 'chat/terms.html')

def privacy(request):
    return render(request, 'chat/privacy.html')


@require_POST
def chat_api(request):
    """يستقبل رسالة المستخدم، يبعتا للنموذج مع السياق، ويرجع الرد كـ JSON."""
    try:
        data = json.loads(request.body)
        message = (data.get('message') or '').strip()
        history = data.get('history') or []
        if not message:
            error_msg = 'رسالة فارغة' if _message_is_arabic(data.get('message') or '') else 'Empty message'
            return JsonResponse({'error': error_msg}, status=400)

        user = request.user if request.user.is_authenticated else None
        reply = generate_reply(message, history=history, user=user)
        return JsonResponse({'reply': reply})
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=503)
    except Exception:
        fallback = FALLBACK_REPLY if _message_is_arabic(message) else FALLBACK_REPLY_EN
        return JsonResponse({'error': fallback}, status=500)





@require_POST
def save_mood(request):
    try:
        data = json.loads(request.body)
        mood_value = int(data.get('mood_value'))
    except (TypeError, ValueError):
        return JsonResponse({'error': 'Invalid request'}, status=400)
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    MoodEntry.objects.create(user=request.user, mood_value=mood_value)
    return JsonResponse({'status': 'ok'})


def dashboard(request):
    if not request.user.is_authenticated:
        return render(request, 'chat/dashboard.html', {
            'recent_sessions': [],
            'sessions_count': 0,
            'latest_mood': None,
            'day_streak': 0,
            'stability_level': 'لا يوجد بيانات كافية',
        })

    recent_sessions = Session.objects.filter(user=request.user).order_by('-date')[:3]
    sessions_count = Session.objects.filter(user=request.user).count()
    latest_mood = MoodEntry.objects.filter(user=request.user).order_by('-timestamp').first()

    context = {
        'recent_sessions': recent_sessions,
        'sessions_count': sessions_count,
        'latest_mood': latest_mood,
        'day_streak': calculate_streak(request.user),
        'stability_level': calculate_stability(request.user),
    }
    return render(request, 'chat/dashboard.html', context)
def calculate_streak(user):
    """بيحسب كم يوم متتالي (من اليوم للخلف) فيه مزاج مسجل، بدون انقطاع"""
    dates_with_mood = set(
        MoodEntry.objects.filter(user=user).values_list('timestamp__date', flat=True)
    )
    streak = 0
    day = timezone.now().date()
    while day in dates_with_mood:
        streak += 1
        day -= timedelta(days=1)
    return streak


def calculate_stability(user):
    """بيحسب متوسط المزاج بآخر أسبوعين ويرجع تصنيف نصي"""
    two_weeks_ago = timezone.now() - timedelta(days=14)
    recent_moods = MoodEntry.objects.filter(user=user, timestamp__gte=two_weeks_ago)
    if not recent_moods.exists():
        return "لا يوجد بيانات كافية"
    avg = recent_moods.aggregate(avg=Avg('mood_value'))['avg']
    if avg >= 4:
        return "ممتاز"
    elif avg >= 3:
        return "جيد"
    elif avg >= 2:
        return "متوسط"
    else:
        return "بحاجة لدعم"
