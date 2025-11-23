# myapp/urls.py - COMPLETE VERSION WITH ADMIN ROUTES
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from . import views
from . import admin_views
from .views import login_required

@login_required
def serve_static_pdf(request, path):
    """Serve static PDF files with authentication"""
    document_root = settings.STATIC_ROOT
    return serve(request, path, document_root=document_root)

urlpatterns = [
    # Public pages
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/<str:token>/', views.reset_password, name='reset_password'),
    path('api/check-username/', views.check_username_availability, name='check_username'),
    path('debug-username/', views.debug_username_check, name='debug_username'),
    
    # User pages (protected)
    path('user-home/', views.user_home, name='user_home'),
    path('explore/', views.explore_view, name='explore'),
    path('search/', views.search_view, name='search'),
    path('user-books/', views.user_books_view, name='user_books'),  
    path('admin-access/', views.admin_access_view, name='admin_access'),
    
    # Profile & Settings (protected)
    path('profile/', views.profile_view, name='profile'),
    path('profile/settings/', views.profile_settings_view, name='profile_settings'),
    path('debug-session/', views.debug_session_data, name='debug_session'),
    path('debug-users/', views.debug_users_collection, name='debug_users'),
    
    # PDF Reader route - MUST COME BEFORE STATIC FILES
    path('read/<str:book_id>/', views.pdf_reader_view, name='pdf_reader'),
    
    # Books API endpoints (protected)
    path('api/books/', views.get_books, name='get_books'),
    path('api/search/books/', views.search_books_api, name='search_books'),
    path('api/search/suggestions/', views.get_search_suggestions, name='search_suggestions'),
    path('api/user/books/', views.get_user_books_data, name='get_user_books_data'),
    path('api/wishlist/add/', views.add_to_wishlist_api, name='add_to_wishlist'),
    path('api/books/start-reading/', views.start_reading_api, name='start_reading'),
    path('api/reading/progress/', views.update_reading_progress_api, name='update_progress'),
    path('api/books/<str:book_id>/in-collection/', views.check_book_in_collection, name='check_book_in_collection'),
    path('api/books/remove-reading/', views.remove_from_reading_api, name='remove_reading'),
    path('api/books/move-to-reading/', views.move_to_reading_api, name='move_to_reading_api'),
    path('api/wishlist/remove/', views.remove_from_wishlist_api, name='remove_wishlist'),
    path('api/books/<str:book_id>/', views.get_book_details, name='get_book_details'),
    path('api/books/save-progress/', views.save_reading_progress_api, name='save_reading_progress'),
    
    # Password & Profile (protected)
    path('password-change/', views.password_change_view, name='password_change'),
    path('api/genres/all/', views.get_all_genres_api, name='get_all_genres'),
    path('api/profile/favorite-genres/', views.update_favorite_genres_api, name='update_favorite_genres'),
    path('api/profile/reading-goal/', views.update_reading_goal_api, name='update_reading_goal'),
    
    # Profile API endpoints (protected)
    path('api/profile/verify-password/', views.verify_password_api, name='verify_password_api'),
    path('api/profile/update/', views.update_profile_api, name='update_profile_api'),
    path('api/profile/picture/', views.update_profile_picture_api, name='update_profile_picture_api'),
    path('api/profile/password/', views.change_password_api, name='change_password_api'),
    path('api/profile/statistics/', views.get_user_statistics_api, name='get_user_statistics_api'),
    
    # Post API endpoints
    path('api/timeline-test/', views.test_timeline_api, name='test_timeline_api'),
    path('api/user/statistics/real/', views.get_user_statistics_real, name='get_user_statistics_real'),
    path('api/friends/activities/', views.get_friend_activities_api, name='get_friend_activities_api'),
    path('api/posts/', views.get_posts_api, name='get_posts_api'),
    path('api/posts/like/', views.like_post_api, name='like_post_api'),
    path('api/posts/comment/', views.add_comment_api, name='add_comment_api'),
    path('api/posts/create/', views.create_post_api, name='create_post_api'),
    
    path('create-sample-posts/', views.create_sample_posts, name='create_sample_posts'),
    path('debug-posts-data/', views.debug_posts_data, name='debug_posts_data'),
    
    # Notification URLs
    path('api/notifications/', views.get_notifications_api, name='get_notifications'),
    path('api/notifications/<str:notification_id>/read/', views.mark_notification_read_api, name='mark_notification_read'),
    path('api/notifications/read-all/', views.mark_all_notifications_read_api, name='mark_all_notifications_read'),
    path('api/notifications/<str:notification_id>/', views.delete_notification_api, name='delete_notification'),
    path('api/notifications/clear-all/', views.clear_all_notifications_api, name='clear_all_notifications'),
    path('api/notifications/create-sample/', views.create_sample_notifications, name='create_sample_notifications'),
    
    # Contact pages
    path('contact/', views.contact, name='contact'),
    
    # Contact API endpoints (for admin functionality)
    path('api/contact/submit/', views.submit_contact_api, name='submit_contact_api'),
    path('api/contacts/', views.get_contacts_api, name='get_contacts_api'),
    path('api/contacts/<str:contact_id>/', views.get_contact_detail_api, name='get_contact_detail_api'),
    path('api/contacts/<str:contact_id>/status/', views.update_contact_status_api, name='update_contact_status_api'),
    path('api/contacts/<str:contact_id>/delete/', views.delete_contact_api, name='delete_contact_api'),
    path('api/contact/stats/', views.get_contact_stats_api, name='get_contact_stats_api'),

    # Admin Pages
    path('admin/dashboard/', admin_views.admin_dashboard, name='admin_dashboard'),
    path('admin/books/', admin_views.admin_books, name='admin_books'),
    path('admin/users/', admin_views.admin_user_management, name='admin_users'),
    path('admin/moderation/', admin_views.admin_moderation, name='admin_moderation'),
    path('admin/reports/', admin_views.admin_reports, name='admin_reports'),
    path('admin/settings/', admin_views.admin_system_settings, name='admin_settings'),
    path('admin/profile/', admin_views.admin_profile, name='admin_profile'),
    path('admin/account/', admin_views.admin_account_settings, name='admin_account'),
    path('admin/contacts/', admin_views.admin_contact_dashboard, name='admin_contacts'),
    
    path('api/admin/create-admin/', admin_views.create_admin_api, name='create_admin_api'),
    path('api/admin/users/', admin_views.get_admin_users_api, name='admin_users_api'),
    
    #admin API endpoints
      
    # Admin Analytics APIs
    path('api/admin/analytics/user-activity/', admin_views.get_user_activity_data_api, name='admin_user_activity_api'),
    path('api/admin/analytics/content-distribution/', admin_views.get_content_distribution_api, name='admin_content_distribution_api'),
    path('api/admin/analytics/reading-analytics/', admin_views.get_reading_analytics_api, name='admin_reading_analytics_api'),
    # Add export data endpoint
    path('api/admin/export-data/', admin_views.export_data_api, name='export_data_api'),
    
    # Admin API Endpoints
    path('api/admin/statistics/', admin_views.get_admin_statistics_api, name='admin_statistics_api'),
    path('api/admin/users/', admin_views.get_all_users_api, name='admin_users_api'),
    path('api/admin/make-admin/', admin_views.make_user_admin_api, name='make_admin_api'),
    path('api/admin/remove-admin/', admin_views.remove_admin_api, name='remove_admin_api'),
    path('api/admin/books/', admin_views.get_admin_books_api, name='admin_books_api'),
    path('api/admin/posts/', admin_views.get_admin_posts_api, name='admin_posts_api'),
    path('api/admin/contacts/', admin_views.get_admin_contacts_api, name='admin_contacts_api'),
    path('api/admin/posts/<str:post_id>/delete/', admin_views.delete_post_api, name='admin_delete_post'),
    path('api/admin/books/<str:book_id>/delete/', admin_views.delete_book_api, name='admin_delete_book'),
    path('api/admin/users/<str:user_id>/delete/', admin_views.delete_user_api, name='admin_delete_user'),
    path('api/admin/create-first-admin/', admin_views.create_first_admin, name='create_first_admin'),


    # Admin Books Management URLs
    path('api/admin/books/all/', admin_views.get_all_books_api, name='admin_books_all'),
    path('api/admin/books/statistics/', admin_views.get_books_statistics_api, name='admin_books_statistics'),
    path('api/admin/books/create/', admin_views.create_book_api, name='admin_books_create'),
    path('api/admin/books/<str:book_id>/update/', admin_views.update_book_api, name='admin_books_update'),
    path('api/admin/books/<str:book_id>/delete/', admin_views.delete_book_api, name='admin_books_delete'),
    path('api/admin/books/bulk-import/', admin_views.bulk_import_books_api, name='admin_books_bulk_import'),
    
    # Debug routes
    path('api/debug/password-raw/', views.debug_password_raw, name='debug_password_raw'),
    path('api/debug/emergency-password-fix/', views.emergency_password_fix, name='emergency_password_fix'),
    path('api/debug/password-check/', views.debug_password_check, name='debug_password_check'),
    path('api/debug/test-password/', views.test_my_password, name='test_my_password'),
    path('api/profile/change-password/', views.change_password_api, name='change_password_api'),
    path('api/check-username/', views.check_username_api, name='check_username_api'),
    path('test-user-home/', views.test_user_home, name='test_user_home'),
    path('debug-cookies/', views.debug_cookies, name='debug_cookies'),
    path('debug-auth/', views.debug_auth, name='debug_auth'),
    path('test-books/', views.test_books, name='test_books'),
    path('debug/user-books-data/', views.debug_user_books_data, name='debug_user_books_data'),
    path('debug/user-storage/', views.debug_user_storage, name='debug_user_storage'),
    path('api/debug/user-info/', views.debug_user_info, name='debug_user_info'),
    path('debug-auth-status/', views.debug_auth_status, name='debug_auth_status'),
    path('debug-session-full/', views.debug_session_full, name='debug_session_full'),
    path('api/debug/reset-password/', views.reset_my_password, name='reset_my_password'),
    
    # Post routes (protected)
    path('create-post/', views.create_post, name='create_post'),
    path('like-post/', views.like_post, name='like_post'),
    path('add-comment/', views.add_comment, name='add_comment'),
]

# Serve static PDF files in development (protected) - ADD THIS AT THE END
if settings.DEBUG:
    urlpatterns += [
        path('static/<path:path>', views.serve_static_pdf, name='serve_static_pdf')
    ]
    # Also serve regular static files
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)