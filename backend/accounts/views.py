from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Couple
from .serializers import (
    RegisterSerializer,
    JoinCoupleSerializer,
    LoginSerializer,
    CoupleSerializer
)


def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user and return JWT tokens"""
    serializer = RegisterSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Registration failed', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    result = serializer.save()
    user = result['user']
    couple = result['couple']
    
    # Generate tokens for automatic login
    tokens = get_tokens_for_user(user)
    
    return Response({
        'message': f'Welcome, {user.profile.display_name}! 🎉',
        'username': user.username,
        'display_name': user.profile.display_name,
        'couple_name': couple.name,
        'couple_id': couple.id,
        'anniversary_date': couple.anniversary_date,
        'invite_code': couple.invite_code,
        'partner_name': 'Waiting for partner to join...',
        'tokens': tokens,  # ✅ Send tokens
        'note': f'Share this code with your partner: {couple.invite_code}'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Login failed', 'details': serializer.errors},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    validated_data = serializer.validated_data
    user = validated_data['user']
    couple = validated_data['couple']
    
    tokens = get_tokens_for_user(user)
    
    other_member = couple.members.exclude(user=user).first()
    has_partner = other_member is not None
    partner_name = other_member.display_name if has_partner else "Waiting for partner to join..."
    invite_code = couple.invite_code if not has_partner else None
    
    return Response({
        'message': f'Welcome back, {user.profile.display_name}! 💕',
        'username': user.username,
        'display_name': user.profile.display_name,
        'couple_name': couple.name,
        'couple_id': couple.id,
        'anniversary_date': couple.anniversary_date,
        'partner_name': partner_name,
        'has_partner': has_partner,        
        'invite_code': invite_code,        
        'tokens': tokens,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def join_couple(request):
    serializer = JoinCoupleSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Failed to join couple', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    result = serializer.save()
    user = result['user']
    couple = result['couple']
    
    tokens = get_tokens_for_user(user)
    
    # Get partner's name
    other_member = couple.members.exclude(user=user).first()
    partner_name = other_member.display_name if other_member else 'Your Partner'
    
    return Response({
        'message': f'Successfully joined {couple.name}! 💕',
        'username': user.username,
        'display_name': user.profile.display_name,
        'couple_name': couple.name,
        'couple_id': couple.id,
        'anniversary_date': couple.anniversary_date,
        'partner_name': partner_name,
        'tokens': tokens,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Blacklist refresh token on logout"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass
    
    return Response({'message': 'See you soon! 💕'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token(request):
    """Get new access token using refresh token"""
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token required'}, status=400)
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            'access': str(refresh.access_token),
        })
    except Exception:
        return Response({'error': 'Invalid refresh token'}, status=401)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_couple_info(request):
    """Get current user's couple information"""
    couple = request.user.profile.couple
    if not couple:
        return Response({'error': 'Not part of a couple'}, status=404)
    
    serializer = CoupleSerializer(couple)
    data = serializer.data
    
    other_member = couple.members.exclude(user=request.user).first()
    data['partner_name'] = other_member.display_name if other_member else 'Waiting for partner...'
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invite_code(request):
    """Get the couple's invite code"""
    couple = request.user.profile.couple
    if not couple:
        return Response({'error': 'Not part of a couple'}, status=404)
    
    return Response({
        'invite_code': couple.invite_code,
        'couple_name': couple.name,
        'members': couple.members.count(),
        'message': f'Share this code with your partner: {couple.invite_code}'
    })