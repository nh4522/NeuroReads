# myapp/decorators.py
from django.shortcuts import redirect
from .auth import SimpleAuth

def login_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not SimpleAuth.is_authenticated(request):
            from django.contrib import messages
            messages.error(request, 'Please login to access this page')
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return wrapper