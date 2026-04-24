from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Couple, UserProfile

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        return password
    
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'display_name', 'couple']

class CoupleSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    partner1_name = serializers.SerializerMethodField()
    partner2_name = serializers.SerializerMethodField()

    class Meta:
        model = Couple
        fields = [
            'id', 'name', 'anniversary_date', 'invite_code',
            'member_count', 'partner1_name', 'partner2_name',
            'created_at'
        ]
        read_only_fields = ['invite_code']

    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_partner1_name(self, obj):
        first_member = obj.members.first()
        return first_member.display_name if first_member else None
    
    def get_partner2_name(self, obj):
        members = obj.members.all()
        if members.count() > 1:
            return members[1].display_name
        return None
    
# ============================================
# REGISTRATION SERIALIZERS
# ============================================
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    display_name = serializers.CharField(max_length=50)
    partner_name = serializers.CharField(max_length=50, required=False, default='My Love')
    anniversary_date = serializers.DateField(required=False, default='2024-01-01')