// myapp/static/myapp/js/notification.js - FIXED VERSION
console.log('🔔 notification.js loaded');

// Use IIFE to prevent variable conflicts
(function() {
    'use strict';
    
    // Check if already initialized
    if (window.notificationManager) {
        console.log('ℹ️ Notification system already initialized');
        return;
    }

    const notificationManager = {
        notifications: [],
        isOpen: false,
        pollingInterval: null,

        init: function() {
            console.log('🔔 Initializing notification system...');
            this.setupEventListeners();
            this.loadNotifications();
            this.startPolling();
        },

        setupEventListeners: function() {
            const notificationBtn = document.querySelector('.nr-notification-btn');
            const notificationDropdown = document.getElementById('notificationDropdown');
            const clearAllBtn = document.getElementById('clearAllNotifications');

            console.log('🔍 Setting up notification event listeners...');

            // Toggle notification dropdown
            if (notificationBtn) {
                notificationBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('🔔 Notification button clicked');
                    this.toggleDropdown();
                });
            } else {
                console.warn('⚠️ Notification button not found');
            }

            // Clear all notifications
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.clearAllNotifications();
                });
            }

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const notificationContainer = document.querySelector('.notification-container');
                if (!notificationContainer?.contains(e.target)) {
                    this.closeDropdown();
                }
            });

            // Handle notification clicks
            document.addEventListener('click', (e) => {
                if (e.target.closest('.notification-item')) {
                    const notificationItem = e.target.closest('.notification-item');
                    const notificationId = notificationItem.dataset.id;
                    this.handleNotificationClick(notificationId, notificationItem);
                }
            });
        },

        toggleDropdown: function() {
            const dropdown = document.getElementById('notificationDropdown');
            if (!dropdown) {
                console.warn('⚠️ Notification dropdown not found');
                return;
            }

            if (dropdown.classList.contains('show')) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        },

        openDropdown: function() {
            const dropdown = document.getElementById('notificationDropdown');
            if (dropdown) {
                dropdown.classList.add('show');
                this.isOpen = true;
                this.markAllAsRead();
                console.log('🔔 Notification dropdown opened');
            }
        },

        closeDropdown: function() {
            const dropdown = document.getElementById('notificationDropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
                this.isOpen = false;
                console.log('🔔 Notification dropdown closed');
            }
        },

        loadNotifications: async function() {
            try {
                console.log('📡 Loading notifications from API...');
                const response = await fetch('/api/notifications/', {
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        this.notifications = data.notifications || [];
                        this.renderNotifications();
                        this.updateBadge();
                        console.log(`✅ Loaded ${this.notifications.length} notifications`);
                    } else {
                        console.error('❌ Failed to load notifications:', data.error);
                    }
                } else {
                    console.error('❌ HTTP error loading notifications:', response.status);
                }
            } catch (error) {
                console.error('❌ Error loading notifications:', error);
            }
        },

        renderNotifications: function() {
            const notificationList = document.getElementById('notificationList');
            if (!notificationList) {
                console.warn('⚠️ Notification list element not found');
                return;
            }
            
            if (!this.notifications.length) {
                notificationList.innerHTML = `
                    <li class="notification-empty">
                        <div class="notification-empty-icon">🔔</div>
                        <p>No notifications yet</p>
                        <small class="text-muted">You'll see notifications here when someone interacts with your posts</small>
                    </li>
                `;
                return;
            }

            notificationList.innerHTML = this.notifications.map(notification => `
                <li class="notification-item ${notification.read ? '' : 'unread'} ${this.getNotificationTypeClass(notification.type)}"
                    data-id="${notification.id}">
                    <img src="${notification.sender_avatar || '/static/myapp/icons/top-user.png'}" 
                         alt="${notification.sender_name}" 
                         class="notification-avatar"
                         onerror="this.src='/static/myapp/icons/top-user.png'">
                    <div class="notification-content">
                        <p class="notification-text">${this.formatNotificationText(notification)}</p>
                        <div class="notification-time">${this.formatTime(notification.created_at)}</div>
                        ${!notification.read ? `
                        <div class="notification-actions">
                            <button type="button" class="notification-action-btn notification-view-btn" 
                                    onclick="window.notificationManager.viewNotification('${notification.id}')">
                                View
                            </button>
                            <button type="button" class="notification-action-btn notification-dismiss-btn" 
                                    onclick="window.notificationManager.dismissNotification('${notification.id}')">
                                Dismiss
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </li>
            `).join('');
        },

        formatNotificationText: function(notification) {
            const sender = `<strong>${notification.sender_name}</strong>`;
            
            switch (notification.type) {
                case 'like':
                    return `${sender} liked your post`;
                case 'comment':
                    return `${sender} commented on your post`;
                case 'post':
                    return `${sender} created a new post`;
                case 'follow':
                    return `${sender} started following you`;
                default:
                    return notification.message || 'New notification';
            }
        },

        getNotificationTypeClass: function(type) {
            const typeMap = {
                'like': 'notification-like',
                'comment': 'notification-comment',
                'post': 'notification-post',
                'follow': 'notification-follow'
            };
            return typeMap[type] || '';
        },

        updateBadge: function() {
            const badge = document.getElementById('notificationBadge');
            const unreadCount = this.notifications.filter(n => !n.read).length;
            
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    badge.style.display = 'flex';
                    console.log(`🔴 Notification badge: ${unreadCount} unread`);
                } else {
                    badge.style.display = 'none';
                    console.log('🟢 No unread notifications');
                }
            }
        },

        markAsRead: async function(notificationId) {
            try {
                const response = await fetch(`/api/notifications/${notificationId}/read/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': this.getCSRFToken(),
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Update local state
                    const notification = this.notifications.find(n => n.id === notificationId);
                    if (notification) {
                        notification.read = true;
                        this.renderNotifications();
                        this.updateBadge();
                        console.log(`✅ Marked notification ${notificationId} as read`);
                    }
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },

        markAllAsRead: async function() {
            try {
                const response = await fetch('/api/notifications/read-all/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': this.getCSRFToken(),
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Update all notifications as read locally
                    this.notifications.forEach(notification => {
                        notification.read = true;
                    });
                    this.renderNotifications();
                    this.updateBadge();
                    console.log('✅ Marked all notifications as read');
                }
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
            }
        },

        dismissNotification: async function(notificationId) {
            try {
                const response = await fetch(`/api/notifications/${notificationId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': this.getCSRFToken()
                    }
                });
                
                if (response.ok) {
                    // Remove from local list
                    this.notifications = this.notifications.filter(n => n.id !== notificationId);
                    this.renderNotifications();
                    this.updateBadge();
                    console.log(`✅ Dismissed notification ${notificationId}`);
                }
            } catch (error) {
                console.error('Error dismissing notification:', error);
            }
        },

        clearAllNotifications: async function() {
            try {
                const response = await fetch('/api/notifications/clear-all/', {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': this.getCSRFToken()
                    }
                });
                
                if (response.ok) {
                    this.notifications = [];
                    this.renderNotifications();
                    this.updateBadge();
                    console.log('✅ Cleared all notifications');
                }
            } catch (error) {
                console.error('Error clearing all notifications:', error);
            }
        },

        handleNotificationClick: function(notificationId, element) {
            this.markAsRead(notificationId);
            
            // You can add navigation logic here based on notification type
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                switch (notification.type) {
                    case 'like':
                    case 'comment':
                        // Scroll to the post
                        this.scrollToPost(notification.post_id);
                        break;
                    case 'post':
                        // Show the new post
                        this.showPost(notification.post_id);
                        break;
                }
            }
            
            this.closeDropdown();
        },

        scrollToPost: function(postId) {
            // Implement scroll to post logic
            console.log('Scrolling to post:', postId);
            // You can implement this based on your post structure
        },

        showPost: function(postId) {
            // Implement show post logic
            console.log('Showing post:', postId);
        },

        startPolling: function() {
            // Poll for new notifications every 30 seconds
            this.pollingInterval = setInterval(() => {
                if (!this.isOpen) {
                    this.loadNotifications();
                }
            }, 30000);
            console.log('🔄 Started notification polling (30s interval)');
        },

        stopPolling: function() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                console.log('🛑 Stopped notification polling');
            }
        },

        formatTime: function(timestamp) {
            if (!timestamp) return 'Just now';
            
            try {
                const date = new Date(timestamp);
                const now = new Date();
                const diffInSeconds = Math.floor((now - date) / 1000);
                
                if (diffInSeconds < 60) return 'Just now';
                if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
                if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
                if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
                
                return date.toLocaleDateString();
            } catch (error) {
                return 'Recently';
            }
        },

        // Add missing methods that are called from onclick handlers
        viewNotification: function(notificationId) {
            this.handleNotificationClick(notificationId);
        },

        // CSRF Token helper
        getCSRFToken: function() {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
            return csrfToken ? csrfToken.value : '';
        }
    };

    // Initialize only when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.notificationManager = notificationManager;
            window.notificationManager.init();
        });
    } else {
        window.notificationManager = notificationManager;
        window.notificationManager.init();
    }

    console.log('✅ Notification system initialized successfully');
})();// myapp/static/myapp/js/notification.js - FIXED VERSION
console.log('🔔 notification.js loaded');

// Use IIFE to prevent variable conflicts
(function() {
    'use strict';
    
    // Check if already initialized
    if (window.notificationManager) {
        console.log('ℹ️ Notification system already initialized');
        return;
    }

    const notificationManager = {
        notifications: [],
        isOpen: false,
        pollingInterval: null,

        init: function() {
            console.log('🔔 Initializing notification system...');
            this.setupEventListeners();
            this.loadNotifications();
            this.startPolling();
        },

        setupEventListeners: function() {
            const notificationBtn = document.querySelector('.nr-notification-btn');
            const notificationDropdown = document.getElementById('notificationDropdown');
            const clearAllBtn = document.getElementById('clearAllNotifications');

            console.log('🔍 Setting up notification event listeners...');

            // Toggle notification dropdown
            if (notificationBtn) {
                notificationBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('🔔 Notification button clicked');
                    this.toggleDropdown();
                });
            } else {
                console.warn('⚠️ Notification button not found');
            }

            // Clear all notifications
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.clearAllNotifications();
                });
            }

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const notificationContainer = document.querySelector('.notification-container');
                if (!notificationContainer?.contains(e.target)) {
                    this.closeDropdown();
                }
            });

            // Handle notification clicks
            document.addEventListener('click', (e) => {
                if (e.target.closest('.notification-item')) {
                    const notificationItem = e.target.closest('.notification-item');
                    const notificationId = notificationItem.dataset.id;
                    this.handleNotificationClick(notificationId, notificationItem);
                }
            });
        },

        toggleDropdown: function() {
            const dropdown = document.getElementById('notificationDropdown');
            if (!dropdown) {
                console.warn('⚠️ Notification dropdown not found');
                return;
            }

            if (dropdown.classList.contains('show')) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        },

        openDropdown: function() {
            const dropdown = document.getElementById('notificationDropdown');
            if (dropdown) {
                dropdown.classList.add('show');
                this.isOpen = true;
                this.markAllAsRead();
                console.log('🔔 Notification dropdown opened');
            }
        },

        closeDropdown: function() {
            const dropdown = document.getElementById('notificationDropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
                this.isOpen = false;
                console.log('🔔 Notification dropdown closed');
            }
        },

        loadNotifications: async function() {
            try {
                console.log('📡 Loading notifications from API...');
                const response = await fetch('/api/notifications/', {
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        this.notifications = data.notifications || [];
                        this.renderNotifications();
                        this.updateBadge();
                        console.log(`✅ Loaded ${this.notifications.length} notifications`);
                    } else {
                        console.error('❌ Failed to load notifications:', data.error);
                    }
                } else {
                    console.error('❌ HTTP error loading notifications:', response.status);
                }
            } catch (error) {
                console.error('❌ Error loading notifications:', error);
            }
        },

        renderNotifications: function() {
            const notificationList = document.getElementById('notificationList');
            if (!notificationList) {
                console.warn('⚠️ Notification list element not found');
                return;
            }
            
            if (!this.notifications.length) {
                notificationList.innerHTML = `
                    <li class="notification-empty">
                        <div class="notification-empty-icon">🔔</div>
                        <p>No notifications yet</p>
                        <small class="text-muted">You'll see notifications here when someone interacts with your posts</small>
                    </li>
                `;
                return;
            }

            notificationList.innerHTML = this.notifications.map(notification => `
                <li class="notification-item ${notification.read ? '' : 'unread'} ${this.getNotificationTypeClass(notification.type)}"
                    data-id="${notification.id}">
                    <img src="${notification.sender_avatar || '/static/myapp/icons/top-user.png'}" 
                         alt="${notification.sender_name}" 
                         class="notification-avatar"
                         onerror="this.src='/static/myapp/icons/top-user.png'">
                    <div class="notification-content">
                        <p class="notification-text">${this.formatNotificationText(notification)}</p>
                        <div class="notification-time">${this.formatTime(notification.created_at)}</div>
                        ${!notification.read ? `
                        <div class="notification-actions">
                            <button type="button" class="notification-action-btn notification-view-btn" 
                                    onclick="window.notificationManager.viewNotification('${notification.id}')">
                                View
                            </button>
                            <button type="button" class="notification-action-btn notification-dismiss-btn" 
                                    onclick="window.notificationManager.dismissNotification('${notification.id}')">
                                Dismiss
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </li>
            `).join('');
        },

        formatNotificationText: function(notification) {
            const sender = `<strong>${notification.sender_name}</strong>`;
            
            switch (notification.type) {
                case 'like':
                    return `${sender} liked your post`;
                case 'comment':
                    return `${sender} commented on your post`;
                case 'post':
                    return `${sender} created a new post`;
                case 'follow':
                    return `${sender} started following you`;
                default:
                    return notification.message || 'New notification';
            }
        },

        getNotificationTypeClass: function(type) {
            const typeMap = {
                'like': 'notification-like',
                'comment': 'notification-comment',
                'post': 'notification-post',
                'follow': 'notification-follow'
            };
            return typeMap[type] || '';
        },

        updateBadge: function() {
            const badge = document.getElementById('notificationBadge');
            const unreadCount = this.notifications.filter(n => !n.read).length;
            
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    badge.style.display = 'flex';
                    console.log(`🔴 Notification badge: ${unreadCount} unread`);
                } else {
                    badge.style.display = 'none';
                    console.log('🟢 No unread notifications');
                }
            }
        },

        markAsRead: async function(notificationId) {
            try {
                const response = await fetch(`/api/notifications/${notificationId}/read/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': this.getCSRFToken(),
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Update local state
                    const notification = this.notifications.find(n => n.id === notificationId);
                    if (notification) {
                        notification.read = true;
                        this.renderNotifications();
                        this.updateBadge();
                        console.log(`✅ Marked notification ${notificationId} as read`);
                    }
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },

        markAllAsRead: async function() {
            try {
                const response = await fetch('/api/notifications/read-all/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': this.getCSRFToken(),
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Update all notifications as read locally
                    this.notifications.forEach(notification => {
                        notification.read = true;
                    });
                    this.renderNotifications();
                    this.updateBadge();
                    console.log('✅ Marked all notifications as read');
                }
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
            }
        },

        dismissNotification: async function(notificationId) {
            try {
                const response = await fetch(`/api/notifications/${notificationId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': this.getCSRFToken()
                    }
                });
                
                if (response.ok) {
                    // Remove from local list
                    this.notifications = this.notifications.filter(n => n.id !== notificationId);
                    this.renderNotifications();
                    this.updateBadge();
                    console.log(`✅ Dismissed notification ${notificationId}`);
                }
            } catch (error) {
                console.error('Error dismissing notification:', error);
            }
        },

        clearAllNotifications: async function() {
            try {
                const response = await fetch('/api/notifications/clear-all/', {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': this.getCSRFToken()
                    }
                });
                
                if (response.ok) {
                    this.notifications = [];
                    this.renderNotifications();
                    this.updateBadge();
                    console.log('✅ Cleared all notifications');
                }
            } catch (error) {
                console.error('Error clearing all notifications:', error);
            }
        },

        handleNotificationClick: function(notificationId, element) {
            this.markAsRead(notificationId);
            
            // You can add navigation logic here based on notification type
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                switch (notification.type) {
                    case 'like':
                    case 'comment':
                        // Scroll to the post
                        this.scrollToPost(notification.post_id);
                        break;
                    case 'post':
                        // Show the new post
                        this.showPost(notification.post_id);
                        break;
                }
            }
            
            this.closeDropdown();
        },

        scrollToPost: function(postId) {
            // Implement scroll to post logic
            console.log('Scrolling to post:', postId);
            // You can implement this based on your post structure
        },

        showPost: function(postId) {
            // Implement show post logic
            console.log('Showing post:', postId);
        },

        startPolling: function() {
            // Poll for new notifications every 30 seconds
            this.pollingInterval = setInterval(() => {
                if (!this.isOpen) {
                    this.loadNotifications();
                }
            }, 30000);
            console.log('🔄 Started notification polling (30s interval)');
        },

        stopPolling: function() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                console.log('🛑 Stopped notification polling');
            }
        },

        formatTime: function(timestamp) {
            if (!timestamp) return 'Just now';
            
            try {
                const date = new Date(timestamp);
                const now = new Date();
                const diffInSeconds = Math.floor((now - date) / 1000);
                
                if (diffInSeconds < 60) return 'Just now';
                if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
                if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
                if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
                
                return date.toLocaleDateString();
            } catch (error) {
                return 'Recently';
            }
        },

        // Add missing methods that are called from onclick handlers
        viewNotification: function(notificationId) {
            this.handleNotificationClick(notificationId);
        },

        // CSRF Token helper
        getCSRFToken: function() {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
            return csrfToken ? csrfToken.value : '';
        }
    };

    // Initialize only when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.notificationManager = notificationManager;
            window.notificationManager.init();
        });
    } else {
        window.notificationManager = notificationManager;
        window.notificationManager.init();
    }

    console.log('✅ Notification system initialized successfully');
})();