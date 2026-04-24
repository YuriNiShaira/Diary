from django.db import models
from django.contrib.auth.models import User
import uuid

# Create your models here.

class Couple(models.Model):
    name = models.CharField(max_length=100)
    invite_code = models.CharField(max_length=20, unique=True, default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True)

    # Anniversary date for this couple
    anniversary_date = models.DateField(default='2022-06-30')

    def __str__(self):
        return self.name
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='members', null=True)
    display_name = models.CharField(max_length=50)
    
    def __str__(self):
        return f"{self.display_name} ({self.couple.name if self.couple else 'No couple'})"