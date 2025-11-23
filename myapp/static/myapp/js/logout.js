// static/myapp/js/logout.js - FIXED VERSION
class LogoutManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚪 Initializing LogoutManager');
        this.setupLogoutHandler();
        this.ensureLogoutInDropdown();
    }

    setupLogoutHandler() {
        // Handle logout button clicks
        document.addEventListener('click', (e) => {
            const logoutBtn = e.target.closest('#logoutBtn, [data-action="logout"]');
            if (logoutBtn) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    ensureLogoutInDropdown() {
        // Make sure logout link exists and has proper attributes
        const logoutLink = document.getElementById('logoutBtn');
        if (logoutLink) {
            // Ensure it's a button with proper type
            logoutLink.type = 'button';
            logoutLink.classList.add('logout-btn');
            console.log('✅ Logout link configured');
        }
    }

    async handleLogout() {
        try {
            // Show confirmation dialog
            if (!confirm('Are you sure you want to logout?')) {
                return;
            }

            console.log('🚪 User confirmed logout');

            // Get CSRF token
            const csrfToken = this.getCsrfToken();
            if (!csrfToken) {
                console.error('❌ CSRF token not found');
                this.showError('Security token missing. Please refresh the page.');
                return;
            }

            // Create form data for POST request
            const formData = new FormData();
            formData.append('csrfmiddlewaretoken', csrfToken);

            // Send POST request to logout endpoint
            const response = await fetch('/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData,
                credentials: 'same-origin'
            });

            if (response.ok) {
                console.log('✅ Logout successful, redirecting...');
                // Redirect to home page after successful logout
                window.location.href = '/';
            } else {
                throw new Error(`Logout failed with status: ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Logout error:', error);
            
            // Fallback: try traditional form submission
            this.fallbackLogout();
        }
    }

    fallbackLogout() {
        try {
            console.log('🔄 Trying fallback logout method...');
            
            // Create a form and submit it the traditional way
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/logout/';
            form.style.display = 'none';

            // Add CSRF token
            const csrfToken = this.getCsrfToken();
            if (csrfToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrfmiddlewaretoken';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            }

            // Add to document and submit
            document.body.appendChild(form);
            form.submit();
            
        } catch (fallbackError) {
            console.error('❌ Fallback logout failed:', fallbackError);
            // Last resort: redirect to logout URL
            window.location.href = '/logout/';
        }
    }

    getCsrfToken() {
        // Try multiple ways to get CSRF token
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken) {
            return csrfToken.value;
        }

        // Check for CSRF token in cookie
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        return cookieValue || '';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        errorDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Initialize on all pages
document.addEventListener('DOMContentLoaded', () => {
    window.logoutManager = new LogoutManager();
});