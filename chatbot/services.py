from google import genai
from google.genai import types
from django.conf import settings

from .prompts import build_system_prompt

FALLBACK_REPLY = "آسفة، انقطعت الخدمة لحظياً. جرب مرة تانية ولو استمرت المشكلة تواصل مع الدعم."

_client = None


def _get_client():
    global _client
    if _client is None:
        if not settings.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY غير مضبوط في ملف .env")
        _client = genai.Client(api_key=settings.GOOGLE_API_KEY)
    return _client


def generate_reply(message, history=None, user=None):
    """يبعت رسالة المستخدم للنموذج ويرجع رد النص.

    history: قائمة JSON بالشكل [{"role": "user"|"model", "text": "..."}]
    من الـ frontend عشان النموذج يحفظ سياق المحادثة بين الرسائل.
    """
    contents = [types.Content(role=item['role'], parts=[types.Part(text=item['text'])])
                for item in (history or [])
                if item.get('role') in ('user', 'model')]
    contents.append(types.Content(role='user', parts=[types.Part(text=message)]))

    response = _get_client().models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=build_system_prompt(user),
            temperature=0.7,
            top_p=0.95,
            max_output_tokens=600,
        ),
    )
    reply = (response.text or '').strip()
    return reply or FALLBACK_REPLY
