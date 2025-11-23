# myapp/backends.py
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import User
from .mongodb import mongodb

class MongoDBBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        print(f"🔐 Authenticating: {username}")
        
        # Try email first, then username
        users_collection = mongodb.get_collection('users')
        user_data = users_collection.find_one({
            '$or': [
                {'email': username},
                {'username': username}
            ]
        })
        
        if user_data:
            print(f"✅ User found in MongoDB: {user_data['email']}")
            # Verify password
            if check_password(password, user_data['password']):
                print("✅ Password correct!")
                # Get or create Django user for session management
                django_user, created = User.objects.get_or_create(
                    username=user_data['username'],
                    defaults={
                        'email': user_data['email'],
                        'first_name': user_data.get('full_name', ''),
                        'is_active': True
                    }
                )
                if created:
                    print(f"✅ Created Django user: {django_user.username}")
                return django_user
            else:
                print("❌ Password incorrect")
        else:
            print("❌ User not found in MongoDB")
        
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None