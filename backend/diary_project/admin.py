from django.contrib import admin
from .models import Year, Memory, LoveLetter, AnimeRating, AnimeCategory, YearFunFacts, CoupleGameScore, QuizQuestion, QuizScore, SongRecommendation, BucketListItem

@admin.register(Year)
class YearAdmin(admin.ModelAdmin):
    list_display = ['id', 'couple', 'get_year_number', 'description', 'created_at']
    search_fields = ['couple__name', 'description']
    ordering = ['couple', 'year_number']

    @admin.display(description='Year Number')
    def get_year_number(self, obj):
        return f"Year {obj.year_number}"

@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'get_year', 'memory_type', 'is_favorite', 'couple']
    list_filter = ['memory_type', 'is_favorite', 'year__year_number']
    search_fields = ['title', 'description', 'location', 'couple__name']
    ordering = ['-date']

    @admin.display(description='Year')
    def get_year(self, obj):
        return f"{obj.year.couple.name} - Year {obj.year.year_number}" if obj.year else None

@admin.register(LoveLetter)
class LoveLetterAdmin(admin.ModelAdmin):
    list_display = ['title', 'couple', 'created_at', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title', 'content']

# Optional: register other models for easier data management
@admin.register(AnimeRating)
class AnimeRatingAdmin(admin.ModelAdmin):
    list_display = ['title', 'media_type', 'year', 'combined_overall', 'couple']

@admin.register(AnimeCategory)
class AnimeCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'year', 'couple']

@admin.register(YearFunFacts)
class YearFunFactsAdmin(admin.ModelAdmin):
    list_display = ['year', 'couple']

@admin.register(CoupleGameScore)
class CoupleGameScoreAdmin(admin.ModelAdmin):
    list_display = ['game_name', 'year', 'my_score', 'shaira_score', 'couple']

@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ['question', 'year', 'difficulty', 'created_by']

@admin.register(QuizScore)
class QuizScoreAdmin(admin.ModelAdmin):
    list_display = ['year', 'my_score', 'shaira_score']

@admin.register(SongRecommendation)
class SongRecommendationAdmin(admin.ModelAdmin):
    list_display = ['title', 'artist', 'year', 'recommended_by', 'is_listened']

@admin.register(BucketListItem)
class BucketListItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'couple']