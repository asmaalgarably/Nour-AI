from django.contrib import admin
from .models import MoodEntry, Session

admin.site.register(MoodEntry)
admin.site.register(Session)