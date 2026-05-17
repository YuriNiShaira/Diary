# diary_project/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import (
    Year, Memory, LoveLetter, AnimeRating, YearFunFacts, 
    AnimeCategory, CoupleGameScore, QuizScore, QuizQuestion, 
    SongRecommendation, BucketListItem
)
from .serializers import (
    YearSerializer, MemorySerializer, LoveLetterSerializer, 
    AnimeRatingSerializer, YearFunFactsSerializer, AnimeCategorySerializer, 
    CoupleGameScoreSerializer, QuizScoreSerializer, QuizQuestionSerializer, 
    SongRecommendationSerializer, BucketListItemSerializer,
)
from .permissions import IsCoupleMember
from django.db.models import Avg


# ============================================
# HELPER
# ============================================

def get_couple(request):
    """Get couple from authenticated user's profile"""
    if request.user.is_authenticated and hasattr(request.user, 'profile'):
        return request.user.profile.couple
    return None


# ============================================
# BASE VIEWSET (auto-filters by couple)
# ============================================

class CoupleFilteredViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsCoupleMember]
    
    def get_queryset(self):
        couple = get_couple(self.request)
        if couple:
            return self.queryset.filter(couple=couple)
        return self.queryset.none()
    
    def perform_create(self, serializer):
        couple = get_couple(self.request)
        if couple:
            serializer.save(couple=couple)


# ============================================
# VIEWSETS
# ============================================

class YearViewSet(CoupleFilteredViewSet):
    queryset = Year.objects.all()
    serializer_class = YearSerializer
    
    @action(detail=True, methods=['get'])
    def memories(self, request, pk=None):
        year = self.get_object()
        memories = year.memories.all()
        serializer = MemorySerializer(memories, many=True)
        return Response(serializer.data)


class MemoryViewSet(CoupleFilteredViewSet):
    queryset = Memory.objects.all()
    serializer_class = MemorySerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        year_id = request.query_params.get('year', None)
        if year_id:
            queryset = queryset.filter(year_id=year_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class LoveLetterViewSet(CoupleFilteredViewSet):
    queryset = LoveLetter.objects.filter(is_active=True)
    serializer_class = LoveLetterSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if not queryset.exists():
            couple = get_couple(request)
            display_name = request.user.profile.display_name
            
            anniversary_date = "our special day"
            if couple and couple.anniversary_date:
                anniversary_date = couple.anniversary_date.strftime('%B %d, %Y')
            
            LoveLetter.objects.create(
                couple=couple,
                title=f"My Dearest {display_name} 💕",
                content=f"""My love,

Every day with you feels like a beautiful dream come true. From the moment we met on {anniversary_date}, my life has been filled with more joy, laughter, and love than I ever thought possible.

You are my sunshine on cloudy days, my comfort in difficult times, and my favorite person to share every moment with. Your smile lights up my world, and your love makes me a better person.

This diary is my gift to you - a collection of our beautiful memories together. Every photo, every story, every little moment captured here is a testament to our love story.

I can't wait to create many more memories with you, my love. Here's to our past, our present, and our beautiful future together.

Forever yours,
Your Love 💕""",
                is_active=True
            )
            queryset = LoveLetter.objects.filter(couple=couple)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        active_letter = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_letter, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stats(request):
    couple = get_couple(request)
    
    if not couple:
        return Response({
            'total_years': 0,
            'total_memories': 0,
            'favorite_memories': 0,
            'days_together': 0
        })
    
    total_years = Year.objects.filter(couple=couple).count()
    total_memories = Memory.objects.filter(couple=couple).count()
    favorite_memories = Memory.objects.filter(couple=couple, is_favorite=True).count()
    
    return Response({
        'total_years': total_years,
        'total_memories': total_memories,
        'favorite_memories': favorite_memories,
        'days_together': calculate_days_together(couple)
    })


def calculate_days_together(couple):
    if couple and couple.anniversary_date:
        delta = timezone.now().date() - couple.anniversary_date
        return delta.days
    return 0


class AnimeRatingViewSet(CoupleFilteredViewSet):
    queryset = AnimeRating.objects.all()
    serializer_class = AnimeRatingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        year_id = self.request.query_params.get('year', None)
        if year_id:
            queryset = queryset.filter(year_id=year_id)
        return queryset


class AnimeCategoryViewSet(CoupleFilteredViewSet):
    queryset = AnimeCategory.objects.all()
    serializer_class = AnimeCategorySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        year_id = self.request.query_params.get('year', None)
        if year_id:
            queryset = queryset.filter(year_id=year_id)
        return queryset


class YearFunFactsViewSet(CoupleFilteredViewSet):
    queryset = YearFunFacts.objects.all()
    serializer_class = YearFunFactsSerializer
    
    @action(detail=False, methods=['get'])
    def by_year(self, request):
        year_id = request.query_params.get('year_id')
        if year_id:
            fun_facts = self.get_queryset().filter(year_id=year_id).first()
            if fun_facts:
                serializer = self.get_serializer(fun_facts)
                return Response(serializer.data)
        return Response({})


class CoupleGameScoreViewSet(CoupleFilteredViewSet):
    queryset = CoupleGameScore.objects.all()
    serializer_class = CoupleGameScoreSerializer

    @action(detail=False, methods=['post'])
    def record_win(self, request):
        year_id = request.data.get('year_id')
        game_name = request.data.get('game_name')
        winner = request.data.get('winner')
        couple = get_couple(request)

        score, created = CoupleGameScore.objects.get_or_create(
            couple=couple,
            year_id=year_id,
            game_name=game_name,
            defaults={'my_score': 0, 'shaira_score': 0}
        )

        score.add_win(winner)
        serializer = self.get_serializer(score)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        year_id = request.query_params.get('year_id')
        scores = self.get_queryset().filter(year_id=year_id)

        total_my_wins = sum(s.my_score for s in scores)
        total_shaira_wins = sum(s.shaira_score for s in scores)

        return Response({
            'my_total': total_my_wins,
            'shaira_total': total_shaira_wins,
            'leader': 'me' if total_my_wins > total_shaira_wins else ('shaira' if total_shaira_wins > total_my_wins else 'tie'),
            'games': CoupleGameScoreSerializer(scores, many=True).data
        })


class QuizQuestionViewSet(CoupleFilteredViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        year_id = self.request.query_params.get('year', None)
        if year_id:
            queryset = queryset.filter(year_id=year_id)

        unused_only = self.request.query_params.get('unused', None)
        if unused_only == 'true':
            queryset = queryset.filter(is_used=False)
        
        created_by = self.request.query_params.get('created_by', None)
        if created_by:
            queryset = queryset.filter(created_by=created_by)

        return queryset
    
    @action(detail=False, methods=['get'])
    def random_question(self, request):
        year_id = request.query_params.get('year_id')
        difficulty = request.query_params.get('difficulty', None)

        queryset = self.get_queryset().filter(year_id=year_id, is_used=False)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        question = queryset.order_by('?').first()
        if question:
            serializer = self.get_serializer(question)
            return Response(serializer.data)
        return Response({'message': 'No questions available'}, status=404)


class QuizScoreViewSet(CoupleFilteredViewSet):
    queryset = QuizScore.objects.all()
    serializer_class = QuizScoreSerializer

    @action(detail=False, methods=['post'])
    def answer_question(self, request):
        year_id = request.data.get('year_id')
        question_id = request.data.get('question_id')
        player = request.data.get('player')
        answer = request.data.get('answer', '').strip()
        couple = get_couple(request)

        question = QuizQuestion.objects.get(id=question_id)
        score, _ = QuizScore.objects.get_or_create(
            couple=couple,
            year_id=year_id,
            defaults={'my_score': 0, 'shaira_score': 0}
        )

        is_correct = answer.lower() == question.answer.lower()

        if is_correct:
            points = question.get_points()
            score.add_points(player, points, question)
            return Response({
                'correct': True,
                'points_earned': points,
                'message': f'Correct! +{points} points!',
                'score': QuizScoreSerializer(score).data
            })
        else:
            return Response({
                'correct': False,
                'message': 'Not quite right! Try again or pick another question',
                'hint': question.hint if question.hint else None
            })
        
    @action(detail=False, methods=['post'])
    def reset_score(self, request):
        year_id = request.data.get('year_id')
        score = self.get_queryset().filter(year_id=year_id).first()
        if score:
            score.my_score = 0
            score.shaira_score = 0
            score.answered_questions.clear()
            score.save()
            QuizQuestion.objects.filter(year_id=year_id, couple=score.couple).update(
                is_used=False, last_used=None
            )
        return Response({'message': 'Scores reset successfully'})


class SongRecommendationViewSet(CoupleFilteredViewSet):
    queryset = SongRecommendation.objects.all()
    serializer_class = SongRecommendationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        year_id = self.request.query_params.get('year', None)
        if year_id:
            queryset = queryset.filter(year_id=year_id)

        recommended_by = self.request.query_params.get('recommended_by', None)
        if recommended_by:
            queryset = queryset.filter(recommended_by=recommended_by)

        recommended_to = self.request.query_params.get('recommended_to', None)
        if recommended_to:
            queryset = queryset.filter(recommended_to=recommended_to)

        is_listened = self.request.query_params.get('is_listened', None)
        if is_listened is not None:
            queryset = queryset.filter(is_listened=is_listened == 'true')

        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        year_id = request.query_params.get('year_id')
        queryset = self.get_queryset().filter(year_id=year_id)

        return Response({
            'total_songs': queryset.count(),
            'listened_count': queryset.filter(is_listened=True).count(),
            'my_recommendations': queryset.filter(recommended_by='me').count(),
            'shaira_recommendations': queryset.filter(recommended_by='shaira').count(),
            'for_me': queryset.filter(recommended_to='me').count(),
            'for_shaira': queryset.filter(recommended_to='shaira').count(),
            'average_rating': queryset.filter(rating__gt=0).aggregate(avg=Avg('rating'))['avg'] or 0,
        })


class BucketListViewSet(CoupleFilteredViewSet):
    queryset = BucketListItem.objects.all()
    serializer_class = BucketListItemSerializer

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        item = self.get_object()
        completed_by = request.data.get('completed_by', 'both')
        notes = request.data.get('notes', '')
        item.complete(completed_by, notes)

        return Response({
            'success': True,
            'message': f'🎉 Bucket list item completed! "{item.title}" 🎉',
            'item': self.get_serializer(item).data
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()

        return Response({
            'total': queryset.count(),
            'completed': queryset.filter(status='completed').count(),
            'pending': queryset.filter(status='pending').count(),
            'planned': queryset.filter(status='planned').count(),
            'by_category': {
                'travel': queryset.filter(category='travel').count(),
                'date': queryset.filter(category='date').count(),
                'adventure': queryset.filter(category='adventure').count(),
                'food': queryset.filter(category='food').count(),
                'learning': queryset.filter(category='learning').count(),
                'milestone': queryset.filter(category='milestone').count(),
            },
            'completion_rate': round(
                queryset.filter(status='completed').count() / queryset.count() * 100 
                if queryset.count() > 0 else 0
            )
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendar_memories(request):
    """Get memories grouped by date - FILTERED BY COUPLE"""
    couple = get_couple(request)
    
    if not couple:
        return Response({'memories': {}, 'total_dates': 0, 'total_memories': 0})
    
    year = request.query_params.get('year', None)
    month = request.query_params.get('month', None)

    queryset = Memory.objects.filter(couple=couple)

    if year:
        queryset = queryset.filter(date__year=year)
    if month:
        queryset = queryset.filter(date__month=month)

    from collections import defaultdict

    memories_by_date = defaultdict(list)
    for memory in queryset:
        date_key = memory.date.isoformat()
        
        image_url = None
        if memory.image:
            image_url = request.build_absolute_uri(memory.image.url)
        
        memories_by_date[date_key].append({
            'id': memory.id,
            'title': memory.title,
            'description': memory.description[:100],
            'image': image_url,
            'memory_type': memory.memory_type,
            'is_favorite': memory.is_favorite,
            'location': memory.location,
            'year_id': memory.year_id,
            'year': memory.year.year if memory.year else None,
        })

    return Response({'memories': dict(memories_by_date),'total_dates': len(memories_by_date),'total_memories': queryset.count(),})