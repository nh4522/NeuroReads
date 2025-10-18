// admin_user.js - USER MANAGEMENT SPECIFIC FUNCTIONALITY ONLY
document.addEventListener('DOMContentLoaded', () => {
  // Only user management specific functionality here
  // NO DROPDOWN CODE - that's in admin_common.js

  console.log('User Management initialized');

  // Add User Button
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
      console.log('Add User clicked');
      // In real implementation, open a modal or navigate to add user page
      alert('Add User functionality would open here');
    });
  }

  // Export Users Button
  const exportUsersBtn = document.getElementById('exportUsersBtn');
  if (exportUsersBtn) {
    exportUsersBtn.addEventListener('click', () => {
      console.log('Export Users clicked');
      alert('Exporting user data...');
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
      // Add filter reset logic here
    });
  }

  // Refresh Users
  const refreshUsers = document.getElementById('refreshUsers');
  if (refreshUsers) {
    refreshUsers.addEventListener('click', () => {
      console.log('Refreshing users list...');
      // Add refresh logic here
      location.reload(); // Simple refresh for demo
    });
  }

  // Bulk Actions
  const bulkActions = document.getElementById('bulkActions');
  if (bulkActions) {
    bulkActions.addEventListener('click', () => {
      const selectedUsers = document.querySelectorAll('.user-checkbox:checked');
      if (selectedUsers.length === 0) {
        alert('Please select users to perform bulk actions');
        return;
      }
      console.log(`Bulk actions for ${selectedUsers.length} users`);
      // Add bulk actions logic here
    });
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
    // Add actual filter logic here
  }

  // Action buttons for individual users
  const editButtons = document.querySelectorAll('.nr-action-btn.edit');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userName = btn.closest('tr').querySelector('.nr-user-name').textContent;
      console.log(`Editing user: ${userName}`);
      // Add edit user logic here
      alert(`Edit user: ${userName}`);
    });
  });

  const suspendButtons = document.querySelectorAll('.nr-action-btn.suspend');
  suspendButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userName = btn.closest('tr').querySelector('.nr-user-name').textContent;
      if (confirm(`Are you sure you want to suspend ${userName}?`)) {
        console.log(`Suspended user: ${userName}`);
        // Add suspend logic here
        alert(`User ${userName} suspended`);
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
        // Add activate logic here
        alert(`User ${userName} activated`);
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
        // Add delete logic here
        alert(`User ${userName} deleted`);
      }
    });
  });

  // Table row click for user details
  const tableRows = document.querySelectorAll('.nr-users-table tbody tr');
  tableRows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (!e.target.closest('.nr-action-buttons') && !e.target.type === 'checkbox') {
        const userName = row.querySelector('.nr-user-name').textContent;
        console.log(`Viewing details for user: ${userName}`);
        // In real implementation, open user details modal or page
        alert(`Viewing details for: ${userName}`);
      }
    });
  });

  // Pagination
  const paginationButtons = document.querySelectorAll('.nr-pagination-btn:not(:disabled)');
  paginationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('active')) {
        console.log('Changing page to:', btn.textContent);
        // Add pagination logic here
      }
    });
  });

  // Initialize filters state
  applyFilters();
});