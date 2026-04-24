from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout
from .models import Couple
from .serializers import (
    RegisterSerializer, 
    JoinCoupleSerializer, 
    LoginSerializer,
    CoupleSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({'error': 'Registration failed','details': serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    
    result = serializer.save()
    user = result['user']
    couple = result['couple']
    
    login(request, user)
    
    return Response({
        'message': f'Welcome, {user.profile.display_name}!',
        'username': user.username,
        'display_name': user.profile.display_name,
        'couple_name': couple.name,
        'couple_id': couple.id,
        'anniversary_date': couple.anniversary_date,
        'invite_code': couple.invite_code,
        'partner_name': 'Waiting for partner to join...',
        'note': f'Share this invite code with your partner: {couple.invite_code}'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login with username and password"""
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({'error': 'Login failed','details': serializer.errors},status=status.HTTP_401_UNAUTHORIZED)
    
    validated_data = serializer.validated_data
    user = validated_data['user']
    couple = validated_data['couple']
    
    # Django session login
    login(request, user)
    
    # Get partner's name (if they've joined)
    partner_name = "Waiting for partner..."
    other_member = couple.members.exclude(user=user).first()
    if other_member:
        partner_name = other_member.display_name
    
    return Response({
        'message': f'Welcome back, {user.profile.display_name}! 💕',
        'username': user.username,
        'display_name': user.profile.display_name,
        'couple_name': couple.name,
        'couple_id': couple.id,
        'anniversary_date': couple.anniversary_date,
        'partner_name': partner_name
    })


@api_view(['POST'])
@permission_classes([AllowAny])  
def join_couple(request):
    """
    Partner creates account AND joins existing couple.
    REQUIRED: username, password, display_name, invite_code
    """
    serializer = JoinCoupleSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({'error': 'Failed to join couple','details': serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    
    result = serializer.save()
    user = result['user']
    couple = result['couple']
    
    # Log the partner in
    login(request, user)
    
    # Get the first partner's name
    other_member = couple.members.exclude(user=user).first()
    partner_name = other_member.display_name if other_member else 'Your Partner'
    
    return Response({
        'message': f'Successfully joined {couple.name}! 💕',
        'username': user.username,
        'display_name': user.profile.display_name,
        'couple_name': couple.name,
        'couple_id': couple.id,
        'anniversary_date': couple.anniversary_date,
        'partner_name': partner_name
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout the current user"""
    logout(request)
    return Response({'message': 'See you soon! 💕'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_couple_info(request):
    """Get current user's couple information"""
    couple = request.user.profile.couple
    if not couple:
        return Response({'error': 'Not part of a couple yet'},status=status.HTTP_404_NOT_FOUND)
    
    serializer = CoupleSerializer(couple)
    
    # Add partner info
    data = serializer.data
    other_member = couple.members.exclude(user=request.user).first()
    data['partner_name'] = other_member.display_name if other_member else 'Waiting for partner...'
    
    return Response(data)