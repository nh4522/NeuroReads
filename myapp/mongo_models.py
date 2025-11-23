# myapp/mongo_models.py
from mongoengine import Document, StringField, EmailField, ListField, DictField, DateTimeField, BooleanField, URLField
from datetime import datetime
import hashlib

class NeuroReadsUser(Document):
    username = StringField(max_length=150, required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    full_name = StringField(max_length=255, required=True)
    bio = StringField(max_length=500, default='')
    profile_picture = StringField(default='')  # ✅ CHANGE: Use StringField instead of URLField
    reading_preferences = ListField(StringField(), default=[])
    books_read = ListField(DictField(), default=[])
    favorites = ListField(DictField(), default=[])
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    last_login = DateTimeField()
    is_active = BooleanField(default=True)
    is_admin = BooleanField(default=False)
    
    meta = {
        'collection': 'neuroreads_users',
        'indexes': ['email', 'username'],
        'ordering': ['-created_at']
    }
    
    def set_password(self, password):
        self.password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    def check_password(self, password):
        test_hash = hashlib.sha256(password.encode()).hexdigest()
        return self.password_hash == test_hash
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    @staticmethod
    def create_user(email, password, full_name, **kwargs):
        username = email
        
        if NeuroReadsUser.objects.filter(email=email).count() > 0:
            raise ValueError("Email already exists")
        
        user = NeuroReadsUser(
            username=username,
            email=email,
            full_name=full_name,
            **kwargs
        )
        user.set_password(password)
        user.save()
        return user
    
    @staticmethod
    def authenticate(email, password):
        try:
            user = NeuroReadsUser.objects.get(email=email, is_active=True)
            if user.check_password(password):
                user.last_login = datetime.utcnow()
                user.save()
                return user
        except NeuroReadsUser.DoesNotExist:
            return None
        return None

class ContactMessage(Document):
    name = StringField(max_length=255, required=True)
    email = EmailField(required=True)
    subject = StringField(max_length=255, required=True)
    message = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    status = StringField(default='pending', choices=['pending', 'read', 'replied'])
    
    meta = {
        'collection': 'contact_messages',
        'ordering': ['-created_at']
    }

class PasswordResetToken(Document):
    email = EmailField(required=True)
    token = StringField(required=True, unique=True)
    created_at = DateTimeField(default=datetime.utcnow)
    used = BooleanField(default=False)
    used_at = DateTimeField()
    
    meta = {
        'collection': 'password_reset_tokens',
        'indexes': ['email', 'token'],
    }