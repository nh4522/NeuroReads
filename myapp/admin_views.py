# myapp/admin_views.py
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from .auth import SimpleAuth, admin_required
from .mongodb import mongodb
from bson import ObjectId
import json
import math
from datetime import datetime, timedelta
from .models import UserManager, ContactManager

@admin_required
def admin_dashboard(request):
    """Admin Dashboard"""
    current_user = SimpleAuth.get_current_user(request)
    context = {
        'user': current_user,
        'admin_stats': get_admin_statistics()
    }
    return render(request, 'myapp/admin/admin_dashboard.html', context)

@admin_required
def admin_books(request):
    """Admin Books Management"""
    current_user = SimpleAuth.get_current_user(request)
    context = {'user': current_user}
    return render(request, 'myapp/admin/admin_books.html', context)

@admin_required
def admin_user_management(request):
    """Admin User Management"""
    current_user = SimpleAuth.get_current_user(request)
    context = {'user': current_user}
    return render(request, 'myapp/admin/admin_user.html', context)

@admin_required
def admin_moderation(request):
    """Admin Moderation"""
    current_user = SimpleAuth.get_current_user(request)
    context = {'user': current_user}
    return render(request, 'myapp/admin/admin_moderation.html', context)

@admin_required
def admin_reports(request):
    """Admin Reports"""
    current_user = SimpleAuth.get_current_user(request)
    context = {'user': current_user}
    return render(request, 'myapp/admin/admin_reports.html', context)

@admin_required
def admin_system_settings(request):
    """Admin System Settings"""
    current_user = SimpleAuth.get_current_user(request)
    context = {'user': current_user}
    return render(request, 'myapp/admin/admin_sysSet.html', context)

@admin_required
def admin_profile(request):
    """Admin Profile"""
    current_user = SimpleAuth.get_current_user(request)
    context = {'user': current_user}
    return render(request, 'myapp/admin/admin_profile.html', context)

@admin_required
def admin_account_settings(request):
    """Admin Account Settings"""
    current_user = SimpleAuth.get_current_user(request)
    context = {'user': current_user}
    return render(request, 'myapp/admin/admin_account.html', context)

@admin_required
def admin_contact_dashboard(request):
    """Admin Contact Management Dashboard"""
    current_user = SimpleAuth.get_current_user(request)
    stats = ContactManager.get_contact_stats()
    recent_contacts = ContactManager.get_all_contacts(limit=20)
    
    context = {
        'user': current_user,
        'stats': stats,
        'recent_contacts': recent_contacts
    }
    return render(request, 'myapp/admin/admin_contact.html', context)

# Admin API Endpoints
@admin_required
def get_admin_statistics_api(request):
    """API endpoint for admin dashboard statistics"""
    try:
        stats = get_admin_statistics()
        return JsonResponse({
            'success': True,
            'statistics': stats
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@admin_required
def get_all_users_api(request):
    """API endpoint to get all users for admin"""
    try:
        users_collection = mongodb.get_collection('users')
        users = list(users_collection.find({}, {
            'username': 1,
            'email': 1,
            'full_name': 1,
            'is_admin': 1,
            'created_at': 1,
            'last_login': 1,
            'profile_picture': 1
        }).sort('created_at', -1))
        
        users_data = []
        for user in users:
            users_data.append({
                'id': str(user['_id']),
                'username': user.get('username', ''),
                'email': user.get('email', ''),
                'full_name': user.get('full_name', ''),
                'profile_picture': user.get('profile_picture', '/static/myapp/icons/top-user.png'),
                'is_admin': user.get('is_admin', False),
                'created_at': user.get('created_at', datetime.utcnow()).isoformat(),
                'last_login': user.get('last_login', '').isoformat() if user.get('last_login') else 'Never'
            })
        
        return JsonResponse({
            'success': True,
            'users': users_data
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@admin_required
def make_user_admin_api(request):
    """API endpoint to make a user admin"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            
            success = UserManager.make_admin(user_id)
            
            if success:
                return JsonResponse({
                    'success': True,
                    'message': 'User promoted to admin successfully'
                })
            else:
                return JsonResponse({'error': 'User not found'}, status=404)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@admin_required
def remove_admin_api(request):
    """API endpoint to remove admin privileges"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            
            # Prevent removing yourself as admin
            current_user = SimpleAuth.get_current_user(request)
            if str(user_id) == current_user['_id']:
                return JsonResponse({'error': 'Cannot remove your own admin privileges'}, status=400)
            
            success = UserManager.remove_admin(user_id)
            
            if success:
                return JsonResponse({
                    'success': True,
                    'message': 'Admin privileges removed successfully'
                })
            else:
                return JsonResponse({'error': 'User not found'}, status=404)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@admin_required
def get_admin_books_api(request):
    """API endpoint to get ALL books for admin (no pagination)"""
    try:
        books_collection = mongodb.get_collection('books')
        
        # Get ALL books without pagination
        books = list(books_collection.find({}).sort('created_at', -1))
        
        books_data = []
        for book in books:
            books_data.append({
                '_id': str(book['_id']),
                'title': book.get('title', 'Unknown Title'),
                'author': book.get('author', 'Unknown Author'),
                'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                'category': book.get('category', ''),
                'display_category': book.get('display_category', ''),
                'genre': book.get('genre', []),
                'description': book.get('description', ''),
                'language': book.get('language', 'Unknown'),
                'publication_year': book.get('publication_year', ''),
                'isbn': book.get('isbn', ''),
                'pages': book.get('pages', 0),
                'publisher': book.get('publisher', ''),
                'average_rating': book.get('average_rating', 0),
                'views_count': book.get('views_count', 0),
                'pdf_url': book.get('pdf_url', ''),
                'created_at': book.get('created_at', datetime.utcnow()).isoformat() if book.get('created_at') else datetime.utcnow().isoformat()
            })
        
        print(f"📚 Returning {len(books_data)} books from database")  # Debug log
        
        return JsonResponse({
            'success': True,
            'books': books_data,
            'total': len(books_data)
        })
        
    except Exception as e:
        print(f"Error fetching books: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
# myapp/admin_views.py - ADD THESE ENDPOINTS

@admin_required
def get_all_books_api(request):
    """API endpoint to get ALL books for admin (no pagination)"""
    try:
        books_collection = mongodb.get_collection('books')
        
        # Get ALL books without pagination
        books = list(books_collection.find({}).sort('created_at', -1))
        
        books_data = []
        for book in books:
            books_data.append({
                '_id': str(book['_id']),
                'title': book.get('title', 'Unknown Title'),
                'author': book.get('author', 'Unknown Author'),
                'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                'category': book.get('category', ''),
                'display_category': book.get('display_category', ''),
                'genre': book.get('genre', []),
                'description': book.get('description', ''),
                'language': book.get('language', 'Unknown'),
                'publication_year': book.get('publication_year', ''),
                'isbn': book.get('isbn', ''),
                'pages': book.get('pages', 0),
                'publisher': book.get('publisher', ''),
                'average_rating': book.get('average_rating', 0),
                'views_count': book.get('views_count', 0),
                'pdf_url': book.get('pdf_url', ''),
                'created_at': book.get('created_at', datetime.utcnow()).isoformat() if book.get('created_at') else datetime.utcnow().isoformat()
            })
        
        print(f"📚 Returning {len(books_data)} books from database")
        
        return JsonResponse({
            'success': True,
            'books': books_data,
            'total': len(books_data)
        })
        
    except Exception as e:
        print(f"Error fetching books: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@admin_required
def get_books_statistics_api(request):
    """API endpoint for books statistics"""
    try:
        books_collection = mongodb.get_collection('books')
        user_books_collection = mongodb.get_collection('user_books')
        
        # Total books count
        total_books = books_collection.count_documents({})
        
        # Books by category
        pipeline_category = [
            {'$group': {'_id': '$display_category', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
        category_data = list(books_collection.aggregate(pipeline_category))
        
        categories = []
        category_counts = []
        for item in category_data:
            categories.append(item['_id'] if item['_id'] else 'Uncategorized')
            category_counts.append(item['count'])
        
        # Monthly additions (last 6 months)
        monthly_data = []
        monthly_labels = []
        
        for i in range(5, -1, -1):
            month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_start = month_start - timedelta(days=30*i)
            next_month = month_start + timedelta(days=32)
            next_month = next_month.replace(day=1)
            
            monthly_count = books_collection.count_documents({
                'created_at': {
                    '$gte': month_start,
                    '$lt': next_month
                }
            })
            
            monthly_data.append(monthly_count)
            monthly_labels.append(month_start.strftime('%b %Y'))
        
        # Reading statistics
        reading_count = user_books_collection.count_documents({'status': 'reading'})
        completed_count = user_books_collection.count_documents({'status': 'completed'})
        available_books = total_books
        
        return JsonResponse({
            'success': True,
            'statistics': {
                'total_books': total_books,
                'available_books': available_books,
                'reading_count': reading_count,
                'completed_count': completed_count,
                'new_this_month': monthly_data[-1] if monthly_data else 0
            },
            'charts': {
                'categories': {
                    'labels': categories,
                    'data': category_counts
                },
                'monthly_additions': {
                    'labels': monthly_labels,
                    'data': monthly_data
                }
            }
        })
        
    except Exception as e:
        print(f"Error getting books statistics: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
    # Add to admin_views.py
@admin_required
def debug_books_count(request):
    """Debug endpoint to check book count"""
    try:
        books_collection = mongodb.get_collection('books')
        total_books = books_collection.count_documents({})
        books = list(books_collection.find({}, {'title': 1, 'author': 1}).limit(20))
        
        book_titles = [{'title': book.get('title'), 'author': book.get('author')} for book in books]
        
        return JsonResponse({
            'total_books': total_books,
            'sample_books': book_titles,
            'message': f'Found {total_books} books in database'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@admin_required
def get_admin_posts_api(request):
    """API endpoint to get all posts for admin"""
    try:
        posts_collection = mongodb.get_collection('posts')
        users_collection = mongodb.get_collection('users')
        
        posts = list(posts_collection.find().sort('created_at', -1))
        
        posts_data = []
        for post in posts:
            user = users_collection.find_one({'_id': post['user_id']})
            
            posts_data.append({
                'id': str(post['_id']),
                'content': post.get('content', ''),
                'user_name': user.get('full_name', 'User') if user else 'User',
                'user_email': user.get('email', '') if user else '',
                'likes_count': len(post.get('likes', [])),
                'comments_count': len(post.get('comments', [])),
                'created_at': post.get('created_at', datetime.utcnow()).isoformat(),
                'has_book': 'book' in post
            })
        
        return JsonResponse({
            'success': True,
            'posts': posts_data
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@admin_required
def get_admin_contacts_api(request):
    """API endpoint to get all contacts for admin"""
    try:
        contacts = ContactManager.get_all_contacts(limit=100)
        return JsonResponse({
            'success': True,
            'contacts': contacts
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@admin_required
def delete_post_api(request, post_id):
    """API endpoint to delete a post"""
    if request.method == 'DELETE':
        try:
            posts_collection = mongodb.get_collection('posts')
            result = posts_collection.delete_one({'_id': ObjectId(post_id)})
            
            if result.deleted_count > 0:
                return JsonResponse({
                    'success': True,
                    'message': 'Post deleted successfully'
                })
            else:
                return JsonResponse({'error': 'Post not found'}, status=404)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@admin_required
def delete_book_api(request, book_id):
    """API endpoint to delete a book"""
    if request.method == 'DELETE':
        try:
            books_collection = mongodb.get_collection('books')
            result = books_collection.delete_one({'_id': ObjectId(book_id)})
            
            if result.deleted_count > 0:
                return JsonResponse({
                    'success': True,
                    'message': 'Book deleted successfully'
                })
            else:
                return JsonResponse({'error': 'Book not found'}, status=404)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@admin_required
def delete_user_api(request, user_id):
    """API endpoint to delete a user"""
    if request.method == 'DELETE':
        try:
            # Prevent deleting yourself
            current_user = SimpleAuth.get_current_user(request)
            if str(user_id) == current_user['_id']:
                return JsonResponse({'error': 'Cannot delete your own account'}, status=400)
            
            users_collection = mongodb.get_collection('users')
            result = users_collection.delete_one({'_id': ObjectId(user_id)})
            
            if result.deleted_count > 0:
                return JsonResponse({
                    'success': True,
                    'message': 'User deleted successfully'
                })
            else:
                return JsonResponse({'error': 'User not found'}, status=404)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Helper Functions
def get_admin_statistics():
    """Get statistics for admin dashboard"""
    try:
        users_collection = mongodb.get_collection('users')
        books_collection = mongodb.get_collection('books')
        posts_collection = mongodb.get_collection('posts')
        contacts_collection = mongodb.get_collection('contacts')
        user_books_collection = mongodb.get_collection('user_books')
        
        total_users = users_collection.count_documents({})
        total_books = books_collection.count_documents({})
        total_posts = posts_collection.count_documents({})
        total_contacts = contacts_collection.count_documents({})
        total_admins = users_collection.count_documents({'is_admin': True})
        
        # Today's stats
        today = datetime.utcnow().date()
        today_start = datetime(today.year, today.month, today.day)
        
        new_users_today = users_collection.count_documents({
            'created_at': {'$gte': today_start}
        })
        
        new_books_today = books_collection.count_documents({
            'created_at': {'$gte': today_start}
        })
        
        # Reading statistics
        total_books_read = user_books_collection.count_documents({
            'status': 'completed'
        })
        
        active_readers = user_books_collection.distinct('user_id', {
            'last_read': {'$gte': datetime.utcnow() - timedelta(days=7)}
        })
        
        return {
            'total_users': total_users,
            'total_books': total_books,
            'total_posts': total_posts,
            'total_contacts': total_contacts,
            'total_admins': total_admins,
            'new_users_today': new_users_today,
            'new_books_today': new_books_today,
            'total_books_read': total_books_read,
            'active_readers': len(active_readers)
        }
        
    except Exception as e:
        print(f"Error getting admin stats: {e}")
        return {
            'total_users': 0,
            'total_books': 0,
            'total_posts': 0,
            'total_contacts': 0,
            'total_admins': 0,
            'new_users_today': 0,
            'new_books_today': 0,
            'total_books_read': 0,
            'active_readers': 0
        }

# Development endpoint to create first admin
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def create_first_admin(request):
    """Create first admin user (for development only)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            full_name = data.get('full_name')
            username = data.get('username')
            
            # Check if user already exists
            users_collection = mongodb.get_collection('users')
            existing_user = users_collection.find_one({'email': email})
            
            if existing_user:
                # Update existing user to admin
                users_collection.update_one(
                    {'email': email},
                    {'$set': {'is_admin': True}}
                )
                return JsonResponse({
                    'success': True,
                    'message': 'Existing user promoted to admin'
                })
            else:
                # Create new admin user
                user_id = UserManager.create_user(
                    email=email,
                    password=password,
                    full_name=full_name,
                    username=username,
                    is_admin=True
                )
                return JsonResponse({
                    'success': True,
                    'message': 'Admin user created successfully'
                })
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# myapp/admin_views.py - ADD THESE NEW FUNCTIONS

@admin_required
def get_user_activity_data_api(request):
    """API endpoint for user activity chart data"""
    try:
        users_collection = mongodb.get_collection('users')
        user_books_collection = mongodb.get_collection('user_books')
        posts_collection = mongodb.get_collection('posts')
        
        # Get last 7 days data
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        dates = []
        user_registrations = []
        active_users = []
        books_read = []
        
        for i in range(7):
            current_date = start_date + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            next_date = current_date + timedelta(days=1)
            
            # Count user registrations for this day
            new_users = users_collection.count_documents({
                'created_at': {
                    '$gte': current_date,
                    '$lt': next_date
                }
            })
            
            # Count active users (users who read books or created posts)
            active_user_ids = set()
            
            # Users who read books
            reading_users = user_books_collection.distinct('user_id', {
                'last_read': {
                    '$gte': current_date,
                    '$lt': next_date
                }
            })
            active_user_ids.update(reading_users)
            
            # Users who created posts
            posting_users = posts_collection.distinct('user_id', {
                'created_at': {
                    '$gte': current_date,
                    '$lt': next_date
                }
            })
            active_user_ids.update(posting_users)
            
            # Count books read
            books_read_count = user_books_collection.count_documents({
                'last_read': {
                    '$gte': current_date,
                    '$lt': next_date
                },
                'status': 'completed'
            })
            
            dates.append(current_date.strftime('%a'))
            user_registrations.append(new_users)
            active_users.append(len(active_user_ids))
            books_read.append(books_read_count)
        
        return JsonResponse({
            'success': True,
            'data': {
                'dates': dates,
                'user_registrations': user_registrations,
                'active_users': active_users,
                'books_read': books_read
            }
        })
        
    except Exception as e:
        print(f"❌ Error getting user activity data: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@admin_required
def get_content_distribution_api(request):
    """API endpoint for content distribution chart data"""
    try:
        books_collection = mongodb.get_collection('books')
        posts_collection = mongodb.get_collection('posts')
        users_collection = mongodb.get_collection('users')
        contacts_collection = mongodb.get_collection('contacts')
        
        # Get counts from each collection
        total_books = books_collection.count_documents({})
        total_posts = posts_collection.count_documents({})
        total_users = users_collection.count_documents({})
        total_contacts = contacts_collection.count_documents({})
        
        # Get book genres distribution
        books = list(books_collection.find({}, {'genre': 1}))
        genre_count = {}
        
        for book in books:
            genres = book.get('genre', [])
            if isinstance(genres, list):
                for genre in genres:
                    if genre:
                        genre_count[genre] = genre_count.get(genre, 0) + 1
            elif isinstance(genres, str) and genres:
                genre_count[genres] = genre_count.get(genres, 0) + 1
        
        # Get top 5 genres
        sorted_genres = sorted(genre_count.items(), key=lambda x: x[1], reverse=True)[:5]
        top_genres = [genre for genre, count in sorted_genres]
        genre_counts = [count for genre, count in sorted_genres]
        
        # Get user registration by month (last 6 months)
        monthly_registrations = []
        monthly_labels = []
        
        for i in range(5, -1, -1):
            month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_start = month_start - timedelta(days=30*i)
            next_month = month_start + timedelta(days=32)
            next_month = next_month.replace(day=1)
            
            monthly_count = users_collection.count_documents({
                'created_at': {
                    '$gte': month_start,
                    '$lt': next_month
                }
            })
            
            monthly_registrations.append(monthly_count)
            monthly_labels.append(month_start.strftime('%b'))
        
        return JsonResponse({
            'success': True,
            'data': {
                'content_distribution': {
                    'labels': ['Books', 'Posts', 'Users', 'Contacts'],
                    'data': [total_books, total_posts, total_users, total_contacts]
                },
                'genre_distribution': {
                    'labels': top_genres,
                    'data': genre_counts
                },
                'monthly_registrations': {
                    'labels': monthly_labels,
                    'data': monthly_registrations
                }
            }
        })
        
    except Exception as e:
        print(f"❌ Error getting content distribution data: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@admin_required
def get_reading_analytics_api(request):
    """API endpoint for reading analytics"""
    try:
        user_books_collection = mongodb.get_collection('user_books')
        books_collection = mongodb.get_collection('books')
        
        # Reading progress distribution
        reading_books = list(user_books_collection.find({'status': 'reading'}, {'progress': 1}))
        
        progress_ranges = {
            '0-25%': 0,
            '26-50%': 0,
            '51-75%': 0,
            '76-99%': 0,
            'Completed': 0
        }
        
        for book in reading_books:
            progress = book.get('progress', 0)
            if progress == 100:
                progress_ranges['Completed'] += 1
            elif progress >= 76:
                progress_ranges['76-99%'] += 1
            elif progress >= 51:
                progress_ranges['51-75%'] += 1
            elif progress >= 26:
                progress_ranges['26-50%'] += 1
            else:
                progress_ranges['0-25%'] += 1
        
        # Most read books
        pipeline = [
            {'$match': {'status': 'completed'}},
            {'$group': {'_id': '$book_id', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 5}
        ]
        
        popular_books_data = list(user_books_collection.aggregate(pipeline))
        
        popular_books = []
        read_counts = []
        
        for book_data in popular_books_data:
            book = books_collection.find_one({'_id': ObjectId(book_data['_id'])})
            if book:
                popular_books.append(book.get('title', 'Unknown Book')[:20] + '...')
                read_counts.append(book_data['count'])
        
        return JsonResponse({
            'success': True,
            'data': {
                'progress_distribution': {
                    'labels': list(progress_ranges.keys()),
                    'data': list(progress_ranges.values())
                },
                'popular_books': {
                    'labels': popular_books,
                    'data': read_counts
                }
            }
        })
        
    except Exception as e:
        print(f"❌ Error getting reading analytics: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
# Add to admin_views.py

@admin_required
def create_admin_api(request):
    """API endpoint to create a new administrator"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['full_name', 'username', 'email', 'password']
            for field in required_fields:
                if not data.get(field):
                    return JsonResponse({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }, status=400)
            
            # Check if user already exists
            users_collection = mongodb.get_collection('users')
            existing_user = users_collection.find_one({
                '$or': [
                    {'email': data['email']},
                    {'username': data['username']}
                ]
            })
            
            if existing_user:
                return JsonResponse({
                    'success': False,
                    'error': 'User with this email or username already exists'
                }, status=400)
            
            # Create new admin user
            user_id = UserManager.create_user(
                email=data['email'],
                password=data['password'],
                full_name=data['full_name'],
                username=data['username'],
                is_admin=True
            )
            
            if user_id:
                # Log the admin creation
                admin_logs_collection = mongodb.get_collection('admin_logs')
                current_admin = SimpleAuth.get_current_user(request)
                
                admin_logs_collection.insert_one({
                    'action': 'create_admin',
                    'admin_id': current_admin['_id'],
                    'target_user_id': user_id,
                    'details': {
                        'email': data['email'],
                        'username': data['username'],
                        'admin_level': data.get('admin_level', 'super')
                    },
                    'created_at': datetime.utcnow()
                })
                
                return JsonResponse({
                    'success': True,
                    'message': 'Administrator created successfully',
                    'user_id': str(user_id)
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to create user'
                }, status=500)
                
        except Exception as e:
            print(f"Error creating admin: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@admin_required
def get_admin_users_api(request):
    """API endpoint to get all admin users"""
    try:
        users_collection = mongodb.get_collection('users')
        admin_users = list(users_collection.find(
            {'is_admin': True},
            {
                'username': 1,
                'email': 1,
                'full_name': 1,
                'created_at': 1,
                'last_login': 1,
                'profile_picture': 1
            }
        ).sort('created_at', -1))
        
        admin_users_data = []
        for user in admin_users:
            admin_users_data.append({
                'id': str(user['_id']),
                'username': user.get('username', ''),
                'email': user.get('email', ''),
                'full_name': user.get('full_name', ''),
                'profile_picture': user.get('profile_picture', '/static/myapp/icons/top-user.png'),
                'created_at': user.get('created_at', datetime.utcnow()).isoformat(),
                'last_login': user.get('last_login', '').isoformat() if user.get('last_login') else 'Never'
            })
        
        return JsonResponse({
            'success': True,
            'admin_users': admin_users_data
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)# Add to admin_views.py

@admin_required
def create_admin_api(request):
    """API endpoint to create a new administrator"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['full_name', 'username', 'email', 'password']
            for field in required_fields:
                if not data.get(field):
                    return JsonResponse({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }, status=400)
            
            # Check if user already exists
            users_collection = mongodb.get_collection('users')
            existing_user = users_collection.find_one({
                '$or': [
                    {'email': data['email']},
                    {'username': data['username']}
                ]
            })
            
            if existing_user:
                return JsonResponse({
                    'success': False,
                    'error': 'User with this email or username already exists'
                }, status=400)
            
            # Create new admin user
            user_id = UserManager.create_user(
                email=data['email'],
                password=data['password'],
                full_name=data['full_name'],
                username=data['username'],
                is_admin=True
            )
            
            if user_id:
                # Log the admin creation
                admin_logs_collection = mongodb.get_collection('admin_logs')
                current_admin = SimpleAuth.get_current_user(request)
                
                admin_logs_collection.insert_one({
                    'action': 'create_admin',
                    'admin_id': current_admin['_id'],
                    'target_user_id': user_id,
                    'details': {
                        'email': data['email'],
                        'username': data['username'],
                        'admin_level': data.get('admin_level', 'super')
                    },
                    'created_at': datetime.utcnow()
                })
                
                return JsonResponse({
                    'success': True,
                    'message': 'Administrator created successfully',
                    'user_id': str(user_id)
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to create user'
                }, status=500)
                
        except Exception as e:
            print(f"Error creating admin: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@admin_required
def get_admin_users_api(request):
    """API endpoint to get all admin users"""
    try:
        users_collection = mongodb.get_collection('users')
        admin_users = list(users_collection.find(
            {'is_admin': True},
            {
                'username': 1,
                'email': 1,
                'full_name': 1,
                'created_at': 1,
                'last_login': 1,
                'profile_picture': 1
            }
        ).sort('created_at', -1))
        
        admin_users_data = []
        for user in admin_users:
            admin_users_data.append({
                'id': str(user['_id']),
                'username': user.get('username', ''),
                'email': user.get('email', ''),
                'full_name': user.get('full_name', ''),
                'profile_picture': user.get('profile_picture', '/static/myapp/icons/top-user.png'),
                'created_at': user.get('created_at', datetime.utcnow()).isoformat(),
                'last_login': user.get('last_login', '').isoformat() if user.get('last_login') else 'Never'
            })
        
        return JsonResponse({
            'success': True,
            'admin_users': admin_users_data
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
# Add to admin_views.py

@admin_required
def export_data_api(request):
    """API endpoint to export data in various formats"""
    try:
        export_type = request.GET.get('type', 'all')
        export_format = request.GET.get('format', 'csv')
        
        if export_type == 'users':
            data = export_users_data()
            filename = f'users_export_{datetime.utcnow().strftime("%Y%m%d")}'
        elif export_type == 'books':
            data = export_books_data()
            filename = f'books_export_{datetime.utcnow().strftime("%Y%m%d")}'
        elif export_type == 'posts':
            data = export_posts_data()
            filename = f'posts_export_{datetime.utcnow().strftime("%Y%m%d")}'
        else:
            data = export_all_data()
            filename = f'full_export_{datetime.utcnow().strftime("%Y%m%d")}'
        
        if export_format == 'json':
            response = JsonResponse(data, safe=False)
            response['Content-Disposition'] = f'attachment; filename="{filename}.json"'
            return response
        else:
            # Convert to CSV
            csv_data = convert_to_csv(data)
            response = HttpResponse(csv_data, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
            return response
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def export_users_data():
    """Export users data"""
    users_collection = mongodb.get_collection('users')
    users = list(users_collection.find({}, {
        'username': 1,
        'email': 1,
        'full_name': 1,
        'is_admin': 1,
        'created_at': 1,
        'last_login': 1
    }))
    
    users_data = []
    for user in users:
        users_data.append({
            'username': user.get('username', ''),
            'email': user.get('email', ''),
            'full_name': user.get('full_name', ''),
            'is_admin': 'Yes' if user.get('is_admin') else 'No',
            'created_at': user.get('created_at', '').strftime('%Y-%m-%d %H:%M:%S') if user.get('created_at') else '',
            'last_login': user.get('last_login', '').strftime('%Y-%m-%d %H:%M:%S') if user.get('last_login') else 'Never'
        })
    
    return users_data

def export_books_data():
    """Export books data"""
    books_collection = mongodb.get_collection('books')
    books = list(books_collection.find({}))
    
    books_data = []
    for book in books:
        books_data.append({
            'title': book.get('title', ''),
            'author': book.get('author', ''),
            'genre': ', '.join(book.get('genre', [])),
            'language': book.get('language', ''),
            'publication_year': book.get('publication_year', ''),
            'average_rating': book.get('average_rating', 0),
            'views_count': book.get('views_count', 0),
            'created_at': book.get('created_at', '').strftime('%Y-%m-%d %H:%M:%S') if book.get('created_at') else ''
        })
    
    return books_data

def export_posts_data():
    """Export posts data"""
    posts_collection = mongodb.get_collection('posts')
    users_collection = mongodb.get_collection('users')
    
    posts = list(posts_collection.find({}))
    
    posts_data = []
    for post in posts:
        user = users_collection.find_one({'_id': post['user_id']})
        posts_data.append({
            'user': user.get('username', '') if user else 'Unknown',
            'content_preview': post.get('content', '')[:100] + '...',
            'likes_count': len(post.get('likes', [])),
            'comments_count': len(post.get('comments', [])),
            'has_book': 'Yes' if 'book' in post else 'No',
            'created_at': post.get('created_at', '').strftime('%Y-%m-%d %H:%M:%S') if post.get('created_at') else ''
        })
    
    return posts_data

def export_all_data():
    """Export all data"""
    return {
        'users': export_users_data(),
        'books': export_books_data(),
        'posts': export_posts_data()
    }

def convert_to_csv(data):
    """Convert data to CSV format"""
    import csv
    from io import StringIO
    
    if isinstance(data, dict):
        # For all data export, create separate sections
        output = StringIO()
        writer = csv.writer(output)
        
        for data_type, items in data.items():
            writer.writerow([f'--- {data_type.upper()} DATA ---'])
            if items:
                writer.writerow(list(items[0].keys()))
                for item in items:
                    writer.writerow([str(value) for value in item.values()])
            writer.writerow([])
        
        return output.getvalue()
    else:
        # For single data type export
        output = StringIO()
        writer = csv.writer(output)
        
        if data:
            writer.writerow(list(data[0].keys()))
            for item in data:
                writer.writerow([str(value) for value in item.values()])
        
        return output.getvalue()
    
# myapp/admin_views.py - ADD THESE BOOKS MANAGEMENT FUNCTIONS

@admin_required
def get_admin_books_api(request):
    """API endpoint to get all books for admin with filtering and pagination"""
    try:
        books_collection = mongodb.get_collection('books')
        
        # Get query parameters
        category = request.GET.get('category', '')
        status = request.GET.get('status', '')
        search = request.GET.get('search', '')
        sort = request.GET.get('sort', 'newest')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('pageSize', 10))
        
        # Build query
        query = {}
        
        # Category filter
        if category:
            query['$or'] = [
                {'category': {'$regex': category, '$options': 'i'}},
                {'display_category': {'$regex': category, '$options': 'i'}},
                {'genre': {'$in': [category]}}
            ]
        
        # Search filter
        if search:
            query['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'author': {'$regex': search, '$options': 'i'}},
                {'isbn': {'$regex': search, '$options': 'i'}}
            ]
        
        # Sort options
        sort_option = {}
        if sort == 'newest':
            sort_option = {'publication_year': -1, 'created_at': -1}
        elif sort == 'oldest':
            sort_option = {'publication_year': 1, 'created_at': 1}
        elif sort == 'title-asc':
            sort_option = {'title': 1}
        elif sort == 'title-desc':
            sort_option = {'title': -1}
        elif sort == 'popular':
            sort_option = {'views_count': -1, 'average_rating': -1}
        else:
            sort_option = {'created_at': -1}
        
        # Calculate pagination
        skip = (page - 1) * page_size
        limit = page_size
        
        # Get books with pagination
        books = list(books_collection.find(query).sort(sort_option).skip(skip).limit(limit))
        total_books = books_collection.count_documents(query)
        
        # Convert ObjectId to string and format response
        books_data = []
        for book in books:
            book_data = {
                '_id': str(book['_id']),
                'title': book.get('title', 'Unknown Title'),
                'author': book.get('author', 'Unknown Author'),
                'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                'category': book.get('category', ''),
                'display_category': book.get('display_category', ''),
                'genre': book.get('genre', []),
                'description': book.get('description', ''),
                'language': book.get('language', 'Unknown'),
                'publication_year': book.get('publication_year', ''),
                'isbn': book.get('isbn', ''),
                'pages': book.get('pages', 0),
                'publisher': book.get('publisher', ''),
                'average_rating': book.get('average_rating', 0),
                'views_count': book.get('views_count', 0),
                'pdf_url': book.get('pdf_url', ''),
                'created_at': book.get('created_at', datetime.utcnow()).isoformat() if book.get('created_at') else datetime.utcnow().isoformat()
            }
            books_data.append(book_data)
        
        return JsonResponse({
            'success': True,
            'books': books_data,
            'total': total_books,
            'page': page,
            'pageSize': page_size,
            'totalPages': math.ceil(total_books / page_size)
        })
        
    except Exception as e:
        print(f"Error fetching books: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@admin_required
def create_book_api(request):
    """API endpoint to create a new book"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['title', 'author']
            for field in required_fields:
                if not data.get(field):
                    return JsonResponse({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }, status=400)
            
            books_collection = mongodb.get_collection('books')
            
            # Check if book with same title and author already exists
            existing_book = books_collection.find_one({
                'title': data['title'],
                'author': data['author']
            })
            
            if existing_book:
                return JsonResponse({
                    'success': False,
                    'error': 'A book with this title and author already exists'
                }, status=400)
            
            # Prepare book data
            book_data = {
                'title': data['title'],
                'author': data['author'],
                'cover_image': data.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                'category': data.get('category', 'general'),
                'display_category': data.get('display_category', data.get('category', 'general')),
                'genre': data.get('genre', []),
                'description': data.get('description', ''),
                'language': data.get('language', 'English'),
                'publication_year': data.get('publication_year'),
                'isbn': data.get('isbn', ''),
                'pages': data.get('pages', 0),
                'publisher': data.get('publisher', ''),
                'average_rating': 0,
                'views_count': 0,
                'pdf_url': data.get('pdf_url', ''),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            # Insert the book
            result = books_collection.insert_one(book_data)
            
            # Log the action
            admin_logs_collection = mongodb.get_collection('admin_logs')
            current_admin = SimpleAuth.get_current_user(request)
            
            admin_logs_collection.insert_one({
                'action': 'create_book',
                'admin_id': current_admin['_id'],
                'target_book_id': result.inserted_id,
                'details': {
                    'title': data['title'],
                    'author': data['author'],
                    'isbn': data.get('isbn', '')
                },
                'created_at': datetime.utcnow()
            })
            
            return JsonResponse({
                'success': True,
                'message': 'Book created successfully',
                'book_id': str(result.inserted_id)
            })
            
        except Exception as e:
            print(f"Error creating book: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@admin_required
def update_book_api(request, book_id):
    """API endpoint to update a book"""
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            books_collection = mongodb.get_collection('books')
            
            # Check if book exists
            existing_book = books_collection.find_one({'_id': ObjectId(book_id)})
            if not existing_book:
                return JsonResponse({
                    'success': False,
                    'error': 'Book not found'
                }, status=404)
            
            # Prepare update data
            update_data = {}
            updatable_fields = [
                'title', 'author', 'cover_image', 'category', 'display_category',
                'genre', 'description', 'language', 'publication_year', 'isbn',
                'pages', 'publisher', 'pdf_url'
            ]
            
            for field in updatable_fields:
                if field in data:
                    update_data[field] = data[field]
            
            update_data['updated_at'] = datetime.utcnow()
            
            # Update the book
            result = books_collection.update_one(
                {'_id': ObjectId(book_id)},
                {'$set': update_data}
            )
            
            if result.modified_count > 0:
                # Log the action
                admin_logs_collection = mongodb.get_collection('admin_logs')
                current_admin = SimpleAuth.get_current_user(request)
                
                admin_logs_collection.insert_one({
                    'action': 'update_book',
                    'admin_id': current_admin['_id'],
                    'target_book_id': ObjectId(book_id),
                    'details': {
                        'title': data.get('title', existing_book.get('title')),
                        'changes': update_data
                    },
                    'created_at': datetime.utcnow()
                })
                
                return JsonResponse({
                    'success': True,
                    'message': 'Book updated successfully'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'No changes made to the book'
                })
                
        except Exception as e:
            print(f"Error updating book: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@admin_required
def delete_book_api(request, book_id):
    """API endpoint to delete a book"""
    if request.method == 'DELETE':
        try:
            books_collection = mongodb.get_collection('books')
            
            # Check if book exists
            existing_book = books_collection.find_one({'_id': ObjectId(book_id)})
            if not existing_book:
                return JsonResponse({
                    'success': False,
                    'error': 'Book not found'
                }, status=404)
            
            # Delete the book
            result = books_collection.delete_one({'_id': ObjectId(book_id)})
            
            if result.deleted_count > 0:
                # Log the action
                admin_logs_collection = mongodb.get_collection('admin_logs')
                current_admin = SimpleAuth.get_current_user(request)
                
                admin_logs_collection.insert_one({
                    'action': 'delete_book',
                    'admin_id': current_admin['_id'],
                    'target_book_id': ObjectId(book_id),
                    'details': {
                        'title': existing_book.get('title', 'Unknown'),
                        'author': existing_book.get('author', 'Unknown')
                    },
                    'created_at': datetime.utcnow()
                })
                
                return JsonResponse({
                    'success': True,
                    'message': 'Book deleted successfully'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to delete book'
                }, status=500)
                
        except Exception as e:
            print(f"Error deleting book: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@admin_required
def get_books_statistics_api(request):
    """API endpoint for books statistics and charts"""
    try:
        books_collection = mongodb.get_collection('books')
        user_books_collection = mongodb.get_collection('user_books')
        
        # Total books count
        total_books = books_collection.count_documents({})
        
        # Books by category
        pipeline_category = [
            {'$group': {'_id': '$display_category', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
        category_data = list(books_collection.aggregate(pipeline_category))
        
        categories = []
        category_counts = []
        for item in category_data:
            categories.append(item['_id'] if item['_id'] else 'Uncategorized')
            category_counts.append(item['count'])
        
        # Monthly additions (last 6 months)
        monthly_data = []
        monthly_labels = []
        
        for i in range(5, -1, -1):
            month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_start = month_start - timedelta(days=30*i)
            next_month = month_start + timedelta(days=32)
            next_month = next_month.replace(day=1)
            
            monthly_count = books_collection.count_documents({
                'created_at': {
                    '$gte': month_start,
                    '$lt': next_month
                }
            })
            
            monthly_data.append(monthly_count)
            monthly_labels.append(month_start.strftime('%b %Y'))
        
        # Reading statistics
        reading_stats = user_books_collection.aggregate([
            {'$match': {'status': 'reading'}},
            {'$group': {'_id': '$book_id'}},
            {'$count': 'reading_count'}
        ])
        
        completed_stats = user_books_collection.aggregate([
            {'$match': {'status': 'completed'}},
            {'$group': {'_id': '$book_id'}},
            {'$count': 'completed_count'}
        ])
        
        reading_count = 0
        completed_count = 0
        
        try:
            reading_count = list(reading_stats)[0]['reading_count'] if reading_stats else 0
        except:
            reading_count = 0
            
        try:
            completed_count = list(completed_stats)[0]['completed_count'] if completed_stats else 0
        except:
            completed_count = 0
        
        # Available books (simplified - total minus currently reading)
        available_books = total_books - reading_count
        
        return JsonResponse({
            'success': True,
            'statistics': {
                'total_books': total_books,
                'available_books': available_books,
                'reading_count': reading_count,
                'completed_count': completed_count,
                'new_this_month': monthly_data[-1] if monthly_data else 0
            },
            'charts': {
                'categories': {
                    'labels': categories,
                    'data': category_counts
                },
                'monthly_additions': {
                    'labels': monthly_labels,
                    'data': monthly_data
                }
            }
        })
        
    except Exception as e:
        print(f"Error getting books statistics: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@admin_required
def bulk_import_books_api(request):
    """API endpoint for bulk importing books"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            books_data = data.get('books', [])
            
            if not books_data:
                return JsonResponse({
                    'success': False,
                    'error': 'No books data provided'
                }, status=400)
            
            books_collection = mongodb.get_collection('books')
            imported_count = 0
            errors = []
            
            for book_data in books_data:
                try:
                    # Validate required fields
                    if not book_data.get('title') or not book_data.get('author'):
                        errors.append(f"Missing title or author for book: {book_data}")
                        continue
                    
                    # Check if book already exists
                    existing_book = books_collection.find_one({
                        'title': book_data['title'],
                        'author': book_data['author']
                    })
                    
                    if existing_book:
                        errors.append(f"Book already exists: {book_data['title']} by {book_data['author']}")
                        continue
                    
                    # Prepare book document
                    book_doc = {
                        'title': book_data['title'],
                        'author': book_data['author'],
                        'cover_image': book_data.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                        'category': book_data.get('category', 'general'),
                        'display_category': book_data.get('display_category', book_data.get('category', 'general')),
                        'genre': book_data.get('genre', []),
                        'description': book_data.get('description', ''),
                        'language': book_data.get('language', 'English'),
                        'publication_year': book_data.get('publication_year'),
                        'isbn': book_data.get('isbn', ''),
                        'pages': book_data.get('pages', 0),
                        'publisher': book_data.get('publisher', ''),
                        'average_rating': 0,
                        'views_count': 0,
                        'pdf_url': book_data.get('pdf_url', ''),
                        'created_at': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    }
                    
                    # Insert book
                    books_collection.insert_one(book_doc)
                    imported_count += 1
                    
                except Exception as e:
                    errors.append(f"Error importing {book_data.get('title', 'Unknown')}: {str(e)}")
            
            # Log the bulk import
            admin_logs_collection = mongodb.get_collection('admin_logs')
            current_admin = SimpleAuth.get_current_user(request)
            
            admin_logs_collection.insert_one({
                'action': 'bulk_import_books',
                'admin_id': current_admin['_id'],
                'details': {
                    'total_attempted': len(books_data),
                    'successful_imports': imported_count,
                    'errors': len(errors)
                },
                'created_at': datetime.utcnow()
            })
            
            return JsonResponse({
                'success': True,
                'message': f'Successfully imported {imported_count} books',
                'imported_count': imported_count,
                'error_count': len(errors),
                'errors': errors
            })
            
        except Exception as e:
            print(f"Error in bulk import: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)