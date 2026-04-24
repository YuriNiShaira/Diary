from rest_framework import permissions

class IsCoupleMember(permissions.BasePermission):
    """Only allow access to couple's own data"""
    def has_object_permission(self, request, view, obj):
        # Check if object has couple field
        if hasattr(obj, 'couple'):
            return obj.couple == request.user.profile.couple
        return False