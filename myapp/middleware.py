# myapp/middleware.py
from django.shortcuts import redirect
from .auth import SimpleAuth

class AdminRedirectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        # Check if user is authenticated and is admin
        if SimpleAuth.is_authenticated(request):
            current_user = SimpleAuth.get_current_user(request)
            
            # If user is admin and trying to access user home, redirect to admin dashboard
            if (current_user.get('is_admin') and 
                request.path in ['/', '/user-home/'] and 
                'admin' not in request.path):
                print(f"🔄 MIDDLEWARE: Redirecting admin from {request.path} to admin dashboard")
                return redirect('admin_dashboard')
        
        return None