from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('chat/', views.chat, name='chat'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('resources/', views.resources, name='resources'),
    path('api/mood/', views.save_mood, name='save_mood'),
    path('api/chat/', views.chat_api, name='chat_api'),
]