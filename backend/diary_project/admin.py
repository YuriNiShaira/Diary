from django.contrib import admin
from .models import Year, Memory,LoveLetter

@admin.register(Year)
class YearAdmin(admin.ModelAdmin):
    list_display = ['year', 'created_at']
    search_fields = ['year']
    ordering = ['-year']

@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'year', 'memory_type', 'is_favorite']
    list_filter = ['year', 'memory_type', 'is_favorite']
    search_fields = ['title', 'description', 'location']
    ordering = ['-date']

@admin.register(LoveLetter)
class LoveLetterAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_at', 'is_active']
    list_filter = ['is_active']