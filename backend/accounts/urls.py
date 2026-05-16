from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('join/', views.join_couple, name='join-couple'),
    path('logout/', views.logout_view, name='logout'),
    path('refresh/', views.refresh_token, name='token-refresh'), 
    path('couple-info/', views.get_couple_info, name='couple-info'),
    path('invite-code/', views.get_invite_code, name='invite-code'),
    path('contact/', views.contact, name='contact'),
]