// static/myapp/js/password_change.js - COMPLETE VERSION

console.log('🔐 password_change.js loaded');

class PasswordChangeManager {
    constructor() {
        this.isLoading = false;
        this.init();
    }

    init() {
        console.log('🎯 Initializing Password Change Manager');
        this.setupEventListeners();
        this.setupPasswordValidation();
        console.log('✅ Password Change Manager initialized');
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');

        // Form submission
        const form = document.getElementById('passwordChangeForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.location.href = '/profile/settings/';
            });
        }

        // Continue button in success modal
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                window.location.href = '/profile/settings/';
            });
        }

        // Real-time password validation
        const newPasswordInput = document.getElementById('newPassword');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', () => {
                this.validatePasswordStrength(newPasswordInput.value);
                this.checkPasswordMatch();
            });
        }

        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                this.checkPasswordMatch();
            });
        }

        console.log('✅ All event listeners setup complete');
    }

    setupPasswordValidation() {
        // Initialize password strength indicator
        this.validatePasswordStrength('');
    }

    validatePasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrengthBar');
        const strengthText = document.getElementById('passwordStrengthText');
        
        if (!strengthBar || !strengthText) return;

        // Reset requirements
        this.resetRequirements();

        let strength = 0;
        let requirementsMet = 0;
        const totalRequirements = 4;

        // Check length
        if (password.length >= 8) {
            strength += 25;
            requirementsMet++;
            this.markRequirementValid('reqLength');
        }

        // Check uppercase
        if (/[A-Z]/.test(password)) {
            strength += 25;
            requirementsMet++;
            this.markRequirementValid('reqUppercase');
        }

        // Check lowercase
        if (/[a-z]/.test(password)) {
            strength += 25;
            requirementsMet++;
            this.markRequirementValid('reqLowercase');
        }

        // Check numbers
        if (/[0-9]/.test(password)) {
            strength += 25;
            requirementsMet++;
            this.markRequirementValid('reqNumber');
        }

        // Update progress bar
        strengthBar.style.width = `${strength}%`;
        
        // Update colors and text based on strength
        if (password.length === 0) {
            strengthBar.className = 'progress-bar';
            strengthText.textContent = 'Password strength';
            strengthText.className = 'text-muted';
        } else if (strength < 50) {
            strengthBar.className = 'progress-bar bg-danger';
            strengthText.textContent = 'Weak password';
            strengthText.className = 'text-danger';
        } else if (strength < 75) {
            strengthBar.className = 'progress-bar bg-warning';
            strengthText.textContent = 'Medium strength';
            strengthText.className = 'text-warning';
        } else {
            strengthBar.className = 'progress-bar bg-success';
            strengthText.textContent = 'Strong password';
            strengthText.className = 'text-success';
        }
    }

    resetRequirements() {
        const requirements = ['reqLength', 'reqUppercase', 'reqLowercase', 'reqNumber'];
        requirements.forEach(reqId => {
            const element = document.getElementById(reqId);
            if (element) {
                element.classList.remove('valid');
                const icon = element.querySelector('i');
                if (icon) {
                    icon.className = 'bi bi-circle';
                }
            }
        });
    }

    markRequirementValid(requirementId) {
        const element = document.getElementById(requirementId);
        if (element) {
            element.classList.add('valid');
            const icon = element.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-check-circle-fill text-success';
            }
        }
    }

    checkPasswordMatch() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmInput = document.getElementById('confirmPassword');

        if (confirmPassword.length === 0) {
            confirmInput.classList.remove('is-valid', 'is-invalid');
            return;
        }

        if (newPassword === confirmPassword && newPassword.length >= 8) {
            confirmInput.classList.add('is-valid');
            confirmInput.classList.remove('is-invalid');
        } else {
            confirmInput.classList.add('is-invalid');
            confirmInput.classList.remove('is-valid');
        }
    }

    validateForm() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Reset error
        this.hideError();

        // Basic validation
        if (!currentPassword) {
            this.showError('Current password is required');
            return false;
        }

        if (!newPassword) {
            this.showError('New password is required');
            return false;
        }

        if (newPassword.length < 8) {
            this.showError('New password must be at least 8 characters long');
            return false;
        }

        if (!confirmPassword) {
            this.showError('Please confirm your new password');
            return false;
        }

        if (newPassword !== confirmPassword) {
            this.showError('New passwords do not match');
            return false;
        }

        // Check if new password is different from current
        if (newPassword === currentPassword) {
            this.showError('New password must be different from current password');
            return false;
        }

        return true;
    }

    async handleSubmit() {
        if (this.isLoading) {
            return;
        }

        console.log('💾 Starting password change process...');

        // Validate form
        if (!this.validateForm()) {
            return;
        }

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
            this.isLoading = true;
            this.setLoadingState(true);

            console.log('📤 Sending password change request...');

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
            console.log('📨 Password change response:', result);

            if (result.success) {
                console.log('✅ Password changed successfully');
                this.showSuccessModal();
            } else {
                throw new Error(result.error || 'Failed to change password');
            }

        } catch (error) {
            console.error('❌ Error changing password:', error);
            this.showError(error.message || 'Failed to change password. Please try again.');
        } finally {
            this.isLoading = false;
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (submitBtn) {
            if (loading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="bi bi-arrow-repeat spinner"></i> Changing Password...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-shield-check"></i> Change Password';
            }
        }

        if (cancelBtn) {
            cancelBtn.disabled = loading;
        }
    }

    showError(message) {
        const errorElement = document.getElementById('passwordError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
            
            // Scroll to error
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    hideError() {
        const errorElement = document.getElementById('passwordError');
        if (errorElement) {
            errorElement.classList.add('d-none');
            errorElement.textContent = '';
        }
    }

    showSuccessModal() {
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();

        // Auto-redirect after 5 seconds
        setTimeout(() => {
            if (document.getElementById('successModal').classList.contains('show')) {
                window.location.href = '/profile/settings/';
            }
        }, 5000);
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing PasswordChangeManager...');
    window.passwordChangeManager = new PasswordChangeManager();
});