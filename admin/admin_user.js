// admin_user.js - USER MANAGEMENT SPECIFIC FUNCTIONALITY ONLY WITH BOOTSTRAP
document.addEventListener('DOMContentLoaded', () => {
  // Only user management specific functionality here
  // NO DROPDOWN CODE - that's in admin_common.js

  console.log('User Management initialized');

  // Bootstrap Modal instance
  let addUserModal = null;
  if (document.getElementById('addUserModal')) {
    addUserModal = new bootstrap.Modal(document.getElementById('addUserModal'));
  }

  // Add User Button
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
      console.log('Add User clicked');
      // Modal will open automatically via data-bs-toggle
    });
  }

  // Save User in Modal
  const saveUserBtn = document.getElementById('saveUserBtn');
  if (saveUserBtn) {
    saveUserBtn.addEventListener('click', () => {
      const form = document.getElementById('addUserForm');
      if (form.checkValidity()) {
        console.log('Saving new user...');
        showToast('User added successfully!', 'success');
        addUserModal.hide();
        form.reset();
      } else {
        form.classList.add('was-validated');
      }
    });
  }

  // Export Users Button
  const exportUsersBtn = document.getElementById('exportUsersBtn');
  if (exportUsersBtn) {
    exportUsersBtn.addEventListener('click', () => {
      console.log('Export Users clicked');
      showToast('Exporting user data...', 'info');
      // Add export logic here
    });
  }

  // Reset Filters
  const resetFilters = document.getElementById('resetFilters');
  if (resetFilters) {
    resetFilters.addEventListener('click', () => {
      document.getElementById('statusFilter').value = '';
      document.getElementById('roleFilter').value = '';
      document.getElementById('dateFilter').value = '';
      document.getElementById('searchUsers').value = '';
      console.log('Filters reset');
      showToast('Filters reset successfully', 'info');
      // Add filter reset logic here
    });
  }

  // Refresh Users
  const refreshUsers = document.getElementById('refreshUsers');
  if (refreshUsers) {
    refreshUsers.addEventListener('click', () => {
      console.log('Refreshing users list...');
      showToast('Refreshing user data...', 'info');
      // Add refresh logic here
      setTimeout(() => location.reload(), 1000); // Simulate refresh
    });
  }

  // Bulk Actions Dropdown
  const bulkActions = document.getElementById('bulkActions');
  if (bulkActions) {
    // Bootstrap dropdown handles the toggle automatically
  }

  // Select All Users
  const selectAllUsers = document.getElementById('selectAllUsers');
  if (selectAllUsers) {
    selectAllUsers.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.user-checkbox');
      checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
      });
      console.log(`${e.target.checked ? 'Selected' : 'Deselected'} all users`);
      showToast(`${e.target.checked ? 'All users selected' : 'Selection cleared'}`, 'info');
    });
  }

  // Individual user checkboxes
  const userCheckboxes = document.querySelectorAll('.user-checkbox');
  userCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateSelectAllState();
    });
  });

  function updateSelectAllState() {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    const selectAll = document.getElementById('selectAllUsers');
    const checkedCount = document.querySelectorAll('.user-checkbox:checked').length;
    
    selectAll.checked = checkedCount === checkboxes.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
  }

  // Filter functionality
  const filters = ['statusFilter', 'roleFilter', 'dateFilter', 'searchUsers'];
  filters.forEach(filterId => {
    const filter = document.getElementById(filterId);
    if (filter) {
      filter.addEventListener('change', applyFilters);
      if (filterId === 'searchUsers') {
        filter.addEventListener('input', applyFilters);
      }
    }
  });

  function applyFilters() {
    const status = document.getElementById('statusFilter').value;
    const role = document.getElementById('roleFilter').value;
    const date = document.getElementById('dateFilter').value;
    const search = document.getElementById('searchUsers').value.toLowerCase();
    
    console.log('Applying filters:', { status, role, date, search });
    showToast('Applying filters...', 'info');
    // Add actual filter logic here
  }

  // Action buttons for individual users
  const editButtons = document.querySelectorAll('.nr-action-btn.edit');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userName = btn.closest('tr').querySelector('.nr-user-name').textContent;
      console.log(`Editing user: ${userName}`);
      showToast(`Editing user: ${userName}`, 'info');
      // Add edit user logic here
    });
  });

  const suspendButtons = document.querySelectorAll('.nr-action-btn.suspend');
  suspendButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userName = btn.closest('tr').querySelector('.nr-user-name').textContent;
      if (confirm(`Are you sure you want to suspend ${userName}?`)) {
        console.log(`Suspended user: ${userName}`);
        showToast(`User ${userName} suspended`, 'warning');
        // Add suspend logic here
      }
    });
  });

  const activateButtons = document.querySelectorAll('.nr-action-btn.activate');
  activateButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userName = btn.closest('tr').querySelector('.nr-user-name').textContent;
      if (confirm(`Are you sure you want to activate ${userName}?`)) {
        console.log(`Activated user: ${userName}`);
        showToast(`User ${userName} activated`, 'success');
        // Add activate logic here
      }
    });
  });

  const deleteButtons = document.querySelectorAll('.nr-action-btn.delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userName = btn.closest('tr').querySelector('.nr-user-name').textContent;
      if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
        console.log(`Deleted user: ${userName}`);
        showToast(`User ${userName} deleted`, 'danger');
        // Add delete logic here
      }
    });
  });

  // Table row click for user details
  const tableRows = document.querySelectorAll('.nr-users-table tbody tr');
  tableRows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (!e.target.closest('.nr-action-buttons') && e.target.type !== 'checkbox') {
        const userName = row.querySelector('.nr-user-name').textContent;
        console.log(`Viewing details for user: ${userName}`);
        showToast(`Viewing details for: ${userName}`, 'info');
        // In real implementation, open user details modal or page
      }
    });
  });

  // Pagination
  const paginationButtons = document.querySelectorAll('.page-item:not(.disabled) .page-link');
  paginationButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pageText = btn.textContent.trim();
      if (!btn.closest('.page-item').classList.contains('active')) {
        console.log('Changing page to:', pageText);
        showToast(`Loading page ${pageText}...`, 'info');
        // Add pagination logic here
      }
    });
  });

  // Toast notification function
  function showToast(message, type = 'info') {
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
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
      toastContainer.remove();
    });
  }

  // Initialize filters state
  applyFilters();
});