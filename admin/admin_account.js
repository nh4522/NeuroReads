// admin_account.js - ACCOUNT SETTINGS FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
  console.log('Account Settings initialized');

  // Initialize account functionality
  initializeAccountSettings();

  function initializeAccountSettings() {
    // Save Account Button
    const saveAccountBtn = document.getElementById('saveAccountBtn');
    if (saveAccountBtn) {
      saveAccountBtn.addEventListener('click', saveAccountSettings);
    }

    // Refresh Account Button
    const refreshAccountBtn = document.getElementById('refreshAccountBtn');
    if (refreshAccountBtn) {
      refreshAccountBtn.addEventListener('click', refreshAccountData);
    }

    // Change Password Button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordModal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    const confirmPasswordChange = document.getElementById('confirmPasswordChange');

    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', function() {
        changePasswordModal.show();
      });
    }

    if (confirmPasswordChange) {
      confirmPasswordChange.addEventListener('click', function() {
        changePassword();
        changePasswordModal.hide();
      });
    }

    // Enable 2FA Button
    const enable2FABtn = document.getElementById('enable2FABtn');
    if (enable2FABtn) {
      enable2FABtn.addEventListener('click', enableTwoFactorAuth);
    }

    // Session Management
    const revokeAllSessionsBtn = document.getElementById('revokeAllSessionsBtn');
    if (revokeAllSessionsBtn) {
      revokeAllSessionsBtn.addEventListener('click', revokeAllSessions);
    }

    // Revoke individual session
    const revokeSessionBtns = document.querySelectorAll('.session-actions .btn-outline-secondary');
    revokeSessionBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const sessionDevice = this.closest('.session-item').querySelector('.session-device').textContent;
        revokeSession(sessionDevice);
      });
    });

    // Danger Zone Actions
    const deactivateAccountBtn = document.getElementById('deactivateAccountBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    if (deactivateAccountBtn) {
      deactivateAccountBtn.addEventListener('click', deactivateAccount);
    }

    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', deleteAccount);
    }

    // Form validation
    initializeFormValidation();
  }

  // Main Functions
  function saveAccountSettings() {
    console.log('Saving account settings...');
    
    const accountData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      bio: document.getElementById('bio').value
    };

    // Show loading state
    const saveBtn = document.getElementById('saveAccountBtn');
    const originalHTML = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Saving...';
    saveBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Account settings saved:', accountData);
      showToast('Account settings updated successfully!', 'success');
      
      // Restore button
      saveBtn.innerHTML = originalHTML;
      saveBtn.disabled = false;
    }, 1500);
  }

  function refreshAccountData() {
    console.log('Refreshing account data...');
    
    const refreshBtn = document.getElementById('refreshAccountBtn');
    const originalHTML = refreshBtn.innerHTML;
    
    refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spinner-border spinner-border-sm me-2"></i>Refreshing...';
    refreshBtn.disabled = true;

    setTimeout(() => {
      showToast('Account data refreshed!', 'info');
      refreshBtn.innerHTML = originalHTML;
      refreshBtn.disabled = false;
    }, 1000);
  }

  function changePassword() {
    const form = document.getElementById('changePasswordForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    console.log('Changing password...');
    showToast('Password updated successfully!', 'success');
  }

  function enableTwoFactorAuth() {
    if (confirm('Two-factor authentication adds an extra layer of security to your account. You\'ll need to use an authenticator app. Continue?')) {
      console.log('Enabling 2FA...');
      
      const btn = document.getElementById('enable2FABtn');
      const originalHTML = btn.innerHTML;
      
      btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Setting up...';
      btn.disabled = true;

      setTimeout(() => {
        showToast('Two-factor authentication enabled! Scan the QR code with your authenticator app.', 'success');
        btn.innerHTML = 'Manage 2FA';
        btn.classList.remove('btn-outline-warning');
        btn.classList.add('btn-outline-success');
        
        // Update status badge
        const statusBadge = document.querySelector('.status-item:nth-child(2) .badge');
        if (statusBadge) {
          statusBadge.textContent = 'Enabled';
          statusBadge.className = 'badge bg-success';
        }
      }, 2000);
    }
  }

  function revokeSession(device) {
    if (confirm(`Revoke session for ${device}?`)) {
      console.log(`Revoking session: ${device}`);
      
      const sessionItem = document.querySelector(`.session-device:contains("${device}")`).closest('.session-item');
      if (sessionItem) {
        sessionItem.style.opacity = '0.5';
        setTimeout(() => {
          sessionItem.remove();
          showToast('Session revoked successfully!', 'success');
        }, 500);
      }
    }
  }

  function revokeAllSessions() {
    if (confirm('Revoke all other active sessions? You will stay logged in on this device.')) {
      console.log('Revoking all other sessions...');
      
      const otherSessions = document.querySelectorAll('.session-item:not(:first-child)');
      otherSessions.forEach(session => {
        session.style.opacity = '0.5';
        setTimeout(() => session.remove(), 500);
      });
      
      showToast('All other sessions revoked!', 'success');
    }
  }

  function deactivateAccount() {
    if (confirm('Are you sure you want to deactivate your account? You can reactivate it by logging in again.')) {
      console.log('Deactivating account...');
      showToast('Account has been deactivated. You can reactivate by logging in again.', 'warning');
    }
  }

  function deleteAccount() {
    const confirmation = prompt('This action cannot be undone. Type "DELETE" to confirm:');
    if (confirmation === 'DELETE') {
      console.log('Deleting account...');
      showToast('Account deletion scheduled. You will receive a confirmation email.', 'danger');
    } else {
      showToast('Account deletion cancelled.', 'info');
    }
  }

  function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!this.checkValidity()) {
          e.stopPropagation();
        }
        this.classList.add('was-validated');
      });
    });
  }

  // Utility Functions
  function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-container');
    existingToasts.forEach(toast => toast.remove());
    
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 4000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
      toastContainer.remove();
    });
  }

  // Custom contains selector for revokeSession
  const containsSelector = (element, text) => {
    return Array.from(element.childNodes).some(node => 
      node.nodeType === 3 && node.textContent.includes(text)
    );
  };

  // Initialize when page loads
  console.log('Account Settings fully loaded');
});