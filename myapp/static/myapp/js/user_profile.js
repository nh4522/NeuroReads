// static/myapp/js/user_profile.js - COMPLETE FIXED VERSION
class UserProfileManager {
    constructor() {
        this.userData = {};
        this.isLoading = false;
        this.statsLoaded = false;
        this.init();
    }

    init() {
        console.log('📊 Initializing UserProfileManager');
        this.setupEventListeners();
        this.loadUserStatistics();
        this.loadRecentActivity();
        this.updateProfileDisplay();
    }

    setupEventListeners() {
        // Refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !this.statsLoaded) {
                this.loadUserStatistics();
            }
        });

        // Manual refresh button
        const refreshBtn = document.getElementById('refreshStatsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.statsLoaded = false;
                this.loadUserStatistics();
            });
        }

        // Auto-refresh every 60 seconds if needed
        setInterval(() => {
            if (document.visibilityState === 'visible' && !this.isLoading) {
                this.loadUserStatistics();
            }
        }, 60000);
    }

    async loadUserStatistics() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.statsLoaded = false;
            this.setLoadingState(true);
            console.log('📊 Loading user statistics from API...');

            const response = await fetch('/api/profile/statistics/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 Statistics API response:', data);

            if (data.success && data.statistics) {
                this.updateStatistics(data.statistics);
                this.statsLoaded = true;
                console.log('✅ Statistics loaded successfully');
            } else {
                throw new Error(data.error || 'Invalid response format');
            }

        } catch (error) {
            console.error('❌ Error loading user statistics:', error);
            this.showNotification('Failed to load statistics. Please refresh the page.', 'error');
            this.showFallbackStatistics();
        } finally {
            this.isLoading = false;
            this.setLoadingState(false);
        }
    }

    updateStatistics(stats) {
        console.log('📈 Updating statistics UI with:', stats);

        // Helper function to safely update elements
        const updateElement = (id, value, formatter = null) => {
            const element = document.getElementById(id);
            if (element) {
                const displayValue = formatter ? formatter(value) : value;
                element.textContent = displayValue !== undefined && displayValue !== null ? displayValue : '0';
                console.log(`✅ Updated ${id}: ${displayValue}`);
            } else {
                console.warn(`⚠️ Element not found: ${id}`);
            }
        };

        // Update basic statistics
        updateElement('booksReadCount', stats.books_read);
        updateElement('currentlyReadingCount', stats.currently_reading);
        updateElement('wishlistCount', stats.wishlist_count);

        // Update reading challenge
        updateElement('yearlyBooks', stats.yearly_books);
        updateElement('readingGoal', stats.reading_goal);
        
        const progress = stats.goal_progress || 0;
        updateElement('goalProgress', progress, (val) => `${val}%`);
        
        // Update progress bar
        const progressBar = document.getElementById('goalProgressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
        
        // Update books to go
        const booksToGo = stats.books_to_go !== undefined ? stats.books_to_go : 
                         Math.max(0, (stats.reading_goal || 12) - (stats.yearly_books || 0));
        updateElement('booksToGo', booksToGo, (val) => `${val} book${val !== 1 ? 's' : ''} to go!`);

        // Update detailed statistics
        updateElement('totalReadingTime', stats.total_reading_time, 
                     (val) => Math.round((val || 0) / 60) || 0);
        updateElement('averageRating', stats.average_rating, 
                     (val) => (val || 0).toFixed(1));
        updateElement('reviewsCount', stats.reviews_count);
        updateElement('followersCount', stats.followers_count);

        console.log('✅ All statistics updated successfully');
    }

    showFallbackStatistics() {
        console.log('🔄 Showing fallback statistics');
        
        const fallbackValues = {
            'booksReadCount': '0',
            'currentlyReadingCount': '0',
            'wishlistCount': '0',
            'yearlyBooks': '0',
            'readingGoal': '12',
            'goalProgress': '0%',
            'booksToGo': '12 books to go!',
            'totalReadingTime': '0',
            'averageRating': '0.0',
            'reviewsCount': '0',
            'followersCount': '0'
        };

        Object.entries(fallbackValues).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        const progressBar = document.getElementById('goalProgressBar');
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }

    async loadRecentActivity() {
        try {
            const activityContainer = document.getElementById('recentActivity');
            if (!activityContainer) return;

            // Show loading state
            activityContainer.innerHTML = `
                <div class="activity-item loading">
                    <div class="activity-icon">
                        <i class="bi bi-hourglass-split"></i>
                    </div>
                    <div class="activity-content">
                        <p>Loading your activities...</p>
                        <small class="text-muted">Just now</small>
                    </div>
                </div>
            `;

            // Simulate API call - Replace with actual endpoint when available
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.displaySampleActivities();

        } catch (error) {
            console.error('Error loading recent activity:', error);
            this.showActivityError();
        }
    }

    displaySampleActivities() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        const activities = [
            {
                icon: 'bi-book',
                message: 'You started reading "The Midnight Library"',
                time: '2 hours ago'
            },
            {
                icon: 'bi-star',
                message: 'You rated "Project Hail Mary" 5 stars',
                time: '1 day ago'
            },
            {
                icon: 'bi-chat',
                message: 'You commented on a discussion about classic literature',
                time: '2 days ago'
            },
            {
                icon: 'bi-heart',
                message: 'You added "Dune" to your wishlist',
                time: '3 days ago'
            }
        ];

        const activitiesHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <small class="text-muted">${activity.time}</small>
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = activitiesHTML;
    }

    showActivityError() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        activityContainer.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
                <div class="activity-content">
                    <p>Unable to load recent activities</p>
                    <small class="text-muted">Try refreshing the page</small>
                </div>
            </div>
        `;
    }

    updateProfileDisplay() {
        // Update any profile-specific displays
        console.log('🔄 Updating profile display');
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        
        const loadingIndicator = document.getElementById('statsLoading');
        const statsContainer = document.getElementById('statsContainer');
        const refreshBtn = document.getElementById('refreshStatsBtn');
        
        if (loadingIndicator) {
            loadingIndicator.style.display = loading ? 'block' : 'none';
        }
        
        if (statsContainer) {
            statsContainer.style.opacity = loading ? 0.6 : 1;
            statsContainer.style.pointerEvents = loading ? 'none' : 'auto';
        }
        
        if (refreshBtn) {
            refreshBtn.disabled = loading;
            refreshBtn.innerHTML = loading ? 
                '<i class="bi bi-arrow-repeat spinner"></i> Loading...' : 
                '<i class="bi bi-arrow-repeat"></i> Refresh';
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.profile-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show profile-notification`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getCsrfToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }
}

// Initialize with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (document.getElementById('booksReadCount')) { // Only initialize on profile page
            window.profileManager = new UserProfileManager();
            console.log('✅ UserProfileManager initialized successfully');
        }
    } catch (error) {
        console.error('❌ Failed to initialize UserProfileManager:', error);
    }
});