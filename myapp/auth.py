# myapp/auth.py - COMPLETE FIXED VERSION WITH ADMIN SUPPORT
from django.contrib.auth.hashers import check_password
from bson import ObjectId
from .mongodb import mongodb
from django.contrib import messages
from django.shortcuts import redirect

class SimpleAuth:
    @staticmethod
    def login_user(request, email, password):
        """Login user and store ALL data in session"""
        try:
            users = mongodb.get_collection('users')
            user = users.find_one({'email': email})
            
            if user and check_password(password, user['password']):
                # Store ALL user data in session to avoid database queries
                session_data = SimpleAuth._prepare_user_session_data(user)
                
                request.session['user_id'] = str(user['_id'])
                request.session['user_email'] = user['email']
                request.session['user_data'] = session_data
                request.session.set_expiry(1209600)  # 2 weeks
                request.session.save()  # Force save
                
                print(f"✅ LOGIN SUCCESS: {user['email']}")
                print(f"   Session ID: {request.session.session_key}")
                print(f"   User Data Stored: {session_data.get('username')}")
                print(f"   Is Admin: {session_data.get('is_admin', False)}")
                
                return True
            return False
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    # In auth.py - update get_current_user method
    @staticmethod
    def get_current_user(request):
        """Get current user data from SESSION only - no database query"""
        user_data = request.session.get('user_data')
        
        # Debug session state
        print(f"🔐 GET_USER - Session Key: {request.session.session_key}")
        print(f"🔐 GET_USER - Has user_data: {user_data is not None}")
        if user_data:
            print(f"🔐 GET_USER - Is Admin: {user_data.get('is_admin', False)}")
        
        return user_data

    @staticmethod
    def refresh_admin_status(request):
        """Refresh admin status from database"""
        try:
            user_id = request.session.get('user_id')
            if user_id:
                users_collection = mongodb.get_collection('users')
                user_data = users_collection.find_one({'_id': ObjectId(user_id)})
                if user_data:
                    # Update session with fresh admin status
                    session_data = SimpleAuth._prepare_user_session_data(user_data)
                    request.session['user_data'] = session_data
                    request.session.modified = True
                    print(f"🔄 Admin status refreshed: {session_data.get('is_admin')}")
                    return True
            return False
        except Exception as e:
            print(f"❌ Error refreshing admin status: {e}")
            return False
    
    @staticmethod
    def is_authenticated(request):
        """Check if user is authenticated using session only"""
        has_user_data = 'user_data' in request.session
        print(f"🔐 AUTH_CHECK - Has user_data: {has_user_data}")
        print(f"🔐 AUTH_CHECK - Session Key: {request.session.session_key}")
        return has_user_data
    
    @staticmethod
    def logout_user(request):
        """Logout user and clear session"""
        try:
            request.session.flush()
            print("✅ LOGOUT: Session cleared")
        except Exception as e:
            print(f"❌ Logout error: {e}")
    
    @staticmethod
    def update_session_user(request, user_data):
        """Update user data in session"""
        try:
            session_data = SimpleAuth._prepare_user_session_data(user_data)
            request.session['user_data'] = session_data
            request.session.modified = True
            request.session.save()
            
            print(f"✅ Session updated for user: {user_data.get('username', 'Unknown')}")
            return True
            
        except Exception as e:
            print(f"❌ Error updating session: {e}")
            return False

    @staticmethod
    def _prepare_user_session_data(user_data):
        """Prepare consistent user data for session"""
        return {
            '_id': str(user_data.get('_id', '')),
            'username': user_data.get('username', ''),
            'email': user_data.get('email', ''),
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'full_name': user_data.get('full_name', ''),
            'profile_picture': user_data.get('profile_picture', '/static/myapp/icons/top-user.png'),
            'bio': user_data.get('bio', ''),
            'reading_goal': user_data.get('reading_goal', 12),
            'favorite_genres': user_data.get('favorite_genres', []),
            'email_notifications': user_data.get('email_notifications', True),
            'public_profile': user_data.get('public_profile', True),
            'two_factor_enabled': user_data.get('two_factor_enabled', False),
            'is_admin': user_data.get('is_admin', False),  # ADD ADMIN FIELD
        }

    @staticmethod
    def refresh_user_data(request):
        """Refresh user data from database if needed"""
        try:
            user_id = request.session.get('user_id')
            if user_id:
                users = mongodb.get_collection('users')
                user_data = users.find_one({'_id': ObjectId(user_id)})
                if user_data:
                    SimpleAuth.update_session_user(request, user_data)
                    return True
            return False
        except Exception as e:
            print(f"❌ Error refreshing user data: {e}")
            return False

def admin_required(view_func):
    """Decorator to ensure user is admin"""
    def wrapper(request, *args, **kwargs):
        print(f"🔐 ADMIN_CHECK: Checking admin status for {request.path}")
        
        # First check if user is authenticated
        if not SimpleAuth.is_authenticated(request):
            print("❌ ADMIN_CHECK: User not authenticated")
            messages.error(request, 'Please login to access admin panel')
            return redirect('login')
        
        # Check if user is admin
        current_user = SimpleAuth.get_current_user(request)
        is_admin = current_user.get('is_admin', False)
        
        print(f"🔐 ADMIN_CHECK: User {current_user.get('username')} is admin: {is_admin}")
        
        if not is_admin:
            print("❌ ADMIN_CHECK: User is not admin")
            messages.error(request, 'Access denied. Admin privileges required.')
            return redirect('user_home')
        
        print(f"✅ ADMIN_CHECK: Admin access granted")
        return view_func(request, *args, **kwargs)
    return wrapper