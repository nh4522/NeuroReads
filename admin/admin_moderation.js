// admin_moderation.js - MODERATION SPECIFIC FUNCTIONALITY ONLY WITH BOOTSTRAP
document.addEventListener('DOMContentLoaded', () => {
  // Only moderation specific functionality here
  // NO DROPDOWN CODE - that's in admin_common.js

  console.log('Moderation system initialized');

  // Bootstrap Modal instance
  let autoModModal = null;
  if (document.getElementById('autoModModal')) {
    autoModModal = new bootstrap.Modal(document.getElementById('autoModModal'));
  }

  // Auto-Mod Settings
  const autoModSettings = document.getElementById('autoModSettings');
  if (autoModSettings) {
    autoModSettings.addEventListener('click', () => {
      console.log('Auto-Mod settings clicked');
      // Modal will open automatically via data-bs-toggle
    });
  }

  // Moderation Logs
  const moderationLogs = document.getElementById('moderationLogs');
  if (moderationLogs) {
    moderationLogs.addEventListener('click', () => {
      console.log('Moderation logs clicked');
      showToast('Opening moderation logs...', 'info');
    });
  }

  // Quick Actions
  const quickActionButtons = document.querySelectorAll('.nr-quick-action-btn');
  quickActionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      console.log(`Quick action: ${action}`);
      showToast(`Loading ${action.replace('-', ' ')}...`, 'info');
      
      switch(action) {
        case 'review-comments':
          filterQueue('comments');
          break;
        case 'review-reviews':
          filterQueue('reviews');
          break;
        case 'user-reports':
          filterQueue('users');
          break;
        case 'content-flags':
          filterQueue('content');
          break;
      }
    });
  });

  function filterQueue(type) {
    const queueFilter = document.getElementById('queueFilter');
    if (queueFilter) {
      queueFilter.value = type;
      applyQueueFilter();
    }
    console.log(`Filtered queue to show: ${type}`);
  }

  // Queue Filter
  const queueFilter = document.getElementById('queueFilter');
  if (queueFilter) {
    queueFilter.addEventListener('change', applyQueueFilter);
  }

  function applyQueueFilter() {
    const filterValue = queueFilter.value;
    const queueItems = document.querySelectorAll('.nr-queue-item');
    
    queueItems.forEach(item => {
      if (filterValue === 'all' || item.dataset.type === filterValue || 
          (filterValue === 'urgent' && item.dataset.priority === 'high')) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
    
    console.log(`Applied queue filter: ${filterValue}`);
    showToast(`Filtered to: ${filterValue}`, 'info');
  }

  // Refresh Queue
  const refreshQueue = document.getElementById('refreshQueue');
  if (refreshQueue) {
    refreshQueue.addEventListener('click', () => {
      console.log('Refreshing moderation queue...');
      showToast('Refreshing queue...', 'info');
      // Add actual refresh logic here
      setTimeout(() => location.reload(), 1000); // Simulate refresh
    });
  }

  // Select All in Queue
  const queueCheckboxes = document.querySelectorAll('.queue-checkbox');
  
  // Individual queue checkboxes
  queueCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateQueueSelectAll);
  });

  function updateQueueSelectAll() {
    const checkedCount = document.querySelectorAll('.queue-checkbox:checked').length;
    const totalCount = queueCheckboxes.length;
    
    // Update bulk action buttons state
    const approveSelected = document.getElementById('approveSelected');
    const rejectSelected = document.getElementById('rejectSelected');
    
    if (checkedCount > 0) {
      approveSelected.disabled = false;
      rejectSelected.disabled = false;
    } else {
      approveSelected.disabled = true;
      rejectSelected.disabled = true;
    }
  }

  // Bulk Actions
  const approveSelected = document.getElementById('approveSelected');
  if (approveSelected) {
    approveSelected.addEventListener('click', () => {
      const selectedItems = document.querySelectorAll('.queue-checkbox:checked');
      if (selectedItems.length === 0) {
        showToast('Please select items to approve', 'warning');
        return;
      }
      
      if (confirm(`Approve ${selectedItems.length} selected items?`)) {
        console.log(`Approved ${selectedItems.length} items`);
        showToast(`Approved ${selectedItems.length} items`, 'success');
        // Add bulk approve logic here
        selectedItems.forEach(checkbox => {
          const item = checkbox.closest('.nr-queue-item');
          item.style.opacity = '0.5';
          setTimeout(() => item.remove(), 300);
        });
      }
    });
  }

  const rejectSelected = document.getElementById('rejectSelected');
  if (rejectSelected) {
    rejectSelected.addEventListener('click', () => {
      const selectedItems = document.querySelectorAll('.queue-checkbox:checked');
      if (selectedItems.length === 0) {
        showToast('Please select items to reject', 'warning');
        return;
      }
      
      if (confirm(`Reject ${selectedItems.length} selected items?`)) {
        console.log(`Rejected ${selectedItems.length} items`);
        showToast(`Rejected ${selectedItems.length} items`, 'danger');
        // Add bulk reject logic here
        selectedItems.forEach(checkbox => {
          const item = checkbox.closest('.nr-queue-item');
          item.style.opacity = '0.5';
          setTimeout(() => item.remove(), 300);
        });
      }
    });
  }

  // Individual Action Buttons
  const approveButtons = document.querySelectorAll('.nr-action-btn.approve');
  approveButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = btn.closest('.nr-queue-item');
      const itemText = item.querySelector('.nr-queue-text').textContent;
      
      if (confirm('Approve this content?')) {
        console.log('Approved item:', itemText);
        showToast('Content approved', 'success');
        // Add approve logic here
        item.style.opacity = '0.5';
        setTimeout(() => item.remove(), 300);
        addRecentAction('approved', `Approved: ${itemText.substring(0, 50)}...`);
      }
    });
  });

  const rejectButtons = document.querySelectorAll('.nr-action-btn.reject');
  rejectButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = btn.closest('.nr-queue-item');
      const itemText = item.querySelector('.nr-queue-text').textContent;
      
      if (confirm('Reject this content?')) {
        console.log('Rejected item:', itemText);
        showToast('Content rejected', 'danger');
        // Add reject logic here
        item.style.opacity = '0.5';
        setTimeout(() => item.remove(), 300);
        addRecentAction('rejected', `Rejected: ${itemText.substring(0, 50)}...`);
      }
    });
  });

  const warnButtons = document.querySelectorAll('.nr-action-btn.warn');
  warnButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const user = btn.closest('.nr-queue-item').querySelector('.nr-queue-location').textContent;
      
      if (confirm(`Send warning to ${user}?`)) {
        console.log('Warning sent to:', user);
        showToast('Warning sent to user', 'warning');
        // Add warn logic here
        addRecentAction('suspended', `Warned user: ${user}`);
      }
    });
  });

  const suspendButtons = document.querySelectorAll('.nr-action-btn.suspend');
  suspendButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const user = btn.closest('.nr-queue-item').querySelector('.nr-queue-location').textContent;
      
      if (confirm(`Suspend ${user}?`)) {
        console.log('Suspended user:', user);
        showToast('User suspended', 'danger');
        // Add suspend logic here
        addRecentAction('suspended', `Suspended user: ${user}`);
      }
    });
  });

  const viewButtons = document.querySelectorAll('.nr-action-btn.view');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = btn.closest('.nr-queue-item');
      const itemText = item.querySelector('.nr-queue-text').textContent;
      
      console.log('Viewing context for:', itemText);
      showToast('Opening content context...', 'info');
      // In real implementation, open a modal with full content
    });
  });

  // Recent Actions
  const viewAllActions = document.getElementById('viewAllActions');
  if (viewAllActions) {
    viewAllActions.addEventListener('click', () => {
      console.log('Viewing all moderation actions');
      showToast('Opening full moderation history...', 'info');
    });
  }

  function addRecentAction(type, text) {
    const recentList = document.querySelector('.nr-recent-list');
    if (!recentList) return;

    const newItem = document.createElement('div');
    newItem.className = 'nr-recent-item';
    
    const iconClass = {
      'approved': 'approved',
      'rejected': 'rejected', 
      'suspended': 'suspended',
      'edited': 'edited'
    }[type] || 'approved';

    const iconHtml = {
      'approved': '<i class="bi bi-check-circle"></i>',
      'rejected': '<i class="bi bi-x-circle"></i>',
      'suspended': '<i class="bi bi-lock"></i>',
      'edited': '<i class="bi bi-pencil"></i>'
    }[type] || '<i class="bi bi-check-circle"></i>';

    newItem.innerHTML = `
      <div class="nr-recent-icon ${iconClass}">${iconHtml}</div>
      <div class="nr-recent-content">
        <div class="nr-recent-text">${text}</div>
        <div class="nr-recent-time text-muted small">Just now</div>
      </div>
    `;

    recentList.insertBefore(newItem, recentList.firstChild);
    
    // Limit to 10 items
    const items = recentList.querySelectorAll('.nr-recent-item');
    if (items.length > 10) {
      items[items.length - 1].remove();
    }
  }

  // Queue item click for details
  const queueItems = document.querySelectorAll('.nr-queue-item');
  queueItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.nr-queue-actions') && e.target.type !== 'checkbox') {
        const itemText = item.querySelector('.nr-queue-text').textContent;
        console.log('Viewing details for:', itemText);
        showToast('Opening detailed view...', 'info');
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

  // Initialize
  applyQueueFilter();
  updateQueueSelectAll(); // Set initial state for bulk actions
});