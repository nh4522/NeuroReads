// User Account Management
class AccountManager {
    constructor() {
        this.originalData = {};
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadUserData();
            this.setupEventListeners();
            this.initializeBootstrapComponents();
        });
    }

    initializeBootstrapComponents() {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Initialize form validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }
    }

    setupEventListeners() {
        // Genre tags functionality
        this.setupGenreTags();
        
        // Form auto-save
        this.setupAutoSave();
        
        // Avatar upload
        this.setupAvatarUpload();
    }

    setupGenreTags() {
        const genreTags = document.querySelectorAll('.genre-tag:not(.add-genre)');
        genreTags.forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('active');
                this.savePreferences();
            });
        });

        // Add genre functionality
        const addGenre = document.querySelector('.genre-tag.add-genre');
        if (addGenre) {
            addGenre.addEventListener('click', () => {
                this.addNewGenre();
            });
        }
    }

    setupAutoSave() {
        // Auto-save preferences when changed
        const preferenceElements = document.querySelectorAll('#defaultLanguage, #readingGoal, #emailNotifications, #publicProfile, #twoFactorToggle');
        preferenceElements.forEach(element => {
            element.addEventListener('change', () => {
                this.savePreferences();
            });
        });
    }

    setupAvatarUpload() {
        const avatarContainer = document.querySelector('.avatar-container');
        const avatarOverlay = document.querySelector('.avatar-overlay');
        
        if (avatarContainer && avatarOverlay) {
            avatarOverlay.addEventListener('click', () => {
                this.changeAvatar();
            });
        }
    }

    loadUserData() {
        // Load from localStorage or set defaults
        const userData = JSON.parse(localStorage.getItem('neuroreads_user_account')) || this.getDefaultUserData();
        
        // Populate form fields
        this.populateFormData(userData);
        
        // Store original data for comparison
        this.originalData = { ...userData };
        
        console.log('User data loaded:', userData);
    }

    getDefaultUserData() {
        return {
            firstName: "John",
            lastName: "Doe",
            username: "johndoe_reader",
            email: "john.doe@example.com",
            bio: "Avid reader who loves fantasy and science fiction. Currently exploring classic literature!",
            avatar: "../icons/top-user.png",
            defaultLanguage: "en",
            readingGoal: "24",
            favoriteGenres: ["Fantasy", "Science Fiction"],
            emailNotifications: true,
            publicProfile: true,
            twoFactorAuth: false,
            membership: "premium",
            booksRead: 24,
            currentlyReading: 12
        };
    }

    populateFormData(data) {
        // Basic profile info
        document.getElementById('firstName').value = data.firstName;
        document.getElementById('lastName').value = data.lastName;
        document.getElementById('username').value = data.username;
        document.getElementById('email').value = data.email;
        document.getElementById('bio').value = data.bio;

        // Avatar
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && data.avatar) {
            userAvatar.src = data.avatar;
        }

        // Preferences
        document.getElementById('defaultLanguage').value = data.defaultLanguage;
        document.getElementById('readingGoal').value = data.readingGoal;
        document.getElementById('emailNotifications').checked = data.emailNotifications;
        document.getElementById('publicProfile').checked = data.publicProfile;
        document.getElementById('twoFactorToggle').checked = data.twoFactorAuth;

        // Genre tags
        this.updateGenreTags(data.favoriteGenres);

        // Stats
        this.updateUserStats(data);
    }

    updateGenreTags(genres) {
        const genreTags = document.querySelectorAll('.genre-tag:not(.add-genre)');
        genreTags.forEach(tag => {
            if (genres.includes(tag.textContent)) {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });
    }

    updateUserStats(data) {
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers[0]) statNumbers[0].textContent = data.booksRead;
        if (statNumbers[1]) statNumbers[1].textContent = data.currentlyReading;
    }

    async saveProfile() {
        try {
            const formData = this.getFormData();
            
            // Simulate API call
            await this.simulateAPICall('Saving profile...', 1000);
            
            // Save to localStorage
            localStorage.setItem('neuroreads_user_account', JSON.stringify(formData));
            this.originalData = { ...formData };
            
            this.showNotification('Profile updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('Failed to save profile. Please try again.', 'error');
        }
    }

    getFormData() {
        const activeGenres = Array.from(document.querySelectorAll('.genre-tag.active:not(.add-genre)'))
            .map(tag => tag.textContent);

        return {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            bio: document.getElementById('bio').value,
            avatar: document.getElementById('userAvatar').src,
            defaultLanguage: document.getElementById('defaultLanguage').value,
            readingGoal: document.getElementById('readingGoal').value,
            favoriteGenres: activeGenres,
            emailNotifications: document.getElementById('emailNotifications').checked,
            publicProfile: document.getElementById('publicProfile').checked,
            twoFactorAuth: document.getElementById('twoFactorToggle').checked,
            membership: "premium",
            booksRead: 24,
            currentlyReading: 12
        };
    }

    savePreferences() {
        const preferences = {
            defaultLanguage: document.getElementById('defaultLanguage').value,
            readingGoal: document.getElementById('readingGoal').value,
            emailNotifications: document.getElementById('emailNotifications').checked,
            publicProfile: document.getElementById('publicProfile').checked,
            twoFactorAuth: document.getElementById('twoFactorToggle').checked,
            favoriteGenres: Array.from(document.querySelectorAll('.genre-tag.active:not(.add-genre)'))
                .map(tag => tag.textContent)
        };

        // Save to localStorage
        const currentData = JSON.parse(localStorage.getItem('neuroreads_user_account')) || {};
        const updatedData = { ...currentData, ...preferences };
        localStorage.setItem('neuroreads_user_account', JSON.stringify(updatedData));

        this.showNotification('Preferences saved!', 'success');
    }

    // Action Methods
    changeAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    this.showNotification('Please select an image file', 'error');
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    this.showNotification('Image must be less than 5MB', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const userAvatar = document.getElementById('userAvatar');
                    userAvatar.src = e.target.result;
                    
                    // Save to user data
                    const currentData = JSON.parse(localStorage.getItem('neuroreads_user_account')) || {};
                    currentData.avatar = e.target.result;
                    localStorage.setItem('neuroreads_user_account', JSON.stringify(currentData));
                    
                    this.showNotification('Avatar updated successfully!', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }

    changePassword() {
        const newPassword = prompt('Enter new password:');
        if (newPassword) {
            if (newPassword.length < 8) {
                this.showNotification('Password must be at least 8 characters', 'error');
                return;
            }
            
            this.simulateAPICall('Updating password...', 1500)
                .then(() => {
                    this.showNotification('Password updated successfully!', 'success');
                })
                .catch(() => {
                    this.showNotification('Failed to update password', 'error');
                });
        }
    }

    viewSessions() {
        this.showNotification('Login sessions feature coming soon!', 'info');
    }

    addNewGenre() {
        const newGenre = prompt('Enter a new genre:');
        if (newGenre && newGenre.trim()) {
            const genreText = newGenre.trim();
            const genreTags = document.querySelector('.genre-tags');
            const addButton = document.querySelector('.genre-tag.add-genre');
            
            const newTag = document.createElement('span');
            newTag.className = 'genre-tag active';
            newTag.textContent = genreText;
            newTag.addEventListener('click', () => {
                newTag.classList.toggle('active');
                this.savePreferences();
            });
            
            genreTags.insertBefore(newTag, addButton);
            this.savePreferences();
            
            this.showNotification(`Added "${genreText}" to your genres`, 'success');
        }
    }

    manageSubscription() {
        this.showNotification('Subscription management coming soon!', 'info');
    }

    upgradePlan() {
        this.showNotification('Plan upgrade feature coming soon!', 'info');
    }

    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            if (confirm('This will permanently delete all your data. Type "DELETE" to confirm:')) {
                this.simulateAPICall('Deleting account...', 2000)
                    .then(() => {
                        localStorage.removeItem('neuroreads_user_account');
                        this.showNotification('Account deleted successfully', 'success');
                        setTimeout(() => {
                            window.location.href = '../login.html';
                        }, 2000);
                    })
                    .catch(() => {
                        this.showNotification('Failed to delete account', 'error');
                    });
            }
        }
    }

    exportData() {
        const userData = JSON.parse(localStorage.getItem('neuroreads_user_account')) || this.getDefaultUserData();
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'neuroreads_user_data.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully!', 'success');
    }

    discardChanges() {
        if (confirm('Discard all changes?')) {
            this.populateFormData(this.originalData);
            this.showNotification('Changes discarded', 'info');
        }
    }

    // Utility Methods
    async simulateAPICall(message, delay) {
        this.showNotification(message, 'info');
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    showNotification(message, type = 'info') {
        // Use Bootstrap toast or create custom notification
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
        `;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize account manager
let accountManager;

document.addEventListener('DOMContentLoaded', () => {
    accountManager = new AccountManager();
});