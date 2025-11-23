# myapp/admin_setup.py
import os
import django
import json
from bson import ObjectId

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project_name.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from myapp.mongodb import mongodb
from datetime import datetime

def create_admin_user():
    """Create an admin user directly in the database"""
    try:
        users_collection = mongodb.get_collection('users')
        
        # Check if admin already exists
        existing_admin = users_collection.find_one({'email': 'admin@neuroreads.com'})
        if existing_admin:
            print("✅ Admin user already exists!")
            print(f"   Email: {existing_admin['email']}")
            print(f"   Username: {existing_admin.get('username', 'admin')}")
            print(f"   Is Admin: {existing_admin.get('is_admin', False)}")
            return existing_admin
        
        # Create admin user data
        admin_data = {
            'email': 'admin@neuroreads.com',
            'username': 'admin',
            'password': make_password('admin123'),
            'full_name': 'System Administrator',
            'first_name': 'System',
            'last_name': 'Administrator',
            'profile_picture': '/static/myapp/icons/top-user.png',
            'bio': 'System Administrator Account',
            'reading_goal': 12,
            'favorite_genres': ['Fiction', 'Technology', 'Science'],
            'email_notifications': True,
            'public_profile': True,
            'two_factor_enabled': False,
            'is_admin': True,
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'last_login': None
        }
        
        # Insert admin user
        result = users_collection.insert_one(admin_data)
        
        print("✅ Admin user created successfully!")
        print(f"   User ID: {result.inserted_id}")
        print(f"   Email: admin@neuroreads.com")
        print(f"   Password: admin123")
        print(f"   Username: admin")
        
        return admin_data
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return None

def list_all_users():
    """List all users in the database"""
    try:
        users_collection = mongodb.get_collection('users')
        users = list(users_collection.find({}, {
            'email': 1, 
            'username': 1, 
            'full_name': 1, 
            'is_admin': 1,
            'created_at': 1
        }))
        
        print("\n📊 ALL USERS IN DATABASE:")
        print("-" * 50)
        for user in users:
            admin_status = "👑 ADMIN" if user.get('is_admin') else "👤 USER"
            print(f"{admin_status}: {user.get('email')} ({user.get('username')}) - {user.get('full_name')}")
        print("-" * 50)
        
        return users
        
    except Exception as e:
        print(f"❌ Error listing users: {e}")
        return []

def make_existing_user_admin(email):
    """Make an existing user an admin"""
    try:
        users_collection = mongodb.get_collection('users')
        
        user = users_collection.find_one({'email': email})
        if not user:
            print(f"❌ User with email {email} not found")
            return False
        
        result = users_collection.update_one(
            {'email': email},
            {'$set': {'is_admin': True, 'updated_at': datetime.utcnow()}}
        )
        
        if result.modified_count > 0:
            print(f"✅ User {email} promoted to admin successfully!")
            return True
        else:
            print(f"❌ Failed to promote user {email} to admin")
            return False
            
    except Exception as e:
        print(f"❌ Error promoting user to admin: {e}")
        return False

if __name__ == "__main__":
    print("🛠️  ADMIN SETUP SCRIPT")
    print("=" * 50)
    
    # Create admin user
    admin_user = create_admin_user()
    
    # List all users
    list_all_users()
    
    print("\n🔑 ADMIN LOGIN CREDENTIALS:")
    print("   Email: admin@neuroreads.com")
    print("   Password: admin123")
    print("   URL: http://localhost:8000/login/")
    print("\n🎯 After login, go to: http://localhost:8000/admin-access/")