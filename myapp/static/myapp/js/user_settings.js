// static/myapp/js/user_settings.js - COMPLETE FIXED VERSION
console.log('🟢 user_settings.js loaded - WITH READING GOAL AND GENRES');

class UserSettingsManager {
    constructor() {
        this.originalData = {};
        this.isLoading = false;
        this.init();
    }

    init() {
        console.log('🎯 Initializing UserSettingsManager - With Reading Goal and Genres');
        this.setupEventListeners();
        this.loadUserData();
        this.setupUsernameAvailability();
        this.setupReadingGoal();
        console.log('✅ All components initialized');
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');

        // Setup section save buttons - NO PASSWORD for name/username/email/bio
        const saveButtons = document.querySelectorAll('.section-save-btn');
        saveButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const fields = JSON.parse(e.target.getAttribute('data-fields'));
                this.saveSection(fields, e.target);
            });
        });

        // Password change with verification
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.showPasswordModal());
        }

        // Avatar upload
        const avatarFileInput = document.getElementById('avatarFileInput');
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        const avatarContainer = document.querySelector('.avatar-container');

        if (avatarFileInput) {
            if (changeAvatarBtn) changeAvatarBtn.addEventListener('click', () => avatarFileInput.click());
            if (avatarContainer) avatarContainer.addEventListener('click', () => avatarFileInput.click());
            avatarFileInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }

        // Store original values
        this.storeOriginalValues();
        console.log('✅ All event listeners setup complete');
    }

    setupUsernameAvailability() {
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            let timeout;
            usernameInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                const username = e.target.value.trim();
                
                if (username.length < 3) {
                    // Clear status if username is too short
                    const usernameSection = document.getElementById('usernameSection');
                    const statusElement = usernameSection.querySelector('.section-status');
                    statusElement.textContent = '';
                    statusElement.className = 'section-status';
                    return;
                }
                
                timeout = setTimeout(() => {
                    this.checkUsernameAvailability(username);
                }, 500);
            });
        }
    }

    setupReadingGoal() {
        const saveGoalBtn = document.getElementById('saveReadingGoalBtn');
        const goalInput = document.getElementById('readingGoalInput');
        
        console.log('🎯 Setting up reading goal:', { saveGoalBtn: !!saveGoalBtn, goalInput: !!goalInput });
        
        if (saveGoalBtn && goalInput) {
            // Set current reading goal value
            const currentGoal = this.getCurrentReadingGoal();
            if (currentGoal) {
                goalInput.value = currentGoal;
                console.log('📖 Current reading goal:', currentGoal);
            }
            
            saveGoalBtn.addEventListener('click', () => this.saveReadingGoal());
            console.log('✅ Reading goal event listener added');
        } else {
            console.error('❌ Reading goal elements not found');
        }
    }

    async saveReadingGoal() {
        const goalInput = document.getElementById('readingGoalInput');
        const saveBtn = document.getElementById('saveReadingGoalBtn');
        const statusElement = document.getElementById('readingGoalStatus');
        
        if (!goalInput || !saveBtn) {
            console.error('❌ Reading goal elements missing');
            return;
        }
        
        const readingGoal = parseInt(goalInput.value);
        
        console.log('💾 Saving reading goal:', readingGoal);
        
        if (!readingGoal || readingGoal < 1) {
            this.showStatus(statusElement, 'Please enter a valid reading goal', 'error');
            return;
        }
        
        if (readingGoal > 1000) {
            this.showStatus(statusElement, 'Reading goal cannot exceed 1000 books', 'error');
            return;
        }
        
        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="bi bi-arrow-repeat spinner"></i> Saving...';
            
            console.log('📤 Sending reading goal to API:', readingGoal);
            
            const response = await fetch('/api/profile/reading-goal/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                    reading_goal: readingGoal
                })
            });
            
            const result = await response.json();
            console.log('📨 Reading goal API response:', result);
            
            if (result.success) {
                this.showStatus(statusElement, 'Reading goal updated successfully!', 'success');
                // Update the progress display
                this.updateReadingProgress(readingGoal);
            } else {
                throw new Error(result.error || 'Failed to save reading goal');
            }
            
        } catch (error) {
            console.error('❌ Error saving reading goal:', error);
            this.showStatus(statusElement, 'Failed to save reading goal: ' + error.message, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Reading Goal';
        }
    }

    getCurrentReadingGoal() {
        try {
            const goalInput = document.getElementById('readingGoalInput');
            return goalInput ? parseInt(goalInput.value) || 12 : 12;
        } catch (e) {
            console.error('Error getting reading goal:', e);
            return 12;
        }
    }

    updateReadingProgress(goal) {
        // Update the progress display with new goal
        const progressElement = document.querySelector('.goal-preview small');
        if (progressElement) {
            progressElement.textContent = `3 of ${goal} books completed`;
        }
    }

    showStatus(element, message, type) {
        if (element) {
            element.textContent = message;
            element.className = `section-status text-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'warning'}`;
            
            setTimeout(() => {
                element.textContent = '';
                element.className = 'section-status';
            }, 5000);
        }
    }

    async checkUsernameAvailability(username) {
        try {
            const response = await fetch('/api/check-username/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({ username: username })
            });

            const result = await response.json();
            
            const usernameSection = document.getElementById('usernameSection');
            const statusElement = usernameSection.querySelector('.section-status');
            
            if (result.available) {
                statusElement.textContent = '✓ Username is available';
                statusElement.className = 'section-status text-success';
            } else {
                statusElement.textContent = result.message || 'Username is already taken';
                statusElement.className = 'section-status text-danger';
            }
            
        } catch (error) {
            console.error('Error checking username:', error);
        }
    }

    storeOriginalValues() {
        const fields = ['firstName', 'lastName', 'username', 'email', 'bio'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                this.originalData[field] = element.value;
            }
        });
        console.log('📝 Original values stored:', this.originalData);
    }

    async saveSection(fields, saveButton) {
        if (this.isLoading) {
            this.showSectionStatus(saveButton, 'Another update is in progress', 'warning');
            return;
        }

        try {
            this.isLoading = true;
            this.setSectionLoadingState(saveButton, true);

            const formData = {};
            let hasChanges = false;

            // Collect data and check for changes
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    const newValue = element.value.trim();
                    const oldValue = this.originalData[field];
                    
                    if (newValue !== oldValue) {
                        formData[field] = newValue;
                        hasChanges = true;
                        console.log(`🔄 Field ${field} changed: "${oldValue}" → "${newValue}"`);
                    }
                }
            });

            if (!hasChanges) {
                this.showSectionStatus(saveButton, 'No changes detected', 'info');
                return;
            }

            console.log('💾 Saving section with changes:', Object.keys(formData));
            console.log('📋 Form data to save:', formData);

            const mappedData = this.mapFieldNames(formData);
            
            console.log('📤 Sending to API:', mappedData);

            const response = await fetch('/api/profile/update/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify(mappedData)
            });

            console.log('📨 API Response status:', response.status);
            
            const result = await response.json();
            console.log('📨 API Response data:', result);

            if (result.success) {
                this.showSectionStatus(saveButton, 'Changes saved successfully!', 'success');
                
                // Update original data with new values
                fields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        this.originalData[field] = element.value;
                    }
                });

                // Update UI if needed
                if (result.user_data) {
                    this.updateTopbarUsername(result.user_data.first_name, result.user_data.last_name);
                    console.log('✅ UI updated with new user data');
                }
                
            } else {
                throw new Error(result.error || 'Failed to save changes');
            }

        } catch (error) {
            console.error('❌ Error saving section:', error);
            this.showSectionStatus(saveButton, 'Failed to save changes: ' + error.message, 'error');
        } finally {
            this.isLoading = false;
            this.setSectionLoadingState(saveButton, false);
        }
    }

    showPasswordModal() {
        // Create and show password modal
        const modalHtml = `
            <div class="modal fade" id="passwordModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Change Password</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Current Password</label>
                                <input type="password" class="form-control" id="currentPassword" autocomplete="current-password">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">New Password</label>
                                <input type="password" class="form-control" id="newPassword" autocomplete="new-password">
                                <div class="form-text">Password must be at least 8 characters long</div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Confirm New Password</label>
                                <input type="password" class="form-control" id="confirmPassword" autocomplete="new-password">
                            </div>
                            <div id="passwordError" class="text-danger"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirmPasswordBtn">Change Password</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('passwordModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById('passwordModal'));
        modal.show();

        // Setup modal event listeners
        document.getElementById('confirmPasswordBtn').addEventListener('click', () => {
            this.changePassword();
        });

        // Enter key support
        document.getElementById('passwordModal').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.changePassword();
            }
        });

        // Clear form when modal is hidden
        document.getElementById('passwordModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            document.getElementById('passwordError').textContent = '';
        });
    }

    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorElement = document.getElementById('passwordError');
        const confirmBtn = document.getElementById('confirmPasswordBtn');

        // Reset error
        errorElement.textContent = '';

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            errorElement.textContent = 'All fields are required';
            return;
        }

        if (newPassword !== confirmPassword) {
            errorElement.textContent = 'New passwords do not match';
            return;
        }

        if (newPassword.length < 8) {
            errorElement.textContent = 'Password must be at least 8 characters';
            return;
        }

        try {
            // Set loading state
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="bi bi-arrow-repeat spinner"></i> Changing...';

            const response = await fetch('/api/profile/change-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Password changed successfully!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('passwordModal')).hide();
            } else {
                errorElement.textContent = result.error || 'Failed to change password';
            }

        } catch (error) {
            console.error('❌ Error changing password:', error);
            errorElement.textContent = 'Failed to change password';
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Change Password';
        }
    }

    mapFieldNames(formData) {
        const fieldMapping = {
            'firstName': 'first_name',
            'lastName': 'last_name',
            'username': 'username',
            'email': 'email',
            'bio': 'bio'
        };

        const mappedData = {};
        Object.keys(formData).forEach(key => {
            const backendKey = fieldMapping[key] || key;
            mappedData[backendKey] = formData[key];
        });

        return mappedData;
    }

    setSectionLoadingState(saveButton, loading) {
        if (saveButton) {
            if (loading) {
                saveButton.disabled = true;
                saveButton.innerHTML = '<i class="bi bi-arrow-repeat spinner"></i> Saving...';
            } else {
                saveButton.disabled = false;
                const fields = JSON.parse(saveButton.getAttribute('data-fields'));
                const title = fields.length === 1 ? 
                    (fields[0] === 'bio' ? 'Bio' : 
                     fields[0] === 'firstName' ? 'Name' : 
                     fields[0].charAt(0).toUpperCase() + fields[0].slice(1)) :
                    'Changes';
                saveButton.innerHTML = `Save ${title}`;
            }
        }
    }

    showSectionStatus(saveButton, message, type) {
        const sectionContainer = saveButton.closest('.form-section');
        const statusElement = sectionContainer.querySelector('.section-status');
        
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `section-status text-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'warning'}`;
            
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'section-status';
            }, 5000);
        }
    }

    async handleAvatarUpload(event) {
        const file = event.target.files[0];
        console.log('📤 Handling avatar upload:', file);
        
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }

        if (file.size > 200 * 1024) {
            this.showNotification('Image must be less than 200KB', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch('/api/profile/picture/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.updateAllAvatars(result.avatar_url);
                this.showNotification('Profile picture updated successfully!', 'success');
            } else {
                throw new Error(result.error || 'Upload failed');
            }

        } catch (error) {
            console.error('❌ Upload error:', error);
            this.showNotification('Failed to update profile picture: ' + error.message, 'error');
        } finally {
            event.target.value = '';
        }
    }

    updateAllAvatars(avatarUrl) {
        const userAvatar = document.getElementById('userAvatar');
        const topbarAvatar = document.querySelector('.nr-user-avatar');
        
        if (userAvatar) userAvatar.src = avatarUrl;
        if (topbarAvatar) topbarAvatar.src = avatarUrl;
        
        console.log('✅ All avatars updated');
    }

    updateTopbarUsername(firstName, lastName) {
        const usernameElement = document.querySelector('.nr-username');
        if (usernameElement && firstName && lastName) {
            usernameElement.textContent = `${firstName} ${lastName}`;
            console.log('✅ Topbar username updated');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-message">${message}</div>
        `;
        
        document.body.appendChild(notification);

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

    loadUserData() {
        try {
            this.originalData = {
                firstName: document.getElementById('firstName')?.value || '',
                lastName: document.getElementById('lastName')?.value || '',
                username: document.getElementById('username')?.value || '',
                email: document.getElementById('email')?.value || '',
                bio: document.getElementById('bio')?.value || ''
            };
            console.log('📝 Original data loaded');
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing UserSettingsManager...');
    window.settingsManager = new UserSettingsManager();
});