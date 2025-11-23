# myapp/models.py - COMPLETE FIXED VERSION WITH ADMIN SUPPORT
from datetime import datetime
from django.contrib.auth.hashers import make_password
from .mongodb import mongodb
from bson import ObjectId

class UserManager:
    @staticmethod
    def create_user(email, password, full_name, username=None, **extra_fields):
        users = mongodb.get_collection('users')
        
        # Check if email already exists
        if users.find_one({'email': email}):
            raise ValueError("User with this email already exists")
        
        # Check if username already exists (if provided)
        if username:
            import re
            existing_username = users.find_one({
                'username': {'$regex': f'^{re.escape(username)}$', '$options': 'i'}
            })
            if existing_username:
                raise ValueError("Username is already taken")
        else:
            # Use email as username if not provided
            username = email.split('@')[0]  # Use email prefix as default username
        
        # Split full_name into first and last name
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        user_data = {
            'email': email,
            'username': username,
            'password': make_password(password),
            'full_name': full_name,
            'first_name': first_name,
            'last_name': last_name,
            'profile_picture': extra_fields.get('profile_picture', '/static/myapp/icons/top-user.png'),
            'bio': extra_fields.get('bio', ''),
            'reading_goal': extra_fields.get('reading_goal', 12),
            'favorite_genres': extra_fields.get('favorite_genres', []),
            'email_notifications': extra_fields.get('email_notifications', True),
            'public_profile': extra_fields.get('public_profile', True),
            'two_factor_enabled': extra_fields.get('two_factor_enabled', False),
            'is_admin': extra_fields.get('is_admin', False),  # ADMIN FIELD ADDED
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'last_login': None
        }
        
        result = users.insert_one(user_data)
        return result.inserted_id
    
    @staticmethod
    def get_user_by_email(email):
        users = mongodb.get_collection('users')
        return users.find_one({'email': email})
    
    @staticmethod
    def update_user(email, **updates):
        users = mongodb.get_collection('users')
        updates['updated_at'] = datetime.utcnow()
        return users.update_one(
            {'email': email},
            {'$set': updates}
        )
    
    @staticmethod
    def make_admin(user_id):
        """Make a user admin"""
        users = mongodb.get_collection('users')
        result = users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_admin': True, 'updated_at': datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    @staticmethod
    def remove_admin(user_id):
        """Remove admin privileges from user"""
        users = mongodb.get_collection('users')
        result = users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_admin': False, 'updated_at': datetime.utcnow()}}
        )
        return result.modified_count > 0

class ContactManager:
    @staticmethod
    def create_contact(name, email, subject, message):
        contacts = mongodb.get_collection('contacts')
        contact_data = {
            'name': name,
            'email': email,
            'subject': subject,
            'message': message,
            'created_at': datetime.utcnow(),
            'status': 'pending'
        }
        return contacts.insert_one(contact_data)

class PostManager:
    @staticmethod
    def create_post(user_id, content, book_data=None):
        posts = mongodb.get_collection('posts')
        
        post_data = {
            'user_id': ObjectId(user_id),
            'content': content,
            'book': book_data,
            'likes': [],
            'comments': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = posts.insert_one(post_data)
        return result.inserted_id
    
    @staticmethod
    def like_post(post_id, user_id):
        posts = mongodb.get_collection('posts')
        result = posts.update_one(
            {'_id': ObjectId(post_id)},
            {'$addToSet': {'likes': user_id}}
        )
        return result.modified_count > 0
    
    @staticmethod
    def unlike_post(post_id, user_id):
        posts = mongodb.get_collection('posts')
        result = posts.update_one(
            {'_id': ObjectId(post_id)},
            {'$pull': {'likes': user_id}}
        )
        return result.modified_count > 0
    
    @staticmethod
    def add_comment(post_id, user_id, user_name, content):
        posts = mongodb.get_collection('posts')
        
        comment_data = {
            'id': str(ObjectId()),
            'user_id': user_id,
            'user_name': user_name,
            'content': content,
            'created_at': datetime.utcnow()
        }
        
        result = posts.update_one(
            {'_id': ObjectId(post_id)},
            {'$push': {'comments': comment_data}}
        )
        return result.modified_count > 0

class UserBooksManager:
    @staticmethod
    def add_to_wishlist(user_id, book_id, book_data):
        """Add a book to user's wishlist in user_wishlist collection"""
        user_wishlist = mongodb.get_collection('user_wishlist')
        
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        # Check if book already exists in wishlist
        existing = user_wishlist.find_one({
            'user_id': user_id_obj,
            'book_id': book_id
        })
        
        if existing:
            raise ValueError("Book already in your wishlist")
        
        wishlist_data = {
            'user_id': user_id_obj,
            'book_id': book_id,
            'title': book_data.get('title'),
            'author': book_data.get('author'),
            'cover_image': book_data.get('cover_image'),
            'genre': book_data.get('genre', []),
            'status': 'wishlist',
            'added_at': datetime.utcnow(),
            'created_at': datetime.utcnow()
        }
        
        result = user_wishlist.insert_one(wishlist_data)
        return result.inserted_id
    
    @staticmethod
    def get_user_wishlist(user_id):
        """Get user's wishlist books from user_wishlist collection"""
        user_wishlist = mongodb.get_collection('user_wishlist')
        
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        print(f"🔍 MongoDB Query for user_wishlist: user_id={user_id_obj}")
        
        books = list(user_wishlist.find({'user_id': user_id_obj}).sort('added_at', -1))
        
        print(f"📚 Found {len(books)} wishlist books for user {user_id}")
        
        # Convert ObjectId to string for JSON serialization
        processed_books = []
        for book in books:
            book_data = {
                '_id': str(book['_id']),
                'book_id': book.get('book_id', str(book['_id'])),
                'user_id': str(book['user_id']),
                'title': book.get('title', 'Unknown Title'),
                'author': book.get('author', 'Unknown Author'),
                'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                'status': book.get('status', 'wishlist'),
                'genre': book.get('genre', []),
                'added_at': book.get('added_at', None),
                'created_at': book.get('created_at', None)
            }
            processed_books.append(book_data)
            
            print(f"📖 Wishlist book - Title: {book_data['title']}, Added: {book_data['added_at']}")
        
        return processed_books
    
    @staticmethod
    def get_user_reading_books(user_id):
        """Get user's reading books from user_books collection"""
        user_books = mongodb.get_collection('user_books')
        
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        print(f"🔍 MongoDB Query for reading books: user_id={user_id_obj}, status=reading")
        
        books = list(user_books.find({
            'user_id': user_id_obj,
            'status': 'reading'
        }).sort('last_read', -1))
        
        print(f"📖 Found {len(books)} reading books for user {user_id}")
        
        # Convert ObjectId to string for JSON serialization
        processed_books = []
        for book in books:
            book_data = {
                '_id': str(book['_id']),
                'book_id': book.get('book_id', str(book['_id'])),
                'user_id': str(book['user_id']),
                'title': book.get('title', 'Unknown Title'),
                'author': book.get('author', 'Unknown Author'),
                'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                'status': book.get('status', 'reading'),
                'progress': book.get('progress', 0),
                'last_read': book.get('last_read', None),
                'genre': book.get('genre', []),
                'started_at': book.get('started_at', None)
            }
            processed_books.append(book_data)
            
            print(f"📖 Reading book - Title: {book_data['title']}, Progress: {book_data['progress']}%")
        
        return processed_books
    
    @staticmethod
    def remove_from_wishlist(user_id, book_id):
        """Remove book from user's wishlist"""
        user_wishlist = mongodb.get_collection('user_wishlist')
        
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        result = user_wishlist.delete_one({
            'user_id': user_id_obj,
            'book_id': book_id
        })
        return result.deleted_count > 0
    
    @staticmethod
    def is_book_in_wishlist(user_id, book_id):
        """Check if book is in user's wishlist"""
        user_wishlist = mongodb.get_collection('user_wishlist')
        
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        book = user_wishlist.find_one({
            'user_id': user_id_obj,
            'book_id': book_id
        })
        return book is not None

    @staticmethod
    def remove_from_reading(user_id, book_id):
        """Remove book from user's reading collection"""
        user_books = mongodb.get_collection('user_books')
        
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        result = user_books.delete_one({
            'user_id': user_id_obj,
            'book_id': book_id,
            'status': 'reading'
        })
        return result.deleted_count > 0

    @staticmethod
    def start_reading(user_id, book_id, book_data):
        """Start reading a book - COMPLETELY FIXED VERSION"""
        try:
            from bson import ObjectId
            from datetime import datetime
            
            print(f"🎯 UserBooksManager.start_reading called: user_id={user_id}, book_id={book_id}")
            
            user_books = mongodb.get_collection('user_books')
            user_wishlist = mongodb.get_collection('user_wishlist')
            
            # Convert IDs to ObjectId
            user_id_obj = ObjectId(user_id)
            book_id_str = str(book_id)  # Ensure it's a string
            
            print(f"🔍 Converted IDs - user_id_obj: {user_id_obj}, book_id_str: {book_id_str}")
            
            # Check if book already exists in reading list
            existing_book = user_books.find_one({
                'user_id': user_id_obj,
                'book_id': book_id_str
            })
            
            if existing_book:
                print(f"ℹ️ Book already in reading list, updating: {book_id_str}")
                # Update existing record
                result = user_books.update_one(
                    {'_id': existing_book['_id']},
                    {'$set': {
                        'status': 'reading',
                        'last_read': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    }}
                )
                success = result.modified_count > 0
            else:
                print(f"➕ Adding new book to reading list: {book_id_str}")
                # Create new record
                reading_data = {
                    'user_id': user_id_obj,
                    'book_id': book_id_str,  # Use string version
                    'title': book_data.get('title', 'Unknown Title'),
                    'author': book_data.get('author', 'Unknown Author'),
                    'cover_image': book_data.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                    'genre': book_data.get('genre', []),
                    'status': 'reading',
                    'progress': 0,
                    'started_at': datetime.utcnow(),
                    'last_read': datetime.utcnow(),
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
                
                print(f"📝 Inserting reading data: {reading_data}")
                result = user_books.insert_one(reading_data)
                success = result.inserted_id is not None
            
            # Remove from wishlist if it exists there
            if success:
                print(f"🗑️ Removing from wishlist: {book_id_str}")
                wishlist_result = user_wishlist.delete_one({
                    'user_id': user_id_obj,
                    'book_id': book_id_str
                })
                
                if wishlist_result.deleted_count > 0:
                    print(f"✅ Removed from wishlist: {book_id_str}")
                else:
                    print(f"ℹ️ Book not found in wishlist: {book_id_str}")
            
            print(f"🎉 start_reading completed: success={success}")
            return success
            
        except Exception as e:
            print(f"❌ Error in UserBooksManager.start_reading: {str(e)}")
            import traceback
            traceback.print_exc()
            return False

    @staticmethod
    def update_progress(user_id, book_id, progress):
        """Update reading progress for a book"""
        user_books = mongodb.get_collection('user_books')
        
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        result = user_books.update_one(
            {
                'user_id': user_id_obj,
                'book_id': book_id
            },
            {
                '$set': {
                    'progress': progress,
                    'last_read': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    @staticmethod
    def get_user_books(user_id, status=None):
        """Get user's books from user_books collection (for backward compatibility)"""
        user_books = mongodb.get_collection('user_books')
        
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        query = {'user_id': user_id_obj}
        if status:
            query['status'] = status
        
        books = list(user_books.find(query).sort('last_read', -1))
        
        # Convert ObjectId to string for JSON serialization
        processed_books = []
        for book in books:
            book_data = {
                '_id': str(book['_id']),
                'book_id': book.get('book_id', str(book['_id'])),
                'user_id': str(book['user_id']),
                'title': book.get('title', 'Unknown Title'),
                'author': book.get('author', 'Unknown Author'),
                'cover_image': book.get('cover_image', '/static/myapp/images/bookCover/default.jpg'),
                'status': book.get('status', 'unknown'),
                'progress': book.get('progress', 0),
                'last_read': book.get('last_read', None),
                'started_at': book.get('started_at', None),
                'genre': book.get('genre', [])
            }
            processed_books.append(book_data)
        
        return processed_books

    @staticmethod
    def is_book_in_collection(user_id, book_id):
        """Check if book is in user's reading collection"""
        user_books = mongodb.get_collection('user_books')
        
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        book = user_books.find_one({
            'user_id': user_id_obj,
            'book_id': book_id
        })
        return book is not None

class ContactManager:
    """Manager for contact form submissions"""
    
    @staticmethod
    def create_contact(name, email, subject, message):
        """Create a new contact form submission"""
        try:
            contact_collection = mongodb.get_collection('contacts')
            
            contact_data = {
                'name': name,
                'email': email,
                'subject': subject,
                'message': message,
                'submitted_at': datetime.utcnow(),
                'status': 'new',  # new, read, replied
                'ip_address': ''  # You can add IP tracking if needed
            }
            
            result = contact_collection.insert_one(contact_data)
            print(f"✅ Contact message saved to database with ID: {result.inserted_id}")
            return result.inserted_id
            
        except Exception as e:
            print(f"❌ Error saving contact message: {e}")
            raise e
    
    @staticmethod
    def get_all_contacts(limit=50):
        """Get all contact submissions (for admin purposes)"""
        try:
            contact_collection = mongodb.get_collection('contact')
            contacts = list(contact_collection.find().sort('submitted_at', -1).limit(limit))
            
            # Convert ObjectId to string for JSON serialization
            for contact in contacts:
                contact['_id'] = str(contact['_id'])
                contact['submitted_at'] = contact['submitted_at'].isoformat()
            
            return contacts
            
        except Exception as e:
            print(f"❌ Error fetching contacts: {e}")
            return []
    
    @staticmethod
    def get_contact_by_id(contact_id):
        """Get a specific contact submission by ID"""
        try:
            contact_collection = mongodb.get_collection('contact')
            contact = contact_collection.find_one({'_id': ObjectId(contact_id)})
            
            if contact:
                contact['_id'] = str(contact['_id'])
                contact['submitted_at'] = contact['submitted_at'].isoformat()
            
            return contact
            
        except Exception as e:
            print(f"❌ Error fetching contact: {e}")
            return None
    
    @staticmethod
    def update_contact_status(contact_id, status):
        """Update the status of a contact submission"""
        try:
            contact_collection = mongodb.get_collection('contact')
            
            result = contact_collection.update_one(
                {'_id': ObjectId(contact_id)},
                {'$set': {
                    'status': status,
                    'updated_at': datetime.utcnow()
                }}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            print(f"❌ Error updating contact status: {e}")
            return False
    
    @staticmethod
    def delete_contact(contact_id):
        """Delete a contact submission"""
        try:
            contact_collection = mongodb.get_collection('contact')
            result = contact_collection.delete_one({'_id': ObjectId(contact_id)})
            return result.deleted_count > 0
            
        except Exception as e:
            print(f"❌ Error deleting contact: {e}")
            return False
    
    @staticmethod
    def get_contact_stats():
        """Get statistics about contact submissions"""
        try:
            contact_collection = mongodb.get_collection('contact')
            
            total = contact_collection.count_documents({})
            new_count = contact_collection.count_documents({'status': 'new'})
            read_count = contact_collection.count_documents({'status': 'read'})
            replied_count = contact_collection.count_documents({'status': 'replied'})
            
            return {
                'total': total,
                'new': new_count,
                'read': read_count,
                'replied': replied_count
            }
            
        except Exception as e:
            print(f"❌ Error getting contact stats: {e}")
            return {'total': 0, 'new': 0, 'read': 0, 'replied': 0}