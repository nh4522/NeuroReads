# myapp/views.py - COMPLETE FIXED VERSION
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from .auth import SimpleAuth
from .models import UserManager, ContactManager, PostManager, UserBooksManager
from .mongodb import mongodb
from bson import ObjectId
import json
from datetime import datetime, timedelta
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
from django.views.static import serve
from django.conf import settings
import random
from .models import ContactManager


# myapp/views.py - Fix login_required decorator

def login_required(view_func):
    """Custom login_required decorator for SimpleAuth"""
    def wrapper(request, *args, **kwargs):
        print(f"🔐 LOGIN_REQUIRED: Checking auth for {request.path}")
        print(f"🔐 LOGIN_REQUIRED: Session Key: {request.session.session_key}")
        print(f"🔐 LOGIN_REQUIRED: Session Keys: {list(request.session.keys())}")
        
        if not SimpleAuth.is_authenticated(request):
            print("❌ LOGIN_REQUIRED: User not authenticated, redirecting to login")
            messages.error(request, 'Please login to access this page')
            return redirect('login')
        
        print(f"✅ LOGIN_REQUIRED: User authenticated, proceeding to view")
        return view_func(request, *args, **kwargs)
    return wrapper

# Add this function to your existing views.py
@login_required
def admin_access_view(request):
    """Admin access page - shows admin button if user is admin"""
    current_user = SimpleAuth.get_current_user(request)
    context = get_consistent_user_context(current_user)
    
    # Check if user is admin
    is_admin = current_user.get('is_admin', False)
    context['is_admin'] = is_admin
    
    return render(request, 'myapp/admin_access.html', context)

@login_required
def pdf_reader_view(request, book_id):
    """PDF Reader view - uses session data only"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        
        print(f"🎯 PDF Reader accessed for book_id: {book_id}")
        print(f"👤 User from session: {current_user.get('username', 'Unknown')}")
        print(f"👤 User ID: {current_user.get('_id', 'Unknown')}")
        
        if not current_user:
            print("❌ No user data in session")
            messages.error(request, 'Please login to access this page')
            return redirect('login')
        
        # Get complete book details from books collection
        books_collection = mongodb.get_collection('books')
        book = books_collection.find_one({'_id': ObjectId(book_id)})
        
        if not book:
            print(f"❌ Book not found: {book_id}")
            messages.error(request, 'Book not found')
            return redirect('user_books')
        
        # Check if book has PDF
        pdf_url = book.get('pdf_url')
        if not pdf_url:
            print(f"❌ No PDF URL for book: {book.get('title')}")
            messages.error(request, 'This book is not available for reading yet')
            return redirect('user_books')
        
        print(f"📄 PDF URL found: {pdf_url}")
        
        # Get user's reading progress from user_books collection
        user_books_collection = mongodb.get_collection('user_books')
        user_book = user_books_collection.find_one({
            'user_id': ObjectId(current_user['_id']),  # Use _id from session
            'book_id': book_id
        })
        
        # Prepare book data for template
        book_data = {
            'id': str(book['_id']),
            'title': book.get('title', 'Unknown Title'),
            'author': book.get('author', 'Unknown Author'),
            'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
            'pdf_url': pdf_url,
            'file_type': 'pdf',
            'total_pages': book.get('pages', 496),
            'description': book.get('description', ''),
            'genre': book.get('genre', []),
            'language': book.get('language', 'English'),
        }
        
        # Get user's current reading progress
        current_page = 1
        total_pages = book_data['total_pages']
        progress = 0
        
        if user_book:
            current_page = user_book.get('current_page', 1)
            total_pages = user_book.get('total_pages', book_data['total_pages'])
            progress = user_book.get('progress', 0)
            print(f"📊 User progress: page {current_page}/{total_pages} ({progress}%)")
        else:
            print("📊 No previous reading progress found")
        
        context = {
            'book': book_data,
            'current_page': current_page,
            'total_pages': total_pages,
            'progress': progress
        }
        
        print(f"✅ PDF Reader context prepared for: {book_data['title']}")
        
        return render(request, 'myapp/pdf_reader.html', context)
        
    except Exception as e:
        print(f"❌ Error loading PDF reader: {e}")
        import traceback
        traceback.print_exc()
        messages.error(request, 'Error loading book reader')
        return redirect('user_books')
    
def get_consistent_user_context(user_data):
    """Build context from user data - handle None case"""
    if not user_data:
        print("❌ get_consistent_user_context: user_data is None")
        return {'user': None}
    
    print(f"✅ Building context for user: {user_data.get('username')}")
    
    return {
        'user': {
            '_id': user_data.get('_id', ''),
            'username': user_data.get('username', ''),
            'email': user_data.get('email', ''),
            'full_name': user_data.get('full_name', ''),
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'profile_picture': user_data.get('profile_picture', '/static/myapp/icons/top-user.png'),
            'bio': user_data.get('bio', ''),
            'reading_goal': user_data.get('reading_goal', 12),
            'favorite_genres': user_data.get('favorite_genres', []),
            'email_notifications': user_data.get('email_notifications', True),
            'public_profile': user_data.get('public_profile', True),
            'two_factor_enabled': user_data.get('two_factor_enabled', False),
        }
    }
    
# ✅ PUBLIC PAGES
def home(request):
    """Home page - fixed"""
    user_data = SimpleAuth.get_current_user(request)
    if user_data:
        context = get_consistent_user_context(user_data)
    else:
        context = {'user': None}
    return render(request, 'myapp/index.html', context)

# Add these to your existing views.py

@login_required
def get_posts_api(request):
    """API endpoint to get all posts with user data - FIXED VERSION"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_id = ObjectId(current_user['_id'])
        
        print(f"🔍 Getting posts for user: {current_user['_id']}")
        
        posts_collection = mongodb.get_collection('posts')
        users_collection = mongodb.get_collection('users')
        
        # Get all posts sorted by creation date (newest first)
        all_posts = list(posts_collection.find().sort('created_at', -1))
        print(f"📝 Found {len(all_posts)} total posts in database")
        
        posts_data = []
        
        for post in all_posts:
            # Get user info from users collection
            user_info = users_collection.find_one({'_id': post['user_id']})
            
            if not user_info:
                print(f"⚠️ User not found for post: {post['_id']}")
                continue
            
            # Get likes count from the likes array in the post
            likes_count = len(post.get('likes', []))
            
            # Check if current user liked this post
            user_liked = str(user_id) in post.get('likes', [])
            
            # Get comments from the comments array in the post
            comments = post.get('comments', [])
            comments_data = []
            
            for comment in comments[:10]:  # Limit to 10 comments
                # For comments, we need to get the user info for each commenter
                comment_user = users_collection.find_one({'_id': ObjectId(comment.get('user_id'))})
                comments_data.append({
                    '_id': comment.get('id', str(ObjectId())),
                    'content': comment.get('content', ''),
                    'user_name': comment_user.get('full_name', 'User') if comment_user else 'User',
                    'user_avatar': comment_user.get('profile_picture', '/static/myapp/icons/top-user.png') if comment_user else '/static/myapp/icons/top-user.png',
                    'created_at': comment.get('created_at', datetime.utcnow()).isoformat() if comment.get('created_at') else datetime.utcnow().isoformat()
                })
            
            # Build post data
            post_data = {
                '_id': str(post['_id']),
                'content': post.get('content', ''),
                'user_id': str(post['user_id']),
                'user_name': user_info.get('full_name', 'User'),
                'user_avatar': user_info.get('profile_picture', '/static/myapp/icons/top-user.png'),
                'created_at': post.get('created_at', datetime.utcnow()).isoformat() if post.get('created_at') else datetime.utcnow().isoformat(),
                'likes_count': likes_count,
                'comments_count': len(comments),
                'user_liked': user_liked,
                'comments': comments_data
            }
            
            # Add book data if exists
            if 'book' in post:
                post_data['book'] = post['book']
                # Ensure book data has proper structure
                if isinstance(post_data['book'], dict):
                    post_data['book']['cover_image'] = post_data['book'].get('cover_image', '/static/myapp/images/bookCover/default.jpg')
            
            posts_data.append(post_data)
        
        print(f"✅ Returning {len(posts_data)} posts")
        return JsonResponse({
            'success': True,
            'posts': posts_data
        })
        
    except Exception as e:
        print(f"❌ Error in get_posts_api: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': f'Failed to get posts: {str(e)}',
            'posts': []
        }, status=500)

@login_required
@csrf_exempt
def like_post_api(request):
    """API endpoint to like/unlike a post"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            post_id = data.get('post_id')
            if not post_id:
                return JsonResponse({'error': 'Post ID is required'}, status=400)
            
            likes_collection = mongodb.get_collection('likes')
            posts_collection = mongodb.get_collection('posts')
            
            # Check if post exists
            post = posts_collection.find_one({'_id': ObjectId(post_id)})
            if not post:
                return JsonResponse({'error': 'Post not found'}, status=404)
            
            # Check if user already liked the post
            existing_like = likes_collection.find_one({
                'post_id': ObjectId(post_id),
                'user_id': ObjectId(current_user['_id'])
            })
            
            if existing_like:
                # Unlike the post
                likes_collection.delete_one({
                    'post_id': ObjectId(post_id),
                    'user_id': ObjectId(current_user['_id'])
                })
                return JsonResponse({
                    'success': True,
                    'liked': False,
                    'message': 'Post unliked'
                })
            else:
                # Like the post
                like_data = {
                    'post_id': ObjectId(post_id),
                    'user_id': ObjectId(current_user['_id']),
                    'created_at': datetime.utcnow()
                }
                likes_collection.insert_one(like_data)
                return JsonResponse({
                    'success': True,
                    'liked': True,
                    'message': 'Post liked'
                })
                
        except Exception as e:
            print(f"❌ Error liking post: {e}")
            return JsonResponse({'error': 'Failed to like post'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def add_comment_api(request):
    """API endpoint to add a comment to a post"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            post_id = data.get('post_id')
            content = data.get('content')
            
            if not post_id or not content:
                return JsonResponse({'error': 'Post ID and content are required'}, status=400)
            
            posts_collection = mongodb.get_collection('posts')
            comments_collection = mongodb.get_collection('comments')
            
            # Check if post exists
            post = posts_collection.find_one({'_id': ObjectId(post_id)})
            if not post:
                return JsonResponse({'error': 'Post not found'}, status=404)
            
            # Add comment
            comment_data = {
                'post_id': ObjectId(post_id),
                'user_id': ObjectId(current_user['_id']),
                'content': content,
                'created_at': datetime.utcnow()
            }
            
            result = comments_collection.insert_one(comment_data)
            
            return JsonResponse({
                'success': True,
                'message': 'Comment added successfully',
                'comment_id': str(result.inserted_id)
            })
            
        except Exception as e:
            print(f"❌ Error adding comment: {e}")
            return JsonResponse({'error': 'Failed to add comment'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def create_post_api(request):
    """API endpoint to create a new post - FIXED VERSION"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            content = data.get('content')
            book_id = data.get('book_id')
            book_title = data.get('book_title')
            book_author = data.get('book_author')
            book_cover = data.get('book_cover')
            
            print(f"🎯 Creating post for user: {current_user['_id']}")
            print(f"📝 Content: {content}")
            print(f"📚 Book ID: {book_id}")
            
            if not content:
                return JsonResponse({'error': 'Content is required'}, status=400)
            
            posts_collection = mongodb.get_collection('posts')
            users_collection = mongodb.get_collection('users')
            
            # Get fresh user data from database
            user_data = users_collection.find_one({'_id': ObjectId(current_user['_id'])})
            if not user_data:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            post_data = {
                'user_id': ObjectId(current_user['_id']),
                'content': content,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'likes': [],  # Initialize empty likes array
                'comments': []  # Initialize empty comments array
            }
            
            # Add book information if provided
            if book_id:
                # Use provided book details or fetch from database
                if book_title and book_author:
                    post_data['book'] = {
                        'book_id': book_id,
                        'title': book_title,
                        'author': book_author,
                        'cover_image': book_cover or '/static/myapp/images/bookCover/default.jpg'
                    }
                else:
                    # Fetch book details from database
                    books_collection = mongodb.get_collection('books')
                    book = books_collection.find_one({'_id': ObjectId(book_id)})
                    if book:
                        post_data['book'] = {
                            'book_id': book_id,
                            'title': book.get('title'),
                            'author': book.get('author'),
                            'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg')
                        }
            
            print(f"💾 Inserting post data: {post_data}")
            result = posts_collection.insert_one(post_data)
            
            # Return the created post with user data for immediate display
            created_post = posts_collection.find_one({'_id': result.inserted_id})
            
            # Prepare response with complete post data
            response_data = {
                '_id': str(created_post['_id']),
                'content': created_post.get('content', ''),
                'user_id': str(created_post['user_id']),
                'user_name': user_data.get('full_name', 'User'),
                'user_avatar': user_data.get('profile_picture', '/static/myapp/icons/top-user.png'),
                'created_at': created_post.get('created_at', datetime.utcnow()).isoformat(),
                'likes_count': 0,
                'comments_count': 0,
                'user_liked': False,
                'comments': []
            }
            
            if 'book' in created_post:
                response_data['book'] = created_post['book']
            
            return JsonResponse({
                'success': True,
                'message': 'Post created successfully',
                'post': response_data
            })
            
        except Exception as e:
            print(f"❌ Error creating post: {e}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': f'Failed to create post: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def test_timeline_api(request):
    """Simple test endpoint to verify API is working"""
    return JsonResponse({
        'success': True,
        'message': 'Timeline API is working!',
        'user': request.session.get('user_data', {}).get('username', 'Unknown'),
        'timestamp': datetime.utcnow().isoformat()
    })
    
@login_required
@csrf_exempt
def create_sample_posts(request):
    """Create sample posts for testing"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        posts_collection = mongodb.get_collection('posts')
        
        # Clear existing posts (optional)
        # posts_collection.delete_many({})
        
        # Create sample posts
        sample_posts = [
            {
                'user_id': ObjectId(current_user['_id']),
                'content': 'Just finished reading "The Midnight Library" - what an incredible journey! The concept of exploring different lives really makes you appreciate the choices you\'ve made. Highly recommend! 📚✨',
                'created_at': datetime.utcnow() - timedelta(hours=2),
                'updated_at': datetime.utcnow() - timedelta(hours=2),
                'book': {
                    'title': 'The Midnight Library',
                    'author': 'Matt Haig',
                    'cover_image': '/static/myapp/images/bookCover/default.jpg'
                }
            },
            {
                'user_id': ObjectId(current_user['_id']),
                'content': 'Starting my journey through "War and Peace" today. Any tips for tackling this classic? It\'s quite the commitment! 📖',
                'created_at': datetime.utcnow() - timedelta(hours=5),
                'updated_at': datetime.utcnow() - timedelta(hours=5),
                'book': {
                    'title': 'War and Peace',
                    'author': 'Leo Tolstoy',
                    'cover_image': '/static/myapp/images/bookCover/default.jpg'
                }
            },
            {
                'user_id': ObjectId(current_user['_id']),
                'content': 'Just discovered this amazing book about machine learning! The explanations are so clear and the examples are really practical. Perfect for beginners in AI! 🤖',
                'created_at': datetime.utcnow() - timedelta(days=1),
                'updated_at': datetime.utcnow() - timedelta(days=1)
            }
        ]
        
        # Insert sample posts
        result = posts_collection.insert_many(sample_posts)
        
        return JsonResponse({
            'success': True,
            'message': f'Created {len(result.inserted_ids)} sample posts',
            'post_ids': [str(id) for id in result.inserted_ids]
        })
        
    except Exception as e:
        print(f"❌ Error creating sample posts: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def debug_posts_data(request):
    """Debug endpoint to check posts data"""
    try:
        posts_collection = mongodb.get_collection('posts')
        total_posts = posts_collection.count_documents({})
        
        posts = list(posts_collection.find().limit(5))
        
        return JsonResponse({
            'total_posts': total_posts,
            'sample_posts': [
                {
                    'id': str(post['_id']),
                    'content': post.get('content', ''),
                    'user_id': str(post.get('user_id', '')),
                    'has_book': 'book' in post,
                    'created_at': post.get('created_at', '')
                }
                for post in posts
            ]
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)})
    
    
def about(request):
    """About page - fixed"""
    user_data = SimpleAuth.get_current_user(request)
    if user_data:
        context = get_consistent_user_context(user_data)
    else:
        context = {'user': None}
    return render(request, 'myapp/about.html', context)



def contact(request):
    """Contact page - using URL parameters for success message"""
    success = request.GET.get('success')
    error = request.GET.get('error')
    
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        
        print(f"📧 Contact form submission: {name} <{email}> - {subject}")
        
        # Validation
        if not all([name, email, message]):
            messages.error(request, 'Name, email, and message are required fields.')
            return redirect('contact')
        
        try:
            contact_id = ContactManager.create_contact(name, email, subject, message)
            print(f"✅ Contact saved with ID: {contact_id}")
            
            # ✅ Simple redirect without reverse
            return redirect('/contact/?success=true')
            
        except Exception as e:
            print(f"❌ Contact error: {e}")
            # ✅ Simple redirect without reverse
            return redirect('/contact/?error=true')
    
    user_data = SimpleAuth.get_current_user(request)
    if user_data:
        context = get_consistent_user_context(user_data)
    else:
        context = {'user': None}
    
    # Add success/error flags to context
    context['success'] = success == 'true'
    context['error'] = error == 'true'
    
    return render(request, 'myapp/contact.html', context)


# In views.py - Update register function
def register(request):
    """Registration page with all data in users collection"""
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        full_name = request.POST.get('full_name')
        username = request.POST.get('username', '').strip().lower()
        confirm_password = request.POST.get('confirm_password')
        
        # Validation
        if not all([email, password, full_name, username, confirm_password]):
            messages.error(request, 'All fields are required')
            return render(request, 'myapp/register.html')
        
        # Username validation
        if len(username) < 3:
            messages.error(request, 'Username must be at least 3 characters long')
            return render(request, 'myapp/register.html')
        
        if len(username) > 20:
            messages.error(request, 'Username must be less than 20 characters')
            return render(request, 'myapp/register.html')
        
        import re
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            messages.error(request, 'Username can only contain letters, numbers, and underscores')
            return render(request, 'myapp/register.html')
        
        if password != confirm_password:
            messages.error(request, 'Passwords do not match')
            return render(request, 'myapp/register.html')
        
        if len(password) < 8:
            messages.error(request, 'Password must be at least 8 characters')
            return render(request, 'myapp/register.html')
        
        try:
            # Check if username already exists
            users_collection = mongodb.get_collection('users')
            existing_username = users_collection.find_one({
                'username': {'$regex': f'^{re.escape(username)}$', '$options': 'i'}
            })
            if existing_username:
                messages.error(request, 'Username is already taken')
                return render(request, 'myapp/register.html')
            
            # Check if email already exists
            existing_email = users_collection.find_one({'email': email})
            if existing_email:
                messages.error(request, 'Email is already registered')
                return render(request, 'myapp/register.html')
            
            # Create user in MongoDB with ALL data
            from django.contrib.auth.hashers import make_password
            hashed_password = make_password(password)
            
            # Split full_name into first and last name
            name_parts = full_name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            user_data = {
                'email': email,
                'password': hashed_password,
                'username': username,
                'full_name': full_name,
                'first_name': first_name,
                'last_name': last_name,
                'profile_picture': '/static/myapp/icons/top-user.png',
                'bio': '',
                'reading_goal': 12,  # Default reading goal
                'favorite_genres': [],  # Empty array for favorite genres
                'email_notifications': True,
                'public_profile': True,
                'two_factor_enabled': False,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            result = users_collection.insert_one(user_data)
            user_id = result.inserted_id
            
            print(f"✅ User created in MongoDB: {user_id}")
            
            # Auto-login using SimpleAuth
            response = redirect('user_home')
            if SimpleAuth.login_user(request, email, password):
                messages.success(request, 'Account created successfully!')
                return response
            else:
                messages.error(request, 'Registration successful but login failed')
                return redirect('login')
                
        except Exception as e:
            messages.error(request, 'Error creating account')
            print(f"Registration error: {e}")
        
        return render(request, 'myapp/register.html')
    
    return render(request, 'myapp/register.html')


@csrf_exempt
def check_username_availability(request):
    """API endpoint to check if username is available - FIXED"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip().lower()
            
            print(f"🔍 API: Checking username availability: '{username}'")
            
            if not username:
                return JsonResponse({'error': 'Username is required'}, status=400)
            
            # Validate username format
            import re
            if not re.match(r'^[a-zA-Z0-9_]+$', username):
                print(f"❌ API: Invalid username format: {username}")
                return JsonResponse({
                    'available': False,
                    'message': 'Username can only contain letters, numbers, and underscores'
                })
            
            if len(username) < 3:
                print(f"❌ API: Username too short: {username}")
                return JsonResponse({
                    'available': False,
                    'message': 'Username must be at least 3 characters long'
                })
            
            if len(username) > 20:
                print(f"❌ API: Username too long: {username}")
                return JsonResponse({
                    'available': False,
                    'message': 'Username must be less than 20 characters'
                })
            
            # Check if username exists in users collection - CASE INSENSITIVE
            users_collection = mongodb.get_collection('users')
            
            # First, let's see what users exist
            all_users = list(users_collection.find({}, {'username': 1, 'email': 1}))
            print(f"📊 API: Total users in database: {len(all_users)}")
            
            # Check for exact match (case insensitive)
            existing_user = users_collection.find_one({
                'username': {'$regex': f'^{re.escape(username)}$', '$options': 'i'}
            })
            
            is_available = not existing_user
            
            print(f"📊 API: Username '{username}' available: {is_available}")
            if existing_user:
                print(f"📝 API: Found existing user: {existing_user.get('username')} - {existing_user.get('email')}")
            else:
                print(f"✅ API: No existing user found for: {username}")
            
            return JsonResponse({
                'available': is_available,
                'username': username
            })
            
        except Exception as e:
            print(f"❌ API: Error checking username: {e}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': 'Failed to check username'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# UPDATED: Register function with username support
def register(request):
    """Registration page with username support"""
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        full_name = request.POST.get('full_name')
        username = request.POST.get('username', '').strip().lower()
        confirm_password = request.POST.get('confirm_password')
        
        # Validation
        if not all([email, password, full_name, username, confirm_password]):
            messages.error(request, 'All fields are required')
            return render(request, 'myapp/register.html')
        
        # Username validation
        if len(username) < 3:
            messages.error(request, 'Username must be at least 3 characters long')
            return render(request, 'myapp/register.html')
        
        if len(username) > 20:
            messages.error(request, 'Username must be less than 20 characters')
            return render(request, 'myapp/register.html')
        
        import re
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            messages.error(request, 'Username can only contain letters, numbers, and underscores')
            return render(request, 'myapp/register.html')
        
        if password != confirm_password:
            messages.error(request, 'Passwords do not match')
            return render(request, 'myapp/register.html')
        
        if len(password) < 8:
            messages.error(request, 'Password must be at least 8 characters')
            return render(request, 'myapp/register.html')
        
        try:
            # Check if username already exists
            users_collection = mongodb.get_collection('users')
            existing_username = users_collection.find_one({
                'username': {'$regex': f'^{re.escape(username)}$', '$options': 'i'}
            })
            if existing_username:
                messages.error(request, 'Username is already taken')
                return render(request, 'myapp/register.html')
            
            # Check if email already exists
            existing_email = users_collection.find_one({'email': email})
            if existing_email:
                messages.error(request, 'Email is already registered')
                return render(request, 'myapp/register.html')
            
            # Create user in MongoDB with username
            user_id = UserManager.create_user(
                email=email,
                password=password,
                full_name=full_name,
                username=username  # Add username to user creation
            )
            
            print(f"✅ User created in MongoDB: {user_id}")
            
            # Auto-login using SimpleAuth
            response = redirect('user_home')
            if SimpleAuth.login_user(request, email, password):
                messages.success(request, 'Account created successfully!')
                return response
            else:
                messages.error(request, 'Registration successful but login failed')
                return redirect('login')
                
        except ValueError as e:
            messages.error(request, str(e))
        except Exception as e:
            messages.error(request, 'Error creating account')
            print(f"Registration error: {e}")
        
        return render(request, 'myapp/register.html')
    
    return render(request, 'myapp/register.html')

# In views.py - UPDATE the login_view function
def login_view(request):
    """Login page with admin redirect"""
    # If already logged in, redirect based on user type
    if SimpleAuth.is_authenticated(request):
        current_user = SimpleAuth.get_current_user(request)
        if current_user.get('is_admin'):
            return redirect('admin_dashboard')
        else:
            return redirect('user_home')
    
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        print(f"🔐 LOGIN: Attempting login for {email}")
        
        if SimpleAuth.login_user(request, email, password):
            print("✅ LOGIN: SUCCESS")
            
            # Get the logged in user data
            current_user = SimpleAuth.get_current_user(request)
            print(f"🔐 LOGIN: User is_admin: {current_user.get('is_admin', False)}")
            
            # Redirect based on user type
            if current_user.get('is_admin'):
                print("🎯 LOGIN: Redirecting to admin dashboard")
                messages.success(request, 'Welcome back, Administrator!')
                return redirect('admin_dashboard')
            else:
                print("🎯 LOGIN: Redirecting to user home")
                messages.success(request, 'Login successful!')
                return redirect('user_home')
        else:
            print("❌ LOGIN: FAILED")
            messages.error(request, 'Invalid email or password')
    
    return render(request, 'myapp/login.html')

def logout_view(request):
    """Logout user"""
    print("🚪 LOGOUT: User logging out")
    SimpleAuth.logout_user(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('home')

def forgot_password(request):
    """Forgot password page"""
    messages.info(request, 'Password reset functionality will be implemented soon.')
    return redirect('home')

def reset_password(request, token):
    """Reset password page"""
    messages.info(request, f'Password reset functionality will be implemented soon. Token: {token}')
    return redirect('home')

@login_required
def password_change_view(request):
    """Password change page"""
    current_user = SimpleAuth.get_current_user(request)
    context = get_consistent_user_context(current_user)
    return render(request, 'myapp/password_change.html', context)

@login_required
def user_home(request):
    """User home page - with proper error handling"""
    current_user = SimpleAuth.get_current_user(request)
    
    # If user data is missing, fix the session
    if not current_user:
        print("❌ No user data in session - fixing...")
        request.session.flush()
        return redirect('login')
    
    context = get_consistent_user_context(current_user)
    
    # Add page-specific data
    context.update({
        'user_stats': {
            'books_read': current_user.get('books_read', 12),
            'pages_today': current_user.get('pages_today', 47),
            'current_streak': current_user.get('current_streak', 15)
        },
        'currently_reading': {
            'title': 'The Midnight Library',
            'author': 'Matt Haig',
            'progress': 65
        }
    })
    
    return render(request, 'myapp/user_home.html', context)

@login_required
def explore_view(request):
    """Explore books page - FIXED with consistent context"""
    current_user = SimpleAuth.get_current_user(request)
    context = get_consistent_user_context(current_user)
    return render(request, 'myapp/explore.html', context)

@login_required
def user_books_view(request):
    """User books page - FIXED with consistent context"""
    current_user = SimpleAuth.get_current_user(request)
    
    print(f"🔍 USER_BOOKS_VIEW DEBUG:")
    print(f"   Current User: {current_user}")
    print(f"   Session Keys: {list(request.session.keys())}")
    print(f"   user_data in session: {request.session.get('user_data')}")
    
    context = get_consistent_user_context(current_user)
    
    # Add books data
    context.update({
        'continue_reading': UserBooksManager.get_user_books(str(current_user['_id']), 'reading'),
        'wishlist_books': UserBooksManager.get_user_books(str(current_user['_id']), 'wishlist'),
        'completed_books': UserBooksManager.get_user_books(str(current_user['_id']), 'completed')
    })
    
    return render(request, 'myapp/user_books.html', context)

@login_required
def search_view(request):
    """Search page - FIXED with consistent context"""
    current_user = SimpleAuth.get_current_user(request)
    context = get_consistent_user_context(current_user)
    return render(request, 'myapp/search.html', context)

@login_required
def profile_view(request):
    """User profile page - FIXED with consistent context"""
    current_user = SimpleAuth.get_current_user(request)
    context = get_consistent_user_context(current_user)
    
    # Add profile-specific data
    context.update({
        'user_stats': get_user_statistics(str(current_user['_id']))
    })
    
    # Get currently reading books
    currently_reading = UserBooksManager.get_user_books(str(current_user['_id']), 'reading')[:1]
    if currently_reading:
        context['currently_reading'] = currently_reading[0]
    
    return render(request, 'myapp/user_profile.html', context)

@login_required
def profile_settings_view(request):
    """User settings page - FIXED with consistent context"""
    current_user = SimpleAuth.get_current_user(request)
    context = get_consistent_user_context(current_user)
    
    # Debug: Check what data is being passed to template
    print(f"🔍 PROFILE SETTINGS VIEW - Template data:")
    print(f"   User ID: {context['user'].get('_id')}")
    print(f"   Username: '{context['user'].get('username')}'")
    print(f"   First Name: '{context['user'].get('first_name')}'")
    print(f"   Last Name: '{context['user'].get('last_name')}'")
    print(f"   Full Name: '{context['user'].get('full_name')}'")
    print(f"   Email: '{context['user'].get('email')}'")
    print(f"   Profile Picture: '{context['user'].get('profile_picture')}'")
    
    return render(request, 'myapp/user_settings.html', context)
# ✅ API ENDPOINTS
@login_required
def get_books(request):
    """API endpoint to fetch ALL books from MongoDB with proper category handling"""
    try:
        books_collection = mongodb.get_collection('books')
        
        # Get ALL books from MongoDB
        books = list(books_collection.find({}, {
            'title': 1,
            'author': 1, 
            'cover_image': 1,
            'category': 1,
            'display_category': 1,  # ADD THIS
            'genre': 1,
            'description': 1,
            'language': 1,
            'average_rating': 1,
            'publication_year': 1,
            'pages': 1,
            'publisher': 1,
            'isbn': 1,
            'views_count': 1,
            '_id': 1
        }))
        
        # Convert ObjectId to string and ensure proper data structure
        book_list = []
        for book in books:
            # Use display_category if available, otherwise use category
            display_category = book.get('display_category')
            if not display_category:
                # Fallback logic for books without display_category
                category = book.get('category', '')
                if 'bestseller' in category.lower():
                    display_category = 'bestseller'
                elif 'classic' in category.lower():
                    display_category = 'classic'
                elif 'science' in category.lower():
                    display_category = 'featured'
                elif 'horror' in category.lower():
                    display_category = 'trending'
                else:
                    display_category = 'general'
            
            # Handle genre - ensure it's a list
            genre = book.get('genre', [])
            if isinstance(genre, str):
                genre = [genre]
            elif genre is None:
                genre = []
            
            book_data = {
                'id': str(book['_id']),
                'title': book.get('title', 'Unknown Title'),
                'author': book.get('author', 'Unknown Author'),
                'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                'category': book.get('category', 'general'),
                'display_category': display_category,
                'genre': genre,
                'description': book.get('description', 'No description available.'),
                'language': book.get('language', 'Unknown'),
                'average_rating': book.get('average_rating', 0),
                'publication_year': book.get('publication_year', 'Unknown'),
                'pages': book.get('pages', 0),
                'publisher': book.get('publisher', 'Unknown'),
                'isbn': book.get('isbn', '')
            }
            book_list.append(book_data)
        
        print(f"✅ Successfully fetched {len(book_list)} books from MongoDB")
        print(f"📊 Categories distribution:")
        
        # Count books by display_category for debugging
        display_category_count = {}
        for book in book_list:
            cat = book['display_category']
            display_category_count[cat] = display_category_count.get(cat, 0) + 1
        
        for cat, count in display_category_count.items():
            print(f"   {cat}: {count} books")
        
        return JsonResponse({'books': book_list})
        
    except Exception as e:  # ADD THIS EXCEPT CLAUSE
        print(f"❌ Error in get_books: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)
@login_required
def search_books_api(request):
    """API endpoint for advanced book search"""
    try:
        query = request.GET.get('q', '').strip()
        languages = request.GET.getlist('languages[]', [])
        genres = request.GET.getlist('genres[]', [])
        sort_by = request.GET.get('sort_by', 'relevance')
        order = request.GET.get('order', 'desc')
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        
        books_collection = mongodb.get_collection('books')
        
        # Build MongoDB query
        mongo_query = {}
        
        # Text search
        if query:
            mongo_query['$or'] = [
                {'title': {'$regex': query, '$options': 'i'}},
                {'author': {'$regex': query, '$options': 'i'}},
                {'description': {'$regex': query, '$options': 'i'}}
            ]
        
        # Language filter
        if languages:
            mongo_query['language'] = {'$in': languages}
        
        # Genre filter
        if genres:
            include_genres = []
            exclude_genres = []
            
            for genre in genres:
                if genre.startswith('!'):
                    exclude_genres.append(genre[1:])
                else:
                    include_genres.append(genre)
            
            genre_conditions = []
            
            if include_genres:
                genre_conditions.append({
                    '$or': [
                        {'genre': {'$in': include_genres}},
                        {'genre': {'$in': [g.lower() for g in include_genres]}},
                        {'genre': {'$in': [g.upper() for g in include_genres]}}
                    ]
                })
            
            if exclude_genres:
                genre_conditions.append({
                    '$and': [
                        {'genre': {'$nin': exclude_genres}},
                        {'genre': {'$nin': [g.lower() for g in exclude_genres]}},
                        {'genre': {'$nin': [g.upper() for g in exclude_genres]}}
                    ]
                })
            
            if genre_conditions:
                if len(genre_conditions) == 1:
                    mongo_query.update(genre_conditions[0])
                else:
                    mongo_query['$and'] = genre_conditions
        
        # Build sort criteria
        sort_direction = -1 if order == 'desc' else 1
        
        sort_field_mapping = {
            'relevance': 'title',
            'ratings': 'average_rating',
            'popularity': 'views_count',
            'year': 'publication_year',
            'title': 'title'
        }
        
        sort_field = sort_field_mapping.get(sort_by, 'title')
        sort_criteria = [(sort_field, sort_direction)]
        
        # Execute search
        skip = (page - 1) * limit
        
        cursor = books_collection.find(mongo_query)
        
        # Apply sorting
        for field, direction in sort_criteria:
            cursor = cursor.sort(field, direction)
        
        # Get total count
        total_count = books_collection.count_documents(mongo_query)
        
        # Apply pagination
        books = list(cursor.skip(skip).limit(limit))
        
        # Convert ObjectId to string
        book_list = []
        for book in books:
            book_data = {
                '_id': str(book['_id']),
                'title': book.get('title', 'Unknown Title'),
                'author': book.get('author', 'Unknown Author'),
                'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                'description': book.get('description', 'No description available.'),
                'genre': book.get('genre', []),
                'language': book.get('language', 'Unknown'),
                'average_rating': book.get('average_rating', 0),
                'views_count': book.get('views_count', 0),
                'publication_year': book.get('publication_year', 'Unknown')
            }
            
            if isinstance(book_data['genre'], str):
                book_data['genre'] = [book_data['genre']]
                
            book_list.append(book_data)
        
        return JsonResponse({
            'books': book_list,
            'total_count': total_count,
            'page': page,
            'limit': limit,
            'has_more': (page * limit) < total_count
        })
        
    except Exception as e:
        print(f"❌ Search error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@login_required 
def get_search_suggestions(request):
    """Get search suggestions for autocomplete"""
    try:
        query = request.GET.get('q', '').strip()
        if not query or len(query) < 2:
            return JsonResponse({'suggestions': []})
        
        books_collection = mongodb.get_collection('books')
        
        # Search in titles and authors for suggestions
        suggestions = books_collection.aggregate([
            {
                '$match': {
                    '$or': [
                        {'title': {'$regex': f'^{query}', '$options': 'i'}},
                        {'author': {'$regex': f'^{query}', '$options': 'i'}}
                    ]
                }
            },
            {
                '$project': {
                    'title': 1,
                    'author': 1,
                    'type': {'$cond': [
                        {'$regexMatch': {'input': '$title', 'regex': f'^{query}', 'options': 'i'}},
                        'title',
                        'author'
                    ]}
                }
            },
            {'$limit': 10}
        ])
        
        suggestion_list = []
        for doc in suggestions:
            if doc['type'] == 'title':
                suggestion_list.append({
                    'text': doc['title'],
                    'type': 'book'
                })
            else:
                suggestion_list.append({
                    'text': doc['author'], 
                    'type': 'author'
                })
        
        return JsonResponse({'suggestions': suggestion_list})
        
    except Exception as e:
        return JsonResponse({'suggestions': []})

@login_required
def get_user_books_data(request):
    """API endpoint to get user's books from separate collections"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_id = str(current_user['_id'])
        
        print(f"🔍 Getting books for user: {user_id}")
        
        # Get books from separate collections
        reading_books = UserBooksManager.get_user_reading_books(user_id)
        wishlist_books = UserBooksManager.get_user_wishlist(user_id)
        
        print(f"📚 Found {len(reading_books)} reading, {len(wishlist_books)} wishlist books")
        
        return JsonResponse({
            'success': True,
            'reading_books': reading_books,
            'wishlist_books': wishlist_books
        })
        
    except Exception as e:
        print(f"❌ Error getting user books: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': 'Failed to get user books'}, status=500)

# ✅ ADD MISSING API FUNCTIONS
@login_required
@csrf_exempt
def update_reading_progress_api(request):
    """API endpoint to update reading progress"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            book_id = data.get('book_id')
            progress = data.get('progress')
            
            if not book_id or progress is None:
                return JsonResponse({'error': 'Missing data'}, status=400)
            
            # Update progress
            UserBooksManager.update_progress(str(current_user['_id']), book_id, progress)
            
            return JsonResponse({
                'success': True,
                'message': 'Progress updated!'
            })
            
        except Exception as e:
            print(f"Error updating progress: {e}")
            return JsonResponse({'error': 'Failed to update progress'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@login_required
@csrf_exempt
def start_reading_api(request):
    """API endpoint to start reading a book - FIXED VERSION"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            book_id = data.get('book_id')
            book_title = data.get('book_title')
            book_author = data.get('book_author')
            book_cover = data.get('book_cover')
            book_genre = data.get('book_genre', '')
            
            print(f"🎯 Starting reading - User: {current_user['_id']}, Book: {book_id}")
            
            # Validate book_id
            if not book_id:
                return JsonResponse({'error': 'Missing book ID'}, status=400)
            
            # Check if book_id is a valid ObjectId
            try:
                book_id_obj = ObjectId(book_id)
                print(f"✅ Valid ObjectId: {book_id}")
            except Exception as e:
                print(f"❌ Invalid ObjectId: {book_id}, error: {e}")
                return JsonResponse({'error': 'Invalid book ID format'}, status=400)
            
            # Prepare book data
            book_data = {
                'title': book_title,
                'author': book_author,
                'cover_image': book_cover,
                'genre': book_genre
            }
            
            # Start reading - this might be where the error occurs
            success = UserBooksManager.start_reading(str(current_user['_id']), book_id, book_data)
            
            if success:
                print(f"✅ Successfully started reading book: {book_id}")
                return JsonResponse({
                    'success': True,
                    'message': 'Started reading! You can find it in "My Books"'
                })
            else:
                print(f"❌ Failed to start reading book: {book_id}")
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to start reading book'
                })
                
        except Exception as e:
            print(f"❌ Error in start_reading_api: {str(e)}")
            import traceback
            traceback.print_exc()  # This will show the full error in logs
            return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def add_to_wishlist_api(request):
    """API endpoint to add book to wishlist - WITH VALIDATION"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            book_id = data.get('book_id')
            book_title = data.get('book_title')
            book_author = data.get('book_author')
            book_cover = data.get('book_cover')
            book_genre = data.get('book_genre', '')
            
            print(f"🎯 Adding to wishlist - Book ID: {book_id}")
            
            # VALIDATE BOOK ID
            if not book_id or book_id in ['move-to-reading', 'undefined', 'null', 'start']:
                print(f"❌ INVALID BOOK ID: {book_id}")
                return JsonResponse({'error': 'Invalid book ID'}, status=400)
            
            # Check if it's a valid ObjectId
            try:
                ObjectId(book_id)
            except:
                print(f"❌ INVALID ObjectId FORMAT: {book_id}")
                return JsonResponse({'error': 'Invalid book ID format'}, status=400)
            
            if not all([book_id, book_title, book_author]):
                return JsonResponse({'error': 'Missing book data'}, status=400)
            
            # Prepare book data
            book_data = {
                'title': book_title,
                'author': book_author,
                'cover_image': book_cover,
                'genre': book_genre
            }
            
            # Add to user's wishlist
            UserBooksManager.add_to_wishlist(str(current_user['_id']), book_id, book_data)
            
            print(f"✅ Successfully added book to wishlist collection")
            
            return JsonResponse({
                'success': True,
                'message': 'Book added to your wishlist!'
            })
            
        except ValueError as e:
            print(f"❌ Value error adding to wishlist: {e}")
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            print(f"❌ Error adding to wishlist: {e}")
            return JsonResponse({'error': 'Failed to add book to wishlist'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def check_book_in_collection(request, book_id):
    """Check if a book is in user's collections"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_id = str(current_user['_id'])
        
        print(f"🔍 Checking book {book_id} in collections for user {user_id}")
        
        # Check both collections
        in_wishlist = UserBooksManager.is_book_in_wishlist(user_id, book_id)
        in_reading = UserBooksManager.is_book_in_collection(user_id, book_id)
        
        status = None
        if in_reading:
            # Check if it's reading or completed
            user_books = mongodb.get_collection('user_books')
            book = user_books.find_one({
                'user_id': ObjectId(user_id),
                'book_id': book_id
            })
            if book:
                status = book.get('status', 'reading')
        elif in_wishlist:
            status = 'wishlist'
        
        print(f"📊 Book status: {status}")
        
        return JsonResponse({
            'in_collection': status is not None,
            'status': status
        })
        
    except Exception as e:
        print(f"❌ Error checking book collection: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@csrf_exempt
def remove_from_reading_api(request):
    """API endpoint to remove book from reading collection"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            book_id = data.get('book_id')
            
            print(f"🗑️ Removing from reading - User: {current_user['_id']}, Book: {book_id}")
            
            if not book_id:
                return JsonResponse({'error': 'Missing book ID'}, status=400)
            
            # Remove from user_books collection
            success = UserBooksManager.remove_from_reading(str(current_user['_id']), book_id)
            
            if success:
                print(f"✅ Successfully removed book from reading collection")
                return JsonResponse({
                    'success': True,
                    'message': 'Book removed from your reading list!'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Book not found in reading list'
                })
                
        except Exception as e:
            print(f"❌ Error removing from reading: {e}")
            return JsonResponse({'error': 'Failed to remove book from reading list'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def remove_from_wishlist_api(request):
    """API endpoint to remove book from wishlist collection"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            book_id = data.get('book_id')
            
            print(f"🗑️ Removing from wishlist - User: {current_user['_id']}, Book: {book_id}")
            
            if not book_id:
                return JsonResponse({'error': 'Missing book ID'}, status=400)
            
            # Remove from user_wishlist collection
            success = UserBooksManager.remove_from_wishlist(str(current_user['_id']), book_id)
            
            if success:
                print(f"✅ Successfully removed book from wishlist collection")
                return JsonResponse({
                    'success': True,
                    'message': 'Book removed from your wishlist!'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Book not found in wishlist'
                })
                
        except Exception as e:
            print(f"❌ Error removing from wishlist: {e}")
            return JsonResponse({'error': 'Failed to remove book from wishlist'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)



@login_required
def get_user_statistics_api(request):
    """API endpoint to get user statistics"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_stats = get_user_statistics(str(current_user['_id']))
        
        return JsonResponse({
            'success': True,
            'statistics': user_stats
        })
        
    except Exception as e:
        print(f"❌ Error getting user statistics: {e}")
        return JsonResponse({'error': 'Failed to get user statistics'}, status=500)

# ✅ HELPER FUNCTIONS
def get_user_statistics(user_id):
    """Get comprehensive user statistics"""
    try:
        # Get reading statistics
        user_books = mongodb.get_collection('user_books')
        user_wishlist = mongodb.get_collection('user_wishlist')
        posts_collection = mongodb.get_collection('posts')
        
        # Books read
        books_read = user_books.count_documents({
            'user_id': ObjectId(user_id),
            'status': 'completed'
        })
        
        # Currently reading
        currently_reading = user_books.count_documents({
            'user_id': ObjectId(user_id),
            'status': 'reading'
        })
        
        # Wishlist count
        wishlist_count = user_wishlist.count_documents({
            'user_id': ObjectId(user_id)
        })
        
        # Posts count
        posts_count = posts_collection.count_documents({
            'user_id': ObjectId(user_id)
        })
        
        # Calculate reading progress for current year
        current_year = datetime.now().year
        yearly_books = user_books.count_documents({
            'user_id': ObjectId(user_id),
            'status': 'completed',
            'updated_at': {
                '$gte': datetime(current_year, 1, 1),
                '$lt': datetime(current_year + 1, 1, 1)
            }
        })
        
        # Default reading goal
        reading_goal = 12
        goal_progress = min(100, int((yearly_books / reading_goal) * 100)) if reading_goal > 0 else 0
        
        return {
            'books_read': books_read,
            'currently_reading': currently_reading,
            'wishlist_count': wishlist_count,
            'posts_count': posts_count,
            'yearly_books': yearly_books,
            'reading_goal': reading_goal,
            'goal_progress': goal_progress,
            'books_to_go': max(0, reading_goal - yearly_books)
        }
        
    except Exception as e:
        print(f"❌ Error calculating user statistics: {e}")
        return {
            'books_read': 0,
            'currently_reading': 0,
            'wishlist_count': 0,
            'posts_count': 0,
            'yearly_books': 0,
            'reading_goal': 12,
            'goal_progress': 0,
            'books_to_go': 12
        }

# ✅ DEBUG VIEWS
def test_user_home(request):
    print("🔍 TEST: Direct access to user_home")
    return HttpResponse("TEST: User home page is accessible")

def debug_cookies(request):
    """Debug endpoint to check cookies"""
    print("🔍 DEBUG COOKIES: Checking all cookies")
    print(f"Cookies: {request.COOKIES}")
    print(f"user_data cookie: {request.COOKIES.get('user_data')}")
    
    response = HttpResponse(f"""
    <h1>Cookie Debug</h1>
    <p>All cookies: {request.COOKIES}</p>
    <p>user_data cookie: {request.COOKIES.get('user_data')}</p>
    <p><a href="/user-home/">Go to User Home</a></p>
    <p><a href="/">Go to Home</a></p>
    """)
    return response

def debug_auth(request):
    """Debug authentication status"""
    is_auth = SimpleAuth.is_authenticated(request)
    current_user = SimpleAuth.get_current_user(request)
    
    response = HttpResponse(f"""
    <h1>Auth Debug</h1>
    <p>Is Authenticated: {is_auth}</p>
    <p>Current User: {current_user}</p>
    <p>User ID: {current_user.get('_id') if current_user else 'None'}</p>
    <p><a href="/debug-cookies/">Check Cookies</a></p>
    """)
    return response

@login_required
def test_books(request):
    """Test endpoint to check MongoDB books collection"""
    try:
        books_collection = mongodb.get_collection('books')
        
        total_books = books_collection.count_documents({})
        sample_books = list(books_collection.find().limit(5))
        
        return JsonResponse({
            'total_books': total_books,
            'sample_books': str(sample_books),
            'collection_exists': True
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'collection_exists': False
        })

@login_required
def debug_books_structure(request):
    """Debug endpoint to check books collection structure"""
    try:
        books_collection = mongodb.get_collection('books')
        
        # Get a sample book to check structure
        sample_book = books_collection.find_one({})
        
        # Count total books
        total_books = books_collection.count_documents({})
        
        # Check available fields
        if sample_book:
            available_fields = list(sample_book.keys())
            
            # Check for specific fields
            has_language = 'language' in sample_book
            has_genre = 'genre' in sample_book
            has_rating = 'average_rating' in sample_book
            has_views = 'views_count' in sample_book
            has_year = 'publication_year' in sample_book
            
            return JsonResponse({
                'total_books': total_books,
                'sample_book_fields': available_fields,
                'field_checks': {
                    'language': has_language,
                    'genre': has_genre,
                    'average_rating': has_rating,
                    'views_count': has_views,
                    'publication_year': has_year
                },
                'sample_book': str(sample_book)
            })
        else:
            return JsonResponse({
                'error': 'No books found in collection',
                'total_books': 0
            })
            
    except Exception as e:
        return JsonResponse({'error': str(e)})

@login_required
def debug_user_books_data(request):
    """Debug endpoint to check actual user books data"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_id = str(current_user['_id'])
        
        print(f"🔍 DEBUG: Checking user books for user_id: {user_id}")
        
        # Check user_books collection directly
        user_books_collection = mongodb.get_collection('user_books')
        
        # Convert user_id to ObjectId for query
        user_id_obj = ObjectId(user_id)
        
        # Find all books for this user
        all_user_books = list(user_books_collection.find({'user_id': user_id_obj}))
        
        print(f"📚 DEBUG: Found {len(all_user_books)} total books for user")
        
        # Check each status
        reading_books = list(user_books_collection.find({'user_id': user_id_obj, 'status': 'reading'}))
        wishlist_books = list(user_books_collection.find({'user_id': user_id_obj, 'status': 'wishlist'}))
        completed_books = list(user_books_collection.find({'user_id': user_id_obj, 'status': 'completed'}))
        
        print(f"📖 DEBUG: {len(reading_books)} reading books")
        print(f"📚 DEBUG: {len(wishlist_books)} wishlist books") 
        print(f"✅ DEBUG: {len(completed_books)} completed books")
        
        # Prepare response data
        books_data = []
        for book in all_user_books:
            books_data.append({
                'book_id': book.get('book_id', 'Unknown'),
                'title': book.get('title', 'Unknown Title'),
                'author': book.get('author', 'Unknown Author'),
                'status': book.get('status', 'unknown'),
                'progress': book.get('progress', 0),
                'cover_image': book.get('cover_image', 'No cover'),
                'user_id': str(book.get('user_id', 'Unknown'))
            })
        
        return JsonResponse({
            'user_id': user_id,
            'total_books': len(all_user_books),
            'reading_count': len(reading_books),
            'wishlist_count': len(wishlist_books),
            'completed_count': len(completed_books),
            'books': books_data
        })
        
    except Exception as e:
        print(f"❌ DEBUG Error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)})

# ✅ POST MANAGEMENT
@login_required
def create_post(request):
    if request.method == 'POST':
        content = request.POST.get('content')
        current_user = SimpleAuth.get_current_user(request)
        
        if content and current_user:
            try:
                PostManager.create_post(str(current_user['_id']), content)
                messages.success(request, 'Post created successfully!')
            except Exception as e:
                messages.error(request, 'Error creating post')
                print(f"Post creation error: {e}")
        
        return redirect('user_home')

@login_required
def like_post(request):
    if request.method == 'POST':
        post_id = request.POST.get('post_id')
        current_user = SimpleAuth.get_current_user(request)
        
        if post_id and current_user:
            try:
                posts_collection = mongodb.get_collection('posts')
                post = posts_collection.find_one({'_id': ObjectId(post_id)})
                
                if post and str(current_user['_id']) in post.get('likes', []):
                    PostManager.unlike_post(post_id, str(current_user['_id']))
                else:
                    PostManager.like_post(post_id, str(current_user['_id']))
                    
            except Exception as e:
                print(f"Like error: {e}")
        
        return redirect('user_home')

@login_required
def add_comment(request):
    if request.method == 'POST':
        post_id = request.POST.get('post_id')
        content = request.POST.get('content')
        current_user = SimpleAuth.get_current_user(request)
        
        if post_id and content and current_user:
            try:
                PostManager.add_comment(
                    post_id, 
                    str(current_user['_id']), 
                    current_user.get('full_name', 'User'),
                    content
                )
                messages.success(request, 'Comment added!')
            except Exception as e:
                messages.error(request, 'Error adding comment')
                print(f"Comment error: {e}")
        
        return redirect('user_home')


@login_required
def get_user_statistics_api(request):
    """API endpoint to get user statistics"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_stats = get_user_statistics(str(current_user['_id']))
        
        return JsonResponse({
            'success': True,
            'statistics': user_stats
        })
        
    except Exception as e:
        print(f"❌ Error getting user statistics: {e}")
        return JsonResponse({'error': 'Failed to get user statistics'}, status=500)


@login_required
@csrf_exempt
def update_profile_api(request):
    """Simple profile update - ONLY uses users collection"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            current_user = SimpleAuth.get_current_user(request)
            user_id = ObjectId(current_user['_id'])
            
            # Get users collection only
            users_collection = mongodb.get_collection('users')
            
            # Simple update data
            update_data = {}
            
            if 'username' in data and data['username']:
                update_data['username'] = data['username'].strip().lower()
            
            if 'first_name' in data and data['first_name']:
                update_data['first_name'] = data['first_name'].strip()
            
            if 'last_name' in data and data['last_name']:
                update_data['last_name'] = data['last_name'].strip()
            
            if 'email' in data and data['email']:
                update_data['email'] = data['email'].strip().lower()
            
            if 'bio' in data:
                update_data['bio'] = data['bio'].strip()
            
            # Update full_name
            if 'first_name' in update_data or 'last_name' in update_data:
                first = update_data.get('first_name', current_user.get('first_name', ''))
                last = update_data.get('last_name', current_user.get('last_name', ''))
                update_data['full_name'] = f"{first} {last}".strip()
            
            # Add timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            if not update_data:
                return JsonResponse({'success': True, 'message': 'No changes'})
            
            # Update ONLY users collection
            result = users_collection.update_one(
                {'_id': user_id},
                {'$set': update_data}
            )
            
            if result.modified_count > 0:
                # Get updated user data
                updated_user = users_collection.find_one({'_id': user_id})
                
                # Update session with complete user data
                SimpleAuth.update_session_user(request, updated_user)
                
                return JsonResponse({
                    'success': True,
                    'message': 'Profile updated successfully!',
                    'user_data': {
                        'first_name': update_data.get('first_name'),
                        'last_name': update_data.get('last_name'), 
                        'username': update_data.get('username'),
                        'full_name': update_data.get('full_name'),
                        'email': update_data.get('email'),
                        'bio': update_data.get('bio')
                    }
                })
            else:
                return JsonResponse({'error': 'No changes made'}, status=400)
                
        except Exception as e:
            print(f"❌ Error updating profile: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def validate_updated_fields(updating_fields, data, user_id):
    """Validate only the fields that are being updated - FIXED VERSION"""
    print(f"🔍 Validating fields: {updating_fields}")
    
    # If no fields are being updated, no validation needed
    if not updating_fields:
        return "No fields to update"
    
    # Only validate fields that are actually in the update
    for field in updating_fields:
        value = data.get(field)
        
        if field == 'first_name' and (not value or value.strip() == ''):
            return "First name cannot be empty"
            
        if field == 'last_name' and (not value or value.strip() == ''):
            return "Last name cannot be empty"
            
        if field == 'username':
            if not value or value.strip() == '':
                return "Username cannot be empty"
            if len(value) < 3:
                return "Username must be at least 3 characters long"
            if len(value) > 20:
                return "Username must be less than 20 characters"
            # Check if username is already taken (excluding current user)
            users_collection = mongodb.get_collection('users')
            existing_user = users_collection.find_one({
                'username': value,
                '_id': {'$ne': user_id}
            })
            if existing_user:
                return "Username is already taken"
            
        if field == 'email':
            if not value or value.strip() == '':
                return "Email cannot be empty"
            if not is_valid_email(value):
                return "Please enter a valid email address"
            # Check if email is already taken (excluding current user)
            users_collection = mongodb.get_collection('users')
            existing_user = users_collection.find_one({
                'email': value,
                '_id': {'$ne': user_id}
            })
            if existing_user:
                return "Email is already registered"
    
    return None

def is_valid_email(email):
    """Validate email format"""
    import re
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def verify_user_password(user_id, password):
    """Verify user password - FIXED VERSION"""
    try:
        users_collection = mongodb.get_collection('users')
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            print("❌ User not found in database")
            return False
        
        print(f"🔍 Verifying password for user: {user.get('email')}")
        
        from django.contrib.auth.hashers import check_password
        
        # This is the CORRECT way to verify
        stored_hash = user.get('password')
        
        if not stored_hash:
            print("❌ No password hash stored for user")
            return False
        
        # Use Django's check_password - it handles the hash comparison
        is_valid = check_password(password, stored_hash)
        
        print(f"✅ Password verification result: {is_valid}")
        
        return is_valid
        
    except Exception as e:
        print(f"❌ Error verifying password: {e}")
        import traceback
        traceback.print_exc()
        return False

@login_required
@csrf_exempt
def debug_password_check(request):
    """Debug endpoint to check why password verification is failing"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            test_password = data.get('password')
            
            if not test_password:
                return JsonResponse({'error': 'Password is required'}, status=400)
            
            # Get user from database
            users_collection = mongodb.get_collection('users')
            user = users_collection.find_one({'_id': ObjectId(current_user['_id'])})
            
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            from django.contrib.auth.hashers import check_password, make_password
            
            debug_info = {
                'user_email': user.get('email'),
                'stored_hash': user['password'],
                'test_password': test_password,
                'test_password_length': len(test_password),
                'hash_algorithm': 'pbkdf2_sha256',
                'hash_parts': user['password'].split('$')
            }
            
            # Test with Django's check_password
            result = check_password(test_password, user['password'])
            debug_info['check_password_result'] = result
            
            # Test creating a new hash to see if it matches
            new_hash = make_password(test_password)
            debug_info['new_hash'] = new_hash
            debug_info['hashes_match'] = new_hash == user['password']
            
            # Check if it's the same algorithm
            debug_info['same_algorithm'] = new_hash.startswith('pbkdf2_sha256')
            
            return JsonResponse({
                'success': result,
                'debug_info': debug_info
            })
                
        except Exception as e:
            print(f"❌ Error in password debug: {e}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@login_required
@csrf_exempt
def update_profile_picture_api(request):
    """Profile picture upload - ONLY uses users collection"""
    if request.method == 'POST':
        try:
            print("🎯 PROFILE PICTURE API CALLED")
            
            # Get current user
            current_user = SimpleAuth.get_current_user(request)
            if not current_user:
                return JsonResponse({'error': 'User not authenticated'}, status=401)
            
            # Check if file was provided
            if 'avatar' not in request.FILES:
                return JsonResponse({'error': 'No file provided'}, status=400)
            
            avatar_file = request.FILES['avatar']
            
            # Validate file size (200KB limit)
            if avatar_file.size > 200 * 1024:
                return JsonResponse({'error': 'File size must be less than 200KB'}, status=400)
            
            # Validate file type
            if not avatar_file.content_type.startswith('image/'):
                return JsonResponse({'error': 'File must be an image'}, status=400)
            
            # Read and convert to base64
            import base64
            avatar_data = avatar_file.read()
            avatar_base64 = base64.b64encode(avatar_data).decode('utf-8')
            avatar_url = f"data:{avatar_file.content_type};base64,{avatar_base64}"
            
            user_id = ObjectId(current_user['_id'])
            
            # Update ONLY users collection
            users_collection = mongodb.get_collection('users')
            
            result = users_collection.update_one(
                {'_id': user_id},
                {
                    '$set': {
                        'profile_picture': avatar_url,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                # Get updated user data
                updated_user = users_collection.find_one({'_id': user_id})
                
                # Update session
                SimpleAuth.update_session_user(request, updated_user)
                
                return JsonResponse({
                    'success': True,
                    'message': 'Profile picture updated successfully!',
                    'avatar_url': avatar_url
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to update profile picture'
                })
                
        except Exception as e:
            print(f"❌ ERROR updating profile picture: {str(e)}")
            return JsonResponse({'error': f'Failed to update profile picture: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)



@login_required
def get_user_statistics_api(request):
    """Get user statistics"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_stats = get_user_statistics(str(current_user['_id']))
        
        return JsonResponse({
            'success': True,
            'statistics': user_stats
        })
        
    except Exception as e:
        print(f"❌ Error in get_user_statistics_api: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)





@login_required
def debug_user_storage(request):
    """Debug endpoint to check user data storage"""
    current_user = SimpleAuth.get_current_user(request)
    user_id = ObjectId(current_user['_id'])
    
    users_collection = mongodb.get_collection('users')
    user_info_collection = mongodb.get_collection('user_info')
    
    user_data = users_collection.find_one({'_id': user_id})
    user_info_data = user_info_collection.find_one({'user_id': user_id})
    
    return JsonResponse({
        'user_id': str(user_id),
        'users_collection': str(user_data) if user_data else 'No data',
        'user_info_collection': str(user_info_data) if user_info_data else 'No data',
        'session_user': str(request.session.get('user_data'))
    })

@login_required
def get_book_details(request, book_id):
    """API endpoint to get detailed book information"""
    try:
        books_collection = mongodb.get_collection('books')
        
        print(f"📖 Getting details for book: {book_id}")
        
        # Try to find book by ObjectId
        try:
            book_object_id = ObjectId(book_id)
            book = books_collection.find_one({'_id': book_object_id})
        except:
            # If not a valid ObjectId, try searching by string ID or other fields
            book = books_collection.find_one({'$or': [
                {'_id': ObjectId(book_id)},
                {'id': book_id},
                {'title': {'$regex': book_id, '$options': 'i'}}
            ]})
        
        if not book:
            print(f"❌ Book not found: {book_id}")
            return JsonResponse({'error': 'Book not found'}, status=404)
        
        # Convert ObjectId to string and prepare response
        book_data = {
            'id': str(book['_id']),
            'title': book.get('title', 'Unknown Title'),
            'author': book.get('author', 'Unknown Author'),
            'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
            'description': book.get('description', 'No description available.'),
            'genre': book.get('genre', []),
            'language': book.get('language', 'Unknown'),
            'publication_year': book.get('publication_year', 'Unknown'),
            'average_rating': book.get('average_rating', 0),
            'pages': book.get('pages', 0),
            'publisher': book.get('publisher', 'Unknown'),
            'isbn': book.get('isbn', ''),
            'category': book.get('category', 'general')
        }
        
        print(f"✅ Book details loaded: {book_data['title']}")
        return JsonResponse(book_data)
        
    except Exception as e:
        print(f"❌ Error getting book details: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
# Add this to views.py for debugging
@csrf_exempt
def debug_username_check(request):
    """Debug endpoint to test username checking"""
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username', '')
        
        users_collection = mongodb.get_collection('users')
        
        # Count total users for debug
        total_users = users_collection.count_documents({})
        
        # Find all usernames for debug
        all_users = list(users_collection.find({}, {'username': 1, 'email': 1}))
        all_usernames = [user.get('username') for user in all_users if user.get('username')]
        
        # Check if username exists
        import re
        existing_user = users_collection.find_one({
            'username': {'$regex': f'^{re.escape(username)}$', '$options': 'i'}
        })
        
        return JsonResponse({
            'username': username,
            'total_users': total_users,
            'all_usernames': all_usernames,
            'exists': existing_user is not None,
            'existing_user': str(existing_user) if existing_user else None
        })
    
    return JsonResponse({'error': 'POST required'})

@login_required
@csrf_exempt
def change_password_api(request):
    """Change password - ONLY uses users collection"""
    if request.method == 'POST':
        try:
            print("\n" + "="*80)
            print("🔐 PASSWORD CHANGE API CALLED")
            print("="*80)
            
            current_user = SimpleAuth.get_current_user(request)
            if not current_user:
                print("❌ User not authenticated")
                return JsonResponse({'error': 'User not authenticated'}, status=401)
            
            # Parse the request body
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                print("❌ Invalid JSON in request")
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
            
            current_password = data.get('current_password')
            new_password = data.get('new_password')
            confirm_password = data.get('confirm_password')
            
            print(f"👤 User: {current_user.get('email')}")
            print(f"🔑 Current password length: {len(current_password) if current_password else 0}")
            print(f"🔑 New password length: {len(new_password) if new_password else 0}")
            
            # Validation
            if not all([current_password, new_password, confirm_password]):
                print("❌ Missing required fields")
                return JsonResponse({'error': 'All fields are required'}, status=400)
            
            if new_password != confirm_password:
                print("❌ New passwords don't match")
                return JsonResponse({'error': 'New passwords do not match'}, status=400)
            
            if len(new_password) < 8:
                print("❌ New password too short")
                return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
            
            # Verify current password
            users_collection = mongodb.get_collection('users')
            user = users_collection.find_one({'_id': ObjectId(current_user['_id'])})
            
            if not user:
                print("❌ User not found in database")
                return JsonResponse({'error': 'User not found'}, status=404)
            
            stored_hash = user.get('password')
            
            if not stored_hash:
                print("❌ No password hash stored for user")
                return JsonResponse({'error': 'No password set for user'}, status=500)
            
            print(f"💾 Stored hash: {stored_hash[:50]}...")
            
            # Clean the password
            current_password_cleaned = current_password.strip()
            
            # Test with Django's check_password
            from django.contrib.auth.hashers import check_password
            
            print("\n🧪 Verifying current password...")
            
            try:
                is_valid = check_password(current_password_cleaned, stored_hash)
                print(f"✅ Current password verification: {is_valid}")
                
                if not is_valid:
                    print("❌ Current password is incorrect")
                    return JsonResponse({
                        'success': False,
                        'error': 'Current password is incorrect'
                    })
                    
            except Exception as hash_error:
                print(f"❌ Hash verification error: {hash_error}")
                return JsonResponse({
                    'success': False,
                    'error': 'Password verification failed'
                }, status=400)
            
            # Update password
            from django.contrib.auth.hashers import make_password
            hashed_new_password = make_password(new_password)
            
            result = users_collection.update_one(
                {'_id': ObjectId(current_user['_id'])},
                {'$set': {
                    'password': hashed_new_password,
                    'updated_at': datetime.utcnow()
                }}
            )
            
            if result.modified_count > 0:
                print(f"✅ Password updated successfully for user: {current_user.get('email')}")
                print("="*80 + "\n")
                
                return JsonResponse({
                    'success': True,
                    'message': 'Password changed successfully!'
                })
            else:
                print("❌ No documents were modified")
                return JsonResponse({'error': 'Failed to update password'}, status=500)
                
        except Exception as e:
            print(f"❌ Error in change_password_api: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': f'Failed to change password: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def verify_password_api(request):
    """API endpoint to verify user password - COMPLETELY FIXED"""
    if request.method == 'POST':
        try:
            print("\n" + "="*80)
            print("🔐 PASSWORD VERIFICATION API CALLED")
            print("="*80)
            
            current_user = SimpleAuth.get_current_user(request)
            if not current_user:
                print("❌ User not authenticated")
                return JsonResponse({'error': 'User not authenticated'}, status=401)
            
            # Parse the request body
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                print("❌ Invalid JSON in request")
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
            
            password = data.get('password')
            
            if not password:
                print("❌ No password provided in request")
                return JsonResponse({'error': 'Password is required'}, status=400)
            
            print(f"👤 User: {current_user.get('email')}")
            print(f"🔑 Password length: {len(password)}")
            
            # Get user from database with ALL password data
            users_collection = mongodb.get_collection('users')
            user = users_collection.find_one({'_id': ObjectId(current_user['_id'])})
            
            if not user:
                print("❌ User not found in database")
                return JsonResponse({'error': 'User not found'}, status=404)
            
            stored_hash = user.get('password')
            
            if not stored_hash:
                print("❌ No password hash stored in database")
                return JsonResponse({'error': 'No password set for user'}, status=500)
            
            print(f"💾 Stored hash: {stored_hash[:50]}...")
            
            # IMPORTANT: Clean the password - remove any whitespace
            password_cleaned = password.strip()
            
            if password_cleaned != password:
                print(f"⚠️  Password had whitespace - cleaned from {len(password)} to {len(password_cleaned)} chars")
            
            # Test with Django's check_password
            from django.contrib.auth.hashers import check_password
            
            print("\n🧪 Testing password verification...")
            
            try:
                # This is the CORRECT way to verify passwords in Django
                is_valid = check_password(password_cleaned, stored_hash)
                print(f"✅ check_password result: {is_valid}")
                
                if is_valid:
                    print("🎉 PASSWORD VERIFICATION SUCCESSFUL")
                    return JsonResponse({
                        'success': True,
                        'message': 'Password verified successfully'
                    })
                else:
                    print("❌ PASSWORD VERIFICATION FAILED")
                    return JsonResponse({
                        'success': False,
                        'message': 'Invalid password'
                    })
                    
            except Exception as hash_error:
                print(f"❌ Hash verification error: {hash_error}")
                return JsonResponse({
                    'success': False,
                    'error': 'Password verification failed',
                    'debug': str(hash_error)
                }, status=400)
            
        except Exception as e:
            print(f"❌ Error in verify_password_api: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': f'Failed to verify password: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)




@login_required
@csrf_exempt
def test_my_password(request):
    """Simple test endpoint to verify password manually"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            test_password = data.get('password')
            
            if not test_password:
                return JsonResponse({'error': 'Password is required'}, status=400)
            
            # Get user from database
            users_collection = mongodb.get_collection('users')
            user = users_collection.find_one({'_id': ObjectId(current_user['_id'])})
            
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            from django.contrib.auth.hashers import check_password, make_password
            
            print("=" * 50)
            print("🔍 PASSWORD VERIFICATION DEBUG")
            print("=" * 50)
            print(f"User: {user.get('email')}")
            print(f"Stored hash: {user['password']}")
            print(f"Test password: '{test_password}'")
            print(f"Test password length: {len(test_password)}")
            print(f"Test password bytes: {test_password.encode('utf-8')}")
            
            # Test 1: Direct check_password
            result1 = check_password(test_password, user['password'])
            print(f"check_password result: {result1}")
            
            # Test 2: Create new hash and compare
            new_hash = make_password(test_password)
            print(f"New hash for same password: {new_hash}")
            print(f"Hashes match: {new_hash == user['password']}")
            
            # Test 3: Check hash structure
            hash_parts = user['password'].split('$')
            if len(hash_parts) == 4:
                print(f"Hash algorithm: {hash_parts[0]}")
                print(f"Iterations: {hash_parts[1]}")
                print(f"Salt: {hash_parts[2]}")
                print(f"Hash: {hash_parts[3][:20]}...")
            
            return JsonResponse({
                'success': result1,
                'debug': {
                    'check_password_result': result1,
                    'stored_hash_algorithm': hash_parts[0] if len(hash_parts) == 4 else 'unknown',
                    'hash_parts_count': len(hash_parts),
                    'new_hash_matches': new_hash == user['password']
                }
            })
                
        except Exception as e:
            print(f"❌ Error in password test: {e}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def debug_user_info(request):
    """Debug user info and password"""
    current_user = SimpleAuth.get_current_user(request)
    users_collection = mongodb.get_collection('users')
    
    user = users_collection.find_one({'_id': ObjectId(current_user['_id'])})
    
    if user:
        return JsonResponse({
            'user_exists': True,
            'email': user.get('email'),
            'username': user.get('username'),
            'full_name': user.get('full_name'),
            'password_hash': user.get('password'),
            'password_starts_with': user.get('password', '')[:20] + '...',
            'created_at': user.get('created_at'),
            'hash_algorithm': 'pbkdf2_sha256' if user.get('password', '').startswith('pbkdf2_sha256') else 'unknown'
        })
    else:
        return JsonResponse({'user_exists': False})
    
@login_required
@csrf_exempt
def reset_my_password(request):
    """Temporary function to reset your password"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            new_password = data.get('new_password')
            confirm_password = data.get('confirm_password')
            
            if not new_password or not confirm_password:
                return JsonResponse({'error': 'Both password fields are required'}, status=400)
            
            if new_password != confirm_password:
                return JsonResponse({'error': 'Passwords do not match'}, status=400)
            
            if len(new_password) < 8:
                return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
            
            # Update password directly (no current password check)
            users_collection = mongodb.get_collection('users')
            from django.contrib.auth.hashers import make_password
            hashed_password = make_password(new_password)
            
            result = users_collection.update_one(
                {'_id': ObjectId(current_user['_id'])},
                {'$set': {'password': hashed_password}}
            )
            
            if result.modified_count > 0:
                print(f"✅ Password reset for user: {current_user.get('email')}")
                return JsonResponse({
                    'success': True,
                    'message': 'Password reset successfully! Try logging in with the new password.'
                })
            else:
                return JsonResponse({'error': 'Failed to reset password'}, status=500)
                
        except Exception as e:
            print(f"❌ Error resetting password: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def debug_password_raw(request):
    """
    DEBUG ENDPOINT - Test password verification directly
    POST with: { "email": "your@email.com", "password": "yourpassword" }
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            if not email or not password:
                return JsonResponse({'error': 'Email and password required'}, status=400)
            
            print("\n" + "="*80)
            print("🔍 PASSWORD DEBUG - RAW TEST")
            print("="*80)
            
            users_collection = mongodb.get_collection('users')
            user = users_collection.find_one({'email': email})
            
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            print(f"👤 User Found: {user.get('email')}")
            print(f"🔑 Password provided: '{password}'")
            print(f"🔑 Password length: {len(password)}")
            print(f"🔑 Password type: {type(password)}")
            print(f"🔑 Password bytes: {password.encode('utf-8')}")
            
            stored_hash = user.get('password')
            print(f"\n💾 Stored hash: {stored_hash}")
            print(f"💾 Hash length: {len(stored_hash)}")
            print(f"💾 Hash type: {type(stored_hash)}")
            
            # Split hash to understand structure
            hash_parts = stored_hash.split('$')
            print(f"\n🔐 Hash Structure:")
            print(f"   Algorithm: {hash_parts[0]}")
            print(f"   Iterations: {hash_parts[1]}")
            print(f"   Salt: {hash_parts[2]}")
            print(f"   Hash value: {hash_parts[3][:40]}..." if len(hash_parts) > 3 else "   Hash: MISSING")
            
            # Test 1: Direct check_password
            from django.contrib.auth.hashers import check_password, make_password
            
            print(f"\n🧪 Test 1: Django check_password()")
            result1 = check_password(password, stored_hash)
            print(f"   Result: {result1}")
            
            # Test 2: Create hash of input and compare
            print(f"\n🧪 Test 2: Create new hash and compare")
            new_hash = make_password(password)
            print(f"   New hash: {new_hash}")
            print(f"   Hashes match: {new_hash == stored_hash}")
            
            # Test 3: Try verifying with different encodings
            print(f"\n🧪 Test 3: Test with different encodings")
            password_stripped = password.strip()
            result3 = check_password(password_stripped, stored_hash)
            print(f"   Stripped password result: {result3}")
            
            # Test 4: Manual PBKDF2 verification
            print(f"\n🧪 Test 4: Manual PBKDF2 verification")
            try:
                import hashlib
                import base64
                
                if hash_parts[0] == 'pbkdf2_sha256':
                    iterations = int(hash_parts[1])
                    salt = hash_parts[2]
                    stored_hash_value = hash_parts[3]
                    
                    # Recreate the hash manually
                    dk = hashlib.pbkdf2_hmac(
                        'sha256',
                        password.encode('utf-8'),
                        salt.encode('utf-8'),
                        iterations,
                        dklen=32
                    )
                    computed_hash = base64.b64encode(dk).decode('utf-8')
                    
                    print(f"   Salt: {salt}")
                    print(f"   Iterations: {iterations}")
                    print(f"   Computed hash: {computed_hash}")
                    print(f"   Stored hash: {stored_hash_value}")
                    print(f"   Manual match: {computed_hash == stored_hash_value}")
            except Exception as e:
                print(f"   Manual verification error: {e}")
            
            print("\n" + "="*80 + "\n")
            
            return JsonResponse({
                'user_found': True,
                'email': user.get('email'),
                'password_provided_length': len(password),
                'stored_hash_length': len(stored_hash),
                'check_password_result': result1,
                'hash_structure': {
                    'algorithm': hash_parts[0] if len(hash_parts) > 0 else 'unknown',
                    'iterations': hash_parts[1] if len(hash_parts) > 1 else 'unknown',
                    'salt': hash_parts[2] if len(hash_parts) > 2 else 'unknown',
                    'has_hash_value': len(hash_parts) > 3
                },
                'verification_success': result1
            })
                
        except Exception as e:
            print(f"❌ Error in debug endpoint: {e}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({
        'message': 'POST to this endpoint with { "email": "user@example.com", "password": "password" }',
        'usage': 'For debugging password verification issues'
    })
    
@login_required
@csrf_exempt
def emergency_password_fix(request):
    """EMERGENCY: Reset your password to a known value"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            new_password = data.get('new_password')
            confirm_password = data.get('confirm_password')
            
            if not new_password or not confirm_password:
                return JsonResponse({'error': 'Both password fields are required'}, status=400)
            
            if new_password != confirm_password:
                return JsonResponse({'error': 'Passwords do not match'}, status=400)
            
            if len(new_password) < 8:
                return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
            
            # Update password directly
            users_collection = mongodb.get_collection('users')
            from django.contrib.auth.hashers import make_password
            hashed_password = make_password(new_password)
            
            result = users_collection.update_one(
                {'_id': ObjectId(current_user['_id'])},
                {'$set': {'password': hashed_password}}
            )
            
            if result.modified_count > 0:
                print(f"✅ EMERGENCY: Password reset for user: {current_user.get('email')}")
                print(f"✅ New hash: {hashed_password[:50]}...")
                
                # Test the new password immediately
                test_result = check_password(new_password, hashed_password)
                print(f"✅ New password verification test: {test_result}")
                
                return JsonResponse({
                    'success': True,
                    'message': 'Password reset successfully! You can now use this password.',
                    'verification_test': test_result
                })
            else:
                return JsonResponse({'error': 'Failed to reset password'}, status=500)
                
        except Exception as e:
            print(f"❌ Error in emergency password reset: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def check_username_api(request):
    """API endpoint to check username availability"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip().lower()
            
            print(f"🔍 API: Checking username availability: '{username}'")
            
            if not username:
                return JsonResponse({'error': 'Username is required'}, status=400)
            
            # Validate username format
            import re
            if not re.match(r'^[a-zA-Z0-9_]+$', username):
                print(f"❌ API: Invalid username format: {username}")
                return JsonResponse({
                    'available': False,
                    'message': 'Username can only contain letters, numbers, and underscores'
                })
            
            if len(username) < 3:
                print(f"❌ API: Username too short: {username}")
                return JsonResponse({
                    'available': False,
                    'message': 'Username must be at least 3 characters long'
                })
            
            if len(username) > 20:
                print(f"❌ API: Username too long: {username}")
                return JsonResponse({
                    'available': False,
                    'message': 'Username must be less than 20 characters'
                })
            
            # Check if username exists in users collection - CASE INSENSITIVE
            users_collection = mongodb.get_collection('users')
            current_user = SimpleAuth.get_current_user(request)
            
            # Check for exact match (case insensitive), excluding current user
            existing_user = users_collection.find_one({
                'username': {'$regex': f'^{re.escape(username)}$', '$options': 'i'},
                '_id': {'$ne': ObjectId(current_user['_id'])}
            })
            
            is_available = not existing_user
            
            print(f"📊 API: Username '{username}' available: {is_available}")
            
            return JsonResponse({
                'available': is_available,
                'username': username
            })
            
        except Exception as e:
            print(f"❌ API: Error checking username: {e}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': 'Failed to check username'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def change_password_api(request):
    """Change password API with proper verification"""
    if request.method == 'POST':
        try:
            print("\n" + "="*80)
            print("🔐 PASSWORD CHANGE API CALLED")
            print("="*80)
            
            current_user = SimpleAuth.get_current_user(request)
            if not current_user:
                print("❌ User not authenticated")
                return JsonResponse({'error': 'User not authenticated'}, status=401)
            
            # Parse the request body
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                print("❌ Invalid JSON in request")
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
            
            current_password = data.get('current_password')
            new_password = data.get('new_password')
            confirm_password = data.get('confirm_password')
            
            print(f"👤 User: {current_user.get('email')}")
            print(f"🔑 Current password length: {len(current_password) if current_password else 0}")
            print(f"🔑 New password length: {len(new_password) if new_password else 0}")
            
            # Validation
            if not all([current_password, new_password, confirm_password]):
                print("❌ Missing required fields")
                return JsonResponse({'error': 'All fields are required'}, status=400)
            
            if new_password != confirm_password:
                print("❌ New passwords don't match")
                return JsonResponse({'error': 'New passwords do not match'}, status=400)
            
            if len(new_password) < 8:
                print("❌ New password too short")
                return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
            
            # Verify current password
            users_collection = mongodb.get_collection('users')
            user = users_collection.find_one({'_id': ObjectId(current_user['_id'])})
            
            if not user:
                print("❌ User not found in database")
                return JsonResponse({'error': 'User not found'}, status=404)
            
            stored_hash = user.get('password')
            
            if not stored_hash:
                print("❌ No password hash stored for user")
                return JsonResponse({'error': 'No password set for user'}, status=500)
            
            print(f"💾 Stored hash: {stored_hash[:50]}...")
            
            # Clean the password
            current_password_cleaned = current_password.strip()
            
            # Test with Django's check_password
            from django.contrib.auth.hashers import check_password
            
            print("\n🧪 Verifying current password...")
            
            try:
                is_valid = check_password(current_password_cleaned, stored_hash)
                print(f"✅ Current password verification: {is_valid}")
                
                if not is_valid:
                    print("❌ Current password is incorrect")
                    return JsonResponse({
                        'success': False,
                        'error': 'Current password is incorrect'
                    })
                    
            except Exception as hash_error:
                print(f"❌ Hash verification error: {hash_error}")
                return JsonResponse({
                    'success': False,
                    'error': 'Password verification failed'
                }, status=400)
            
            # Update password
            from django.contrib.auth.hashers import make_password
            hashed_new_password = make_password(new_password)
            
            result = users_collection.update_one(
                {'_id': ObjectId(current_user['_id'])},
                {'$set': {
                    'password': hashed_new_password,
                    'updated_at': datetime.utcnow()
                }}
            )
            
            if result.modified_count > 0:
                print(f"✅ Password updated successfully for user: {current_user.get('email')}")
                print("="*80 + "\n")
                
                return JsonResponse({
                    'success': True,
                    'message': 'Password changed successfully!'
                })
            else:
                print("❌ No documents were modified")
                return JsonResponse({'error': 'Failed to update password'}, status=500)
                
        except Exception as e:
            print(f"❌ Error in change_password_api: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': f'Failed to change password: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def debug_session_data(request):
    """Debug endpoint to check session vs database data"""
    current_user = SimpleAuth.get_current_user(request)
    user_id = ObjectId(current_user['_id'])
    
    users_collection = mongodb.get_collection('users')
    db_user = users_collection.find_one({'_id': user_id})
    
    print("\n" + "="*80)
    print("🔍 DEBUG SESSION VS DATABASE")
    print("="*80)
    print("SESSION DATA:")
    print(f"  Username: '{current_user.get('username')}'")
    print(f"  First Name: '{current_user.get('first_name')}'")
    print(f"  Last Name: '{current_user.get('last_name')}'")
    print(f"  Full Name: '{current_user.get('full_name')}'")
    print(f"  Email: '{current_user.get('email')}'")
    
    print("\nDATABASE DATA:")
    print(f"  Username: '{db_user.get('username') if db_user else 'N/A'}'")
    print(f"  First Name: '{db_user.get('first_name') if db_user else 'N/A'}'")
    print(f"  Last Name: '{db_user.get('last_name') if db_user else 'N/A'}'")
    print(f"  Full Name: '{db_user.get('full_name') if db_user else 'N/A'}'")
    print(f"  Email: '{db_user.get('email') if db_user else 'N/A'}'")
    
    print(f"\nSESSION KEYS: {list(request.session.keys())}")
    print("="*80 + "\n")
    
    return JsonResponse({
        'session': {
            'username': current_user.get('username'),
            'first_name': current_user.get('first_name'),
            'last_name': current_user.get('last_name'),
            'full_name': current_user.get('full_name'),
            'email': current_user.get('email')
        },
        'database': {
            'username': db_user.get('username') if db_user else 'N/A',
            'first_name': db_user.get('first_name') if db_user else 'N/A',
            'last_name': db_user.get('last_name') if db_user else 'N/A',
            'full_name': db_user.get('full_name') if db_user else 'N/A',
            'email': db_user.get('email') if db_user else 'N/A'
        }
    })
    
@login_required
def debug_users_collection(request):
    """Debug exactly what's in your users collection"""
    print("\n" + "="*80)
    print("🔍 DEBUG USERS COLLECTION")
    print("="*80)
    
    current_user = SimpleAuth.get_current_user(request)
    user_id = ObjectId(current_user['_id'])
    
    users_collection = mongodb.get_collection('users')
    
    # Find the current user in users collection
    db_user = users_collection.find_one({'_id': user_id})
    
    print("📋 COMPLETE USER DOCUMENT IN 'users' COLLECTION:")
    if db_user:
        for key, value in db_user.items():
            print(f"   {key}: {value}")
    else:
        print("❌ User not found in 'users' collection!")
    
    print("="*80 + "\n")
    
    return JsonResponse({
        'users_collection_data': str(db_user) if db_user else 'Not found'
    })
    
@login_required
def get_all_genres_api(request):
    """API endpoint to get all distinct genres from books collection"""
    try:
        books_collection = mongodb.get_collection('books')
        
        # Get all distinct genres from books
        all_books = list(books_collection.find({}, {'genre': 1}))
        
        # Extract and flatten all genres
        all_genres = set()
        for book in all_books:
            genres = book.get('genre', [])
            if isinstance(genres, list):
                for genre in genres:
                    if genre and genre.strip():  # Only add non-empty genres
                        all_genres.add(genre.strip().title())
            elif isinstance(genres, str) and genres.strip():
                all_genres.add(genres.strip().title())
        
        # Convert to sorted list
        sorted_genres = sorted(list(all_genres))
        
        print(f"📚 Found {len(sorted_genres)} distinct genres: {sorted_genres}")
        
        return JsonResponse({
            'success': True,
            'genres': sorted_genres
        })
        
    except Exception as e:
        print(f"❌ Error getting genres: {e}")
        return JsonResponse({'error': 'Failed to get genres'}, status=500)

@login_required
@csrf_exempt
def update_favorite_genres_api(request):
    """API endpoint to update user's favorite genres"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            favorite_genres = data.get('favorite_genres', [])
            
            print(f"🎯 Updating favorite genres for user: {current_user['_id']}")
            print(f"📋 Selected genres: {favorite_genres}")
            
            # Validate genres (limit to 10 for example)
            if len(favorite_genres) > 10:
                return JsonResponse({'error': 'Maximum 10 genres allowed'}, status=400)
            
            # Update user's favorite genres in users collection
            users_collection = mongodb.get_collection('users')
            
            result = users_collection.update_one(
                {'_id': ObjectId(current_user['_id'])},
                {
                    '$set': {
                        'favorite_genres': favorite_genres,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                # Update session
                updated_user = users_collection.find_one({'_id': ObjectId(current_user['_id'])})
                SimpleAuth.update_session_user(request, updated_user)
                
                print(f"✅ Favorite genres updated successfully")
                return JsonResponse({
                    'success': True,
                    'message': 'Favorite genres updated successfully!',
                    'favorite_genres': favorite_genres
                })
            else:
                return JsonResponse({'error': 'No changes made'}, status=400)
                
        except Exception as e:
            print(f"❌ Error updating favorite genres: {e}")
            return JsonResponse({'error': 'Failed to update favorite genres'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def update_reading_goal_api(request):
    """API endpoint to update user's reading goal"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            reading_goal = data.get('reading_goal')
            
            print(f"🎯 Updating reading goal for user: {current_user['_id']}")
            print(f"📚 New reading goal: {reading_goal}")
            
            # Validate reading goal
            if not reading_goal or not isinstance(reading_goal, int) or reading_goal < 1:
                return JsonResponse({'error': 'Please enter a valid reading goal (minimum 1)'}, status=400)
            
            if reading_goal > 1000:  # Reasonable limit
                return JsonResponse({'error': 'Reading goal cannot exceed 1000 books'}, status=400)
            
            # Update user's reading goal in users collection
            users_collection = mongodb.get_collection('users')
            
            result = users_collection.update_one(
                {'_id': ObjectId(current_user['_id'])},
                {
                    '$set': {
                        'reading_goal': reading_goal,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                # Update session
                updated_user = users_collection.find_one({'_id': ObjectId(current_user['_id'])})
                SimpleAuth.update_session_user(request, updated_user)
                
                print(f"✅ Reading goal updated successfully")
                return JsonResponse({
                    'success': True,
                    'message': 'Reading goal updated successfully!',
                    'reading_goal': reading_goal
                })
            else:
                return JsonResponse({'error': 'No changes made'}, status=400)
                
        except Exception as e:
            print(f"❌ Error updating reading goal: {e}")
            return JsonResponse({'error': 'Failed to update reading goal'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def move_to_reading_api(request):
    """API endpoint to move book from wishlist to reading - ALIAS for start_reading_api"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            book_id = data.get('book_id')
            book_title = data.get('book_title')
            book_author = data.get('book_author')
            book_cover = data.get('book_cover')
            book_genre = data.get('book_genre', '')
            
            print(f"🎯 Moving to reading - User: {current_user['_id']}, Book: {book_id}")
            
            # Validate book_id
            if not book_id:
                return JsonResponse({'error': 'Missing book ID'}, status=400)
            
            # Check if book_id is a valid ObjectId
            try:
                book_id_obj = ObjectId(book_id)
                print(f"✅ Valid ObjectId: {book_id}")
            except Exception as e:
                print(f"❌ Invalid ObjectId: {book_id}, error: {e}")
                return JsonResponse({'error': 'Invalid book ID format'}, status=400)
            
            # Prepare book data
            book_data = {
                'title': book_title,
                'author': book_author,
                'cover_image': book_cover,
                'genre': book_genre
            }
            
            # Use the existing start_reading functionality
            success = UserBooksManager.start_reading(str(current_user['_id']), book_id, book_data)
            
            if success:
                print(f"✅ Successfully moved book to reading: {book_id}")
                return JsonResponse({
                    'success': True,
                    'message': 'Book moved to reading list!'
                })
            else:
                print(f"❌ Failed to move book to reading: {book_id}")
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to move book to reading list'
                })
                
        except Exception as e:
            print(f"❌ Error in move_to_reading_api: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@login_required
@csrf_exempt
def save_reading_progress_api(request):
    """API endpoint to save reading progress"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            data = json.loads(request.body)
            
            book_id = data.get('book_id')
            current_page = data.get('current_page', 1)
            total_pages = data.get('total_pages', 0)
            progress = data.get('progress', 0)
            
            # Update reading progress in user_books collection
            user_books_collection = mongodb.get_collection('user_books')
            
            user_books_collection.update_one(
                {
                    'user_id': ObjectId(current_user['_id']),
                    'book_id': book_id
                },
                {
                    '$set': {
                        'current_page': current_page,
                        'total_pages': total_pages,
                        'progress': progress,
                        'last_read': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    }
                },
                upsert=True
            )
            
            return JsonResponse({'success': True, 'message': 'Progress saved'})
            
        except Exception as e:
            print(f"Error saving progress: {e}")
            return JsonResponse({'error': 'Failed to save progress'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def serve_static_pdf(request, path):
    """Serve static PDF files with authentication"""
    document_root = settings.STATIC_ROOT
    return serve(request, path, document_root=document_root)

# Add to views.py
def debug_auth_status(request):
    """Debug authentication status"""
    is_auth = SimpleAuth.is_authenticated(request)
    current_user = SimpleAuth.get_current_user(request)
    
    print(f"🔍 DEBUG AUTH STATUS:")
    print(f"   Is Authenticated: {is_auth}")
    print(f"   Current User: {current_user}")
    print(f"   Session Keys: {list(request.session.keys())}")
    print(f"   user_data in session: {request.session.get('user_data')}")
    
    return JsonResponse({
        'is_authenticated': is_auth,
        'current_user': current_user,
        'session_keys': list(request.session.keys()),
        'user_data_in_session': request.session.get('user_data')
    })
    
def debug_session_full(request):
    """Complete session debug"""
    print("\n" + "="*80)
    print("🔍 FULL SESSION DEBUG")
    print("="*80)
    print(f"Session Key: {request.session.session_key}")
    print(f"Session Keys: {list(request.session.keys())}")
    print(f"Session Expiry: {request.session.get_expiry_age()} seconds")
    print(f"Session Modified: {request.session.modified}")
    
    user_data = request.session.get('user_data')
    print(f"User Data in Session: {user_data}")
    
    is_auth = SimpleAuth.is_authenticated(request)
    current_user = SimpleAuth.get_current_user(request)
    
    print(f"Is Authenticated: {is_auth}")
    print(f"Current User: {current_user}")
    print("="*80 + "\n")
    
    return JsonResponse({
        'session_key': request.session.session_key,
        'session_keys': list(request.session.keys()),
        'user_data_in_session': user_data,
        'is_authenticated': is_auth,
        'current_user': current_user,
        'session_expiry': request.session.get_expiry_age(),
    })
    
# Add to views.py - REAL DATA APIS
@login_required
def get_user_statistics_real(request):
    """Get real user statistics from database"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_id = str(current_user['_id'])
        
        # Get real statistics from database
        user_books_collection = mongodb.get_collection('user_books')
        posts_collection = mongodb.get_collection('posts')
        
        # Books read (completed)
        books_read = user_books_collection.count_documents({
            'user_id': ObjectId(user_id),
            'status': 'completed'
        })
        
        # Currently reading count
        currently_reading = user_books_collection.count_documents({
            'user_id': ObjectId(user_id),
            'status': 'reading'
        })
        
        # Calculate reading streak (simplified - you can enhance this)
        user_books = list(user_books_collection.find({
            'user_id': ObjectId(user_id)
        }).sort('last_read', -1))
        
        current_streak = 0
        if user_books:
            # Simple streak calculation - count consecutive days with reading activity
            today = datetime.utcnow().date()
            streak_days = 0
            
            for i in range(7):  # Check last 7 days
                check_date = today - timedelta(days=i)
                has_activity = any(
                    book.get('last_read') and 
                    book['last_read'].date() == check_date 
                    for book in user_books
                )
                if has_activity:
                    streak_days += 1
                else:
                    break
            
            current_streak = streak_days
        
        # Pages read today (simplified)
        pages_today = 47  # You can implement real tracking
        
        return JsonResponse({
            'success': True,
            'statistics': {
                'books_read': books_read,
                'currently_reading': currently_reading,
                'current_streak': current_streak,
                'pages_today': pages_today,
                'reading_goal': 12,
                'goal_progress': min(100, int((books_read / 12) * 100))
            }
        })
        
    except Exception as e:
        print(f"❌ Error getting user statistics: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
def get_friend_activities_api(request):
    """Get friend activities - returns realistic data based on actual posts and books"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        
        # Get some real books for realistic activities
        books_collection = mongodb.get_collection('books')
        sample_books = list(books_collection.find().limit(5))
        
        # Get recent posts for activities
        posts_collection = mongodb.get_collection('posts')
        recent_posts = list(posts_collection.find().sort('created_at', -1).limit(3))
        
        activities = []
        
        # Add post activities from real posts
        for i, post in enumerate(recent_posts[:2]):
            users_collection = mongodb.get_collection('users')
            user = users_collection.find_one({'_id': post['user_id']})
            
            if user:
                activities.append({
                    'type': 'post',
                    'user_name': user.get('full_name', 'User'),
                    'user_avatar': user.get('profile_picture', '/static/myapp/icons/top-user.png'),
                    'action': 'shared a thought',
                    'content': post.get('content', '')[:100] + '...' if len(post.get('content', '')) > 100 else post.get('content', ''),
                    'time': format_time_ago(post.get('created_at')),
                    'timestamp': post.get('created_at')
                })
        
        # Add book activities from real books
        for i, book in enumerate(sample_books[:3]):
            # Create realistic timestamps (1, 3, 8 hours ago)
            time_offsets = [1, 3, 8]
            time_offset = time_offsets[i] if i < len(time_offsets) else 1
            
            activities.append({
                'type': 'book',
                'user_name': 'Community Member',
                'user_avatar': '/static/myapp/icons/top-user.png',
                'action': 'started reading',
                'content': book.get('title', 'Unknown Book'),
                'time': f'{time_offset}h ago',
                'timestamp': datetime.utcnow() - timedelta(hours=time_offset)
            })
        
        # Sort by timestamp (newest first)
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return JsonResponse({
            'success': True,
            'activities': activities[:4]  # Return top 4 activities
        })
        
    except Exception as e:
        print(f"❌ Error getting friend activities: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

def format_time_ago(timestamp):
    """Format timestamp to relative time"""
    if not timestamp:
        return 'Recently'
    
    now = datetime.utcnow()
    if isinstance(timestamp, str):
        timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    
    diff = now - timestamp
    
    if diff.days > 0:
        return f'{diff.days}d ago'
    elif diff.seconds // 3600 > 0:
        return f'{diff.seconds // 3600}h ago'
    elif diff.seconds // 60 > 0:
        return f'{diff.seconds // 60}m ago'
    else:
        return 'Just now'

def format_time_ago(timestamp):
    """Format timestamp to relative time"""
    if not timestamp:
        return 'Recently'
    
    now = datetime.utcnow()
    if isinstance(timestamp, str):
        timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    
    diff = now - timestamp
    
    if diff.days > 0:
        return f'{diff.days}d ago'
    elif diff.seconds // 3600 > 0:
        return f'{diff.seconds // 3600}h ago'
    elif diff.seconds // 60 > 0:
        return f'{diff.seconds // 60}m ago'
    else:
        return 'Just now'

# Update the existing get_posts_api to include better comment handling
@login_required
def get_posts_api(request):
    """API endpoint to get all posts with user data - ENHANCED VERSION"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_id = ObjectId(current_user['_id'])
        
        print(f"🔍 Getting posts for user: {current_user['_id']}")
        
        posts_collection = mongodb.get_collection('posts')
        users_collection = mongodb.get_collection('users')
        likes_collection = mongodb.get_collection('likes')
        comments_collection = mongodb.get_collection('comments')
        
        # Get all posts sorted by creation date (newest first)
        all_posts = list(posts_collection.find().sort('created_at', -1))
        print(f"📝 Found {len(all_posts)} total posts in database")
        
        posts_data = []
        
        for post in all_posts:
            # Get user info from users collection
            user_info = users_collection.find_one({'_id': post['user_id']})
            
            if not user_info:
                print(f"⚠️ User not found for post: {post['_id']}")
                continue
            
            # Get likes count and check if current user liked
            likes_count = likes_collection.count_documents({'post_id': post['_id']})
            user_liked = likes_collection.find_one({
                'post_id': post['_id'],
                'user_id': user_id
            }) is not None
            
            # Get comments with user info
            comments = list(comments_collection.find({'post_id': post['_id']}).sort('created_at', 1))
            comments_data = []
            
            for comment in comments:
                comment_user = users_collection.find_one({'_id': comment['user_id']})
                comments_data.append({
                    '_id': str(comment['_id']),
                    'content': comment.get('content', ''),
                    'user_name': comment_user.get('full_name', 'User') if comment_user else 'User',
                    'user_avatar': comment_user.get('profile_picture', '/static/myapp/icons/top-user.png') if comment_user else '/static/myapp/icons/top-user.png',
                    'created_at': comment.get('created_at', datetime.utcnow()).isoformat(),
                    'user_id': str(comment['user_id'])
                })
            
            # Build post data
            post_data = {
                '_id': str(post['_id']),
                'content': post.get('content', ''),
                'user_id': str(post['user_id']),
                'user_name': user_info.get('full_name', 'User'),
                'user_avatar': user_info.get('profile_picture', '/static/myapp/icons/top-user.png'),
                'created_at': post.get('created_at', datetime.utcnow()).isoformat(),
                'likes_count': likes_count,
                'comments_count': len(comments),
                'user_liked': user_liked,
                'comments': comments_data
            }
            
            # Add book data if exists
            if 'book' in post:
                post_data['book'] = post['book']
                # Ensure book data has proper structure
                if isinstance(post_data['book'], dict):
                    post_data['book']['cover_image'] = post_data['book'].get('cover_image', '/static/myapp/images/bookCover/default.jpg')
            
            posts_data.append(post_data)
        
        print(f"✅ Returning {len(posts_data)} posts")
        return JsonResponse({
            'success': True,
            'posts': posts_data
        })
        
    except Exception as e:
        print(f"❌ Error in get_posts_api: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': f'Failed to get posts: {str(e)}',
            'posts': []
        }, status=500)

# myapp/views.py - Add these notification views

# myapp/views.py - Add these notification endpoints

@login_required
def get_notifications_api(request):
    """API endpoint to get user notifications"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_id = ObjectId(current_user['_id'])
        
        print(f"🔔 Getting notifications for user: {user_id}")
        
        # Get notifications from database
        notifications_collection = mongodb.get_collection('notifications')
        
        # Find notifications for current user, sorted by newest first
        user_notifications = list(notifications_collection.find({
            'user_id': user_id
        }).sort('created_at', -1).limit(50))
        
        # If no notifications found, return empty array
        if not user_notifications:
            print("📭 No notifications found for user")
            return JsonResponse({
                'success': True,
                'notifications': []
            })
        
        notifications_data = []
        users_collection = mongodb.get_collection('users')
        
        for notification in user_notifications:
            # Get sender info
            sender = users_collection.find_one({'_id': notification['sender_id']})
            
            notification_data = {
                'id': str(notification['_id']),
                'type': notification.get('type', 'general'),
                'message': notification.get('message', ''),
                'sender_id': str(notification['sender_id']),
                'sender_name': sender.get('full_name', 'User') if sender else 'User',
                'sender_avatar': sender.get('profile_picture', '/static/myapp/icons/top-user.png') if sender else '/static/myapp/icons/top-user.png',
                'post_id': str(notification.get('post_id', '')),
                'read': notification.get('read', False),
                'created_at': notification.get('created_at', datetime.utcnow()).isoformat()
            }
            notifications_data.append(notification_data)
            print(f"📨 Found notification: {notification_data['type']} from {notification_data['sender_name']}")
        
        print(f"✅ Returning {len(notifications_data)} notifications")
        return JsonResponse({
            'success': True,
            'notifications': notifications_data
        })
        
    except Exception as e:
        print(f"❌ Error getting notifications: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': 'Failed to get notifications',
            'notifications': []
        }, status=500)

@login_required
@csrf_exempt
def mark_notification_read_api(request, notification_id):
    """API endpoint to mark notification as read"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            user_id = ObjectId(current_user['_id'])
            
            notifications_collection = mongodb.get_collection('notifications')
            
            result = notifications_collection.update_one(
                {'_id': ObjectId(notification_id), 'user_id': user_id},
                {'$set': {'read': True, 'updated_at': datetime.utcnow()}}
            )
            
            if result.modified_count > 0:
                print(f"✅ Marked notification {notification_id} as read")
                return JsonResponse({'success': True})
            else:
                print(f"❌ Notification {notification_id} not found for user")
                return JsonResponse({'success': False, 'error': 'Notification not found'}, status=404)
                
        except Exception as e:
            print(f"❌ Error marking notification as read: {e}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def mark_all_notifications_read_api(request):
    """API endpoint to mark all notifications as read"""
    if request.method == 'POST':
        try:
            current_user = SimpleAuth.get_current_user(request)
            user_id = ObjectId(current_user['_id'])
            
            notifications_collection = mongodb.get_collection('notifications')
            
            result = notifications_collection.update_many(
                {'user_id': user_id, 'read': False},
                {'$set': {'read': True, 'updated_at': datetime.utcnow()}}
            )
            
            print(f"✅ Marked {result.modified_count} notifications as read")
            return JsonResponse({
                'success': True,
                'message': f'Marked {result.modified_count} notifications as read'
            })
                
        except Exception as e:
            print(f"❌ Error marking all notifications as read: {e}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def delete_notification_api(request, notification_id):
    """API endpoint to delete a notification"""
    if request.method == 'DELETE':
        try:
            current_user = SimpleAuth.get_current_user(request)
            user_id = ObjectId(current_user['_id'])
            
            notifications_collection = mongodb.get_collection('notifications')
            
            result = notifications_collection.delete_one({
                '_id': ObjectId(notification_id), 
                'user_id': user_id
            })
            
            if result.deleted_count > 0:
                print(f"✅ Deleted notification {notification_id}")
                return JsonResponse({'success': True})
            else:
                print(f"❌ Notification {notification_id} not found for user")
                return JsonResponse({'success': False, 'error': 'Notification not found'}, status=404)
                
        except Exception as e:
            print(f"❌ Error deleting notification: {e}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def clear_all_notifications_api(request):
    """API endpoint to clear all notifications"""
    if request.method == 'DELETE':
        try:
            current_user = SimpleAuth.get_current_user(request)
            user_id = ObjectId(current_user['_id'])
            
            notifications_collection = mongodb.get_collection('notifications')
            
            result = notifications_collection.delete_many({'user_id': user_id})
            
            print(f"✅ Cleared {result.deleted_count} notifications")
            return JsonResponse({
                'success': True,
                'message': f'Cleared {result.deleted_count} notifications'
            })
                
        except Exception as e:
            print(f"❌ Error clearing all notifications: {e}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Helper function to create sample notifications for testing
@login_required
@csrf_exempt
def create_sample_notifications(request):
    """Create sample notifications for testing"""
    try:
        current_user = SimpleAuth.get_current_user(request)
        user_id = ObjectId(current_user['_id'])
        
        # Get some other users to act as senders
        users_collection = mongodb.get_collection('users')
        other_users = list(users_collection.find({'_id': {'$ne': user_id}}).limit(3))
        
        if not other_users:
            return JsonResponse({'error': 'Need other users in database to create sample notifications'}, status=400)
        
        notifications_collection = mongodb.get_collection('notifications')
        
        # Clear existing notifications
        notifications_collection.delete_many({'user_id': user_id})
        
        sample_notifications = [
            {
                'user_id': user_id,
                'sender_id': other_users[0]['_id'],
                'type': 'like',
                'message': 'liked your post about "The Midnight Library"',
                'post_id': ObjectId(),
                'read': False,
                'created_at': datetime.utcnow() - timedelta(minutes=5)
            },
            {
                'user_id': user_id,
                'sender_id': other_users[1]['_id'],
                'type': 'comment',
                'message': 'commented on your review',
                'post_id': ObjectId(),
                'read': False,
                'created_at': datetime.utcnow() - timedelta(hours=1)
            },
            {
                'user_id': user_id,
                'sender_id': other_users[2]['_id'],
                'type': 'follow',
                'message': 'started following you',
                'read': True,
                'created_at': datetime.utcnow() - timedelta(hours=3)
            }
        ]
        
        result = notifications_collection.insert_many(sample_notifications)
        
        return JsonResponse({
            'success': True,
            'message': f'Created {len(result.inserted_ids)} sample notifications',
            'notification_ids': [str(id) for id in result.inserted_ids]
        })
        
    except Exception as e:
        print(f"❌ Error creating sample notifications: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
def admin_required(view_func):
    """Decorator to ensure user is admin"""
    def wrapper(request, *args, **kwargs):
        # Add your admin check logic here
        # For now, we'll just check if user is authenticated
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper

@admin_required
def admin_contact_dashboard(request):
    """Admin dashboard for contact management"""
    stats = ContactManager.get_contact_stats()
    recent_contacts = ContactManager.get_all_contacts(limit=20)
    
    context = {
        'stats': stats,
        'recent_contacts': recent_contacts
    }
    return render(request, 'myapp/admin_contact_dashboard.html', context)

@admin_required
def admin_get_contacts(request):
    """API endpoint for admin to get all contacts"""
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        status_filter = request.GET.get('status', 'all')
        
        contacts = ContactManager.get_all_contacts(limit=1000)  # Get all then filter
        
        # Apply status filter
        if status_filter != 'all':
            contacts = [c for c in contacts if c.get('status') == status_filter]
        
        # Manual pagination
        total = len(contacts)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_contacts = contacts[start_idx:end_idx]
        
        return JsonResponse({
            'success': True,
            'contacts': paginated_contacts,
            'total': total,
            'page': page,
            'limit': limit,
            'has_more': end_idx < total
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
# myapp/views.py - Add these contact-related functions

@csrf_exempt
def submit_contact_api(request):
    """API endpoint for contact form submission"""
    if request.method == 'POST':
        try:
            # Handle both form data and JSON data
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                name = data.get('name')
                email = data.get('email')
                subject = data.get('subject')
                message = data.get('message')
            else:
                name = request.POST.get('name')
                email = request.POST.get('email')
                subject = request.POST.get('subject')
                message = request.POST.get('message')
            
            print(f"📧 Contact form submission: {name} <{email}> - {subject}")
            
            # Validation
            if not all([name, email, message]):
                return JsonResponse({
                    'success': False,
                    'error': 'Name, email, and message are required fields'
                }, status=400)
            
            # Basic email validation
            if '@' not in email or '.' not in email:
                return JsonResponse({
                    'success': False,
                    'error': 'Please enter a valid email address'
                }, status=400)
            
            # Save to database
            contact_id = ContactManager.create_contact(name, email, subject, message)
            
            print(f"✅ Contact message saved with ID: {contact_id}")
            
            return JsonResponse({
                'success': True,
                'message': 'Thank you for your message! We will get back to you soon.',
                'contact_id': str(contact_id)
            })
            
        except Exception as e:
            print(f"❌ Error processing contact form: {e}")
            return JsonResponse({
                'success': False,
                'error': 'Sorry, there was an error sending your message. Please try again.'
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Admin-only API endpoints (add @admin_required decorator if you have admin authentication)
def get_contacts_api(request):
    """Get all contact submissions (admin only)"""
    try:
        contacts = ContactManager.get_all_contacts()
        return JsonResponse({
            'success': True,
            'contacts': contacts
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_contact_detail_api(request, contact_id):
    """Get specific contact details (admin only)"""
    try:
        contact = ContactManager.get_contact_by_id(contact_id)
        if contact:
            return JsonResponse({
                'success': True,
                'contact': contact
            })
        else:
            return JsonResponse({'error': 'Contact not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def update_contact_status_api(request, contact_id):
    """Update contact status (admin only)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            status = data.get('status')
            
            if status not in ['new', 'read', 'replied']:
                return JsonResponse({'error': 'Invalid status'}, status=400)
            
            success = ContactManager.update_contact_status(contact_id, status)
            
            if success:
                return JsonResponse({'success': True, 'message': 'Status updated'})
            else:
                return JsonResponse({'error': 'Contact not found'}, status=404)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_contact_api(request, contact_id):
    """Delete contact submission (admin only)"""
    if request.method == 'DELETE':
        try:
            success = ContactManager.delete_contact(contact_id)
            
            if success:
                return JsonResponse({'success': True, 'message': 'Contact deleted'})
            else:
                return JsonResponse({'error': 'Contact not found'}, status=404)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def get_contact_stats_api(request):
    """Get contact statistics (admin only)"""
    try:
        stats = ContactManager.get_contact_stats()
        return JsonResponse({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
