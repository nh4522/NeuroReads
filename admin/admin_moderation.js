// admin_moderation.js - MODERATION SPECIFIC FUNCTIONALITY ONLY
document.addEventListener('DOMContentLoaded', () => {
  // Only moderation specific functionality here
  // NO DROPDOWN CODE - that's in admin_common.js

  console.log('Moderation system initialized');

  // Auto-Mod Settings
  const autoModSettings = document.getElementById('autoModSettings');
  if (autoModSettings) {
    autoModSettings.addEventListener('click', () => {
      console.log('Auto-Mod settings clicked');
      alert('Auto-Moderation settings would open here');
    });
  }

  // Moderation Logs
  const moderationLogs = document.getElementById('moderationLogs');
  if (moderationLogs) {
    moderationLogs.addEventListener('click', () => {
      console.log('Moderation logs clicked');
      alert('Moderation logs would open here');
    });
  }

  // Quick Actions
  const quickActionButtons = document.querySelectorAll('.nr-quick-action-btn');
  quickActionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      console.log(`Quick action: ${action}`);
      
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
  }

  // Refresh Queue
  const refreshQueue = document.getElementById('refreshQueue');
  if (refreshQueue) {
    refreshQueue.addEventListener('click', () => {
      console.log('Refreshing moderation queue...');
      // Add actual refresh logic here
      location.reload(); // Simple refresh for demo
    });
  }

  // Select All in Queue
  const queueCheckboxes = document.querySelectorAll('.queue-checkbox');
  const selectAllQueue = document.querySelector('.nr-queue-select input[type="checkbox"]');
  
  if (selectAllQueue) {
    selectAllQueue.addEventListener('change', (e) => {
      queueCheckboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
      });
      console.log(`${e.target.checked ? 'Selected' : 'Deselected'} all queue items`);
    });
  }

  // Individual queue checkboxes
  queueCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateQueueSelectAll);
  });

  function updateQueueSelectAll() {
    const checkedCount = document.querySelectorAll('.queue-checkbox:checked').length;
    const totalCount = queueCheckboxes.length;
    
    if (selectAllQueue) {
      selectAllQueue.checked = checkedCount === totalCount;
      selectAllQueue.indeterminate = checkedCount > 0 && checkedCount < totalCount;
    }
  }

  // Bulk Actions
  const approveSelected = document.getElementById('approveSelected');
  if (approveSelected) {
    approveSelected.addEventListener('click', () => {
      const selectedItems = document.querySelectorAll('.queue-checkbox:checked');
      if (selectedItems.length === 0) {
        alert('Please select items to approve');
        return;
      }
      
      if (confirm(`Approve ${selectedItems.length} selected items?`)) {
        console.log(`Approved ${selectedItems.length} items`);
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
        alert('Please select items to reject');
        return;
      }
      
      if (confirm(`Reject ${selectedItems.length} selected items?`)) {
        console.log(`Rejected ${selectedItems.length} items`);
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
      alert(`Viewing full context for: ${itemText}`);
    });
  });

  // Recent Actions
  const viewAllActions = document.getElementById('viewAllActions');
  if (viewAllActions) {
    viewAllActions.addEventListener('click', () => {
      console.log('Viewing all moderation actions');
      alert('Full moderation history would open here');
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

    const iconText = {
      'approved': '✅',
      'rejected': '❌',
      'suspended': '🔒',
      'edited': '✏️'
    }[type] || '✅';

    newItem.innerHTML = `
      <div class="nr-recent-icon ${iconClass}">${iconText}</div>
      <div class="nr-recent-content">
        <div class="nr-recent-text">${text}</div>
        <div class="nr-recent-time">Just now</div>
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
      if (!e.target.closest('.nr-queue-actions') && !e.target.type === 'checkbox') {
        const itemText = item.querySelector('.nr-queue-text').textContent;
        console.log('Viewing details for:', itemText);
        alert(`Detailed view for: ${itemText}`);
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

  // Initialize
  applyQueueFilter();
});