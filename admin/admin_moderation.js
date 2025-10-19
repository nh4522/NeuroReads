// admin_moderation.js - CONTENT MODERATION SPECIFIC FUNCTIONALITY WITH BOOTSTRAP
document.addEventListener('DOMContentLoaded', function() {
  console.log('Content Moderation initialized');

  // Initialize all moderation components
  initializeModeration();

  function initializeModeration() {
    // Auto-Mod Settings Modal
    const autoModSettingsBtn = document.getElementById('autoModSettings');
    if (autoModSettingsBtn) {
      autoModSettingsBtn.addEventListener('click', function() {
        console.log('Auto-Mod Settings clicked');
        loadAutoModSettings();
      });
    }

    // Moderation Logs Button
    const moderationLogsBtn = document.getElementById('moderationLogs');
    if (moderationLogsBtn) {
      moderationLogsBtn.addEventListener('click', function() {
        console.log('Moderation Logs clicked');
        showModerationLogs();
      });
    }

    // Quick Action Buttons
    const quickActionBtns = document.querySelectorAll('.nr-quick-action-btn');
    quickActionBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        console.log('Quick action:', action);
        handleQuickAction(action);
      });
    });

    // Queue Filter
    const queueFilter = document.getElementById('queueFilter');
    if (queueFilter) {
      queueFilter.addEventListener('change', function() {
        const filterValue = this.value;
        console.log('Queue filter changed:', filterValue);
        filterQueueItems(filterValue);
      });
    }

    // Refresh Queue Button
    const refreshQueueBtn = document.getElementById('refreshQueue');
    if (refreshQueueBtn) {
      refreshQueueBtn.addEventListener('click', function() {
        console.log('Refresh queue clicked');
        refreshModerationQueue();
      });
    }

    // Bulk Actions
    const approveSelectedBtn = document.getElementById('approveSelected');
    const rejectSelectedBtn = document.getElementById('rejectSelected');
    
    if (approveSelectedBtn) {
      approveSelectedBtn.addEventListener('click', function() {
        const selectedItems = getSelectedQueueItems();
        console.log('Approve selected:', selectedItems);
        bulkApproveItems(selectedItems);
      });
    }
    
    if (rejectSelectedBtn) {
      rejectSelectedBtn.addEventListener('click', function() {
        const selectedItems = getSelectedQueueItems();
        console.log('Reject selected:', selectedItems);
        bulkRejectItems(selectedItems);
      });
    }

    // Individual Action Buttons
    initializeIndividualActions();

    // View All Actions Button
    const viewAllActionsBtn = document.getElementById('viewAllActions');
    if (viewAllActionsBtn) {
      viewAllActionsBtn.addEventListener('click', function() {
        console.log('View all actions clicked');
        viewAllModerationActions();
      });
    }

    // Load initial data
    loadModerationStats();
    updateQueueBadges();
  }

  function initializeIndividualActions() {
    // Approve buttons
    const approveBtns = document.querySelectorAll('.nr-action-btn.approve');
    approveBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const queueItem = this.closest('.nr-queue-item');
        const itemId = queueItem.getAttribute('data-item-id') || generateItemId();
        console.log('Approve item:', itemId);
        approveItem(queueItem, itemId);
      });
    });

    // Reject buttons
    const rejectBtns = document.querySelectorAll('.nr-action-btn.reject');
    rejectBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const queueItem = this.closest('.nr-queue-item');
        const itemId = queueItem.getAttribute('data-item-id') || generateItemId();
        console.log('Reject item:', itemId);
        rejectItem(queueItem, itemId);
      });
    });

    // View buttons
    const viewBtns = document.querySelectorAll('.nr-action-btn.view');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const queueItem = this.closest('.nr-queue-item');
        const itemId = queueItem.getAttribute('data-item-id') || generateItemId();
        console.log('View item:', itemId);
        viewItemContext(queueItem, itemId);
      });
    });

    // Warn buttons
    const warnBtns = document.querySelectorAll('.nr-action-btn.warn');
    warnBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const queueItem = this.closest('.nr-queue-item');
        const itemId = queueItem.getAttribute('data-item-id') || generateItemId();
        console.log('Warn user for item:', itemId);
        warnUser(queueItem, itemId);
      });
    });

    // Suspend buttons
    const suspendBtns = document.querySelectorAll('.nr-action-btn.suspend');
    suspendBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const queueItem = this.closest('.nr-queue-item');
        const itemId = queueItem.getAttribute('data-item-id') || generateItemId();
        console.log('Suspend user for item:', itemId);
        suspendUser(queueItem, itemId);
      });
    });

    // Edit buttons
    const editBtns = document.querySelectorAll('.nr-action-btn.edit');
    editBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const queueItem = this.closest('.nr-queue-item');
        const itemId = queueItem.getAttribute('data-item-id') || generateItemId();
        console.log('Edit item:', itemId);
        editContent(queueItem, itemId);
      });
    });
  }

  // Main Moderation Functions
  function loadAutoModSettings() {
    console.log('Loading auto-mod settings...');
    // In a real application, this would fetch settings from an API
    showToast('Auto-mod settings loaded', 'info');
  }

  function showModerationLogs() {
    console.log('Showing moderation logs...');
    showToast('Opening moderation logs...', 'info');
    // This would typically open a modal or navigate to logs page
  }

  function handleQuickAction(action) {
    switch (action) {
      case 'review-comments':
        filterQueueItems('comments');
        showToast('Filtering comments for review', 'info');
        break;
      case 'review-reviews':
        filterQueueItems('reviews');
        showToast('Filtering book reviews for review', 'info');
        break;
      case 'user-reports':
        filterQueueItems('users');
        showToast('Filtering user reports', 'info');
        break;
      case 'content-flags':
        filterQueueItems('content');
        showToast('Filtering content flags', 'info');
        break;
      default:
        console.log('Unknown quick action:', action);
    }
  }

  function filterQueueItems(filter) {
    const queueItems = document.querySelectorAll('.nr-queue-item');
    let visibleCount = 0;

    queueItems.forEach(item => {
      const itemType = item.getAttribute('data-type');
      const itemPriority = item.getAttribute('data-priority');
      
      let shouldShow = false;
      
      switch (filter) {
        case 'all':
          shouldShow = true;
          break;
        case 'comments':
          shouldShow = itemType === 'comment';
          break;
        case 'reviews':
          shouldShow = itemType === 'review';
          break;
        case 'users':
          shouldShow = itemType === 'user';
          break;
        case 'content':
          shouldShow = itemType === 'content';
          break;
        case 'urgent':
          shouldShow = itemPriority === 'high';
          break;
        default:
          shouldShow = true;
      }
      
      if (shouldShow) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });
    
    updatePaginationInfo(visibleCount);
    showToast(`Showing ${visibleCount} items filtered by: ${filter}`, 'info');
  }

  function refreshModerationQueue() {
    const refreshBtn = document.getElementById('refreshQueue');
    const originalHTML = refreshBtn.innerHTML;
    
    // Show loading state
    refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spinner-border spinner-border-sm"></i>';
    refreshBtn.disabled = true;
    
    console.log('Refreshing moderation queue...');
    
    // Simulate API call
    setTimeout(() => {
      // Add a new mock item to simulate refresh
      addMockQueueItem();
      
      showToast('Moderation queue refreshed', 'success');
      
      // Restore button
      refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
      refreshBtn.disabled = false;
      
      // Update stats
      loadModerationStats();
      updateQueueBadges();
    }, 1500);
  }

  function getSelectedQueueItems() {
    const selectedCheckboxes = document.querySelectorAll('.queue-checkbox:checked');
    const selectedItems = [];
    
    selectedCheckboxes.forEach(checkbox => {
      const queueItem = checkbox.closest('.nr-queue-item');
      const itemId = queueItem.getAttribute('data-item-id') || generateItemId();
      selectedItems.push({
        element: queueItem,
        id: itemId,
        type: queueItem.getAttribute('data-type'),
        priority: queueItem.getAttribute('data-priority')
      });
    });
    
    return selectedItems;
  }

  function bulkApproveItems(items) {
    if (items.length === 0) {
      showToast('Please select items to approve', 'warning');
      return;
    }
    
    if (confirm(`Approve ${items.length} selected item(s)?`)) {
      const approveBtn = document.getElementById('approveSelected');
      const originalHTML = approveBtn.innerHTML;
      
      // Show loading state
      approveBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> Approving...';
      approveBtn.disabled = true;
      
      items.forEach((item, index) => {
        setTimeout(() => {
          approveItem(item.element, item.id, false);
          
          // Re-enable button after last item
          if (index === items.length - 1) {
            approveBtn.innerHTML = originalHTML;
            approveBtn.disabled = false;
            showToast(`Successfully approved ${items.length} item(s)`, 'success');
          }
        }, index * 300);
      });
    }
  }

  function bulkRejectItems(items) {
    if (items.length === 0) {
      showToast('Please select items to reject', 'warning');
      return;
    }
    
    if (confirm(`Reject ${items.length} selected item(s)?`)) {
      const rejectBtn = document.getElementById('rejectSelected');
      const originalHTML = rejectBtn.innerHTML;
      
      // Show loading state
      rejectBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> Rejecting...';
      rejectBtn.disabled = true;
      
      items.forEach((item, index) => {
        setTimeout(() => {
          rejectItem(item.element, item.id, false);
          
          // Re-enable button after last item
          if (index === items.length - 1) {
            rejectBtn.innerHTML = originalHTML;
            rejectBtn.disabled = false;
            showToast(`Successfully rejected ${items.length} item(s)`, 'success');
          }
        }, index * 300);
      });
    }
  }

  function approveItem(queueItem, itemId, showIndividualToast = true) {
    console.log(`Approving item ${itemId}`);
    
    // Add to recent actions
    addRecentAction('approved', `Approved ${getItemType(queueItem)}`);
    
    // Remove from queue with animation
    queueItem.style.opacity = '0.5';
    setTimeout(() => {
      queueItem.remove();
      updateQueueCounts();
      if (showIndividualToast) {
        showToast('Item approved successfully', 'success');
      }
    }, 500);
  }

  function rejectItem(queueItem, itemId, showIndividualToast = true) {
    console.log(`Rejecting item ${itemId}`);
    
    // Add to recent actions
    addRecentAction('rejected', `Rejected ${getItemType(queueItem)} for violation`);
    
    // Remove from queue with animation
    queueItem.style.opacity = '0.5';
    setTimeout(() => {
      queueItem.remove();
      updateQueueCounts();
      if (showIndividualToast) {
        showToast('Item rejected successfully', 'success');
      }
    }, 500);
  }

  function viewItemContext(queueItem, itemId) {
    console.log(`Viewing context for item ${itemId}`);
    const itemType = getItemType(queueItem);
    showToast(`Opening ${itemType} context in new tab...`, 'info');
    
    // In real application, this would open a modal or new view
    // For demo, we'll simulate with a brief highlight
    queueItem.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
    setTimeout(() => {
      queueItem.style.backgroundColor = '';
    }, 2000);
  }

  function warnUser(queueItem, itemId) {
    console.log(`Warning user for item ${itemId}`);
    
    if (confirm('Send warning message to this user?')) {
      const username = queueItem.querySelector('.nr-queue-location')?.textContent.replace('User: ', '') || 'Unknown User';
      
      // Add to recent actions
      addRecentAction('suspended', `Sent warning to user ${username}`);
      
      showToast(`Warning sent to ${username}`, 'success');
      
      // Remove from queue after warning
      setTimeout(() => {
        queueItem.remove();
        updateQueueCounts();
      }, 1000);
    }
  }

  function suspendUser(queueItem, itemId) {
    console.log(`Suspending user for item ${itemId}`);
    
    const duration = prompt('Enter suspension duration (days):', '7');
    if (duration && !isNaN(duration)) {
      const username = queueItem.querySelector('.nr-queue-location')?.textContent.replace('User: ', '') || 'Unknown User';
      
      // Add to recent actions
      addRecentAction('suspended', `Suspended user ${username} for ${duration} days`);
      
      showToast(`User ${username} suspended for ${duration} days`, 'success');
      
      // Remove from queue after suspension
      setTimeout(() => {
        queueItem.remove();
        updateQueueCounts();
      }, 1000);
    }
  }

  function editContent(queueItem, itemId) {
    console.log(`Editing content for item ${itemId}`);
    
    const newContent = prompt('Edit the content:', 
      queueItem.querySelector('.nr-queue-text').textContent.trim());
    
    if (newContent !== null) {
      queueItem.querySelector('.nr-queue-text').textContent = newContent;
      
      // Add to recent actions
      addRecentAction('edited', `Edited content for ${getItemType(queueItem)}`);
      
      showToast('Content updated successfully', 'success');
    }
  }

  function viewAllModerationActions() {
    console.log('Viewing all moderation actions...');
    showToast('Opening full moderation history...', 'info');
    // This would typically navigate to a dedicated logs page
  }

  // Utility Functions
  function loadModerationStats() {
    console.log('Loading moderation statistics...');
    // In real application, this would fetch from API
    // For demo, we'll just log the action
  }

  function updateQueueBadges() {
    // Update quick action badges based on current queue counts
    const commentCount = document.querySelectorAll('.nr-queue-item[data-type="comment"]').length;
    const reviewCount = document.querySelectorAll('.nr-queue-item[data-type="review"]').length;
    const userCount = document.querySelectorAll('.nr-queue-item[data-type="user"]').length;
    const contentCount = document.querySelectorAll('.nr-queue-item[data-type="content"]').length;
    
    // Update badge counts (in real app, this would be more sophisticated)
    console.log(`Queue counts - Comments: ${commentCount}, Reviews: ${reviewCount}, Users: ${userCount}, Content: ${contentCount}`);
  }

  function updateQueueCounts() {
    const totalItems = document.querySelectorAll('.nr-queue-item').length;
    const pendingReportsElement = document.querySelector('.nr-stat-value');
    
    if (pendingReportsElement) {
      pendingReportsElement.textContent = totalItems;
    }
    
    updateQueueBadges();
    updatePaginationInfo(totalItems);
  }

  function updatePaginationInfo(visibleCount) {
    const paginationInfo = document.querySelector('.nr-pagination-info');
    if (paginationInfo) {
      const totalItems = document.querySelectorAll('.nr-queue-item').length;
      paginationInfo.textContent = `Showing 1-${visibleCount} of ${totalItems} items`;
    }
  }

  function addRecentAction(type, text) {
    const recentList = document.querySelector('.nr-recent-list');
    if (!recentList) return;
    
    const now = new Date();
    const timeText = 'Just now';
    
    const newAction = document.createElement('div');
    newAction.className = 'nr-recent-item';
    
    const iconClass = {
      'approved': 'bi-check-circle',
      'rejected': 'bi-x-circle',
      'suspended': 'bi-lock',
      'edited': 'bi-pencil'
    }[type] || 'bi-info-circle';
    
    newAction.innerHTML = `
      <div class="nr-recent-icon ${type}">
        <i class="bi ${iconClass}"></i>
      </div>
      <div class="nr-recent-content">
        <div class="nr-recent-text">${text}</div>
        <div class="nr-recent-time text-muted small">${timeText}</div>
      </div>
    `;
    
    // Add to top of list
    recentList.insertBefore(newAction, recentList.firstChild);
    
    // Remove oldest item if more than 4
    const items = recentList.querySelectorAll('.nr-recent-item');
    if (items.length > 4) {
      items[items.length - 1].remove();
    }
  }

  function getItemType(queueItem) {
    const type = queueItem.getAttribute('data-type');
    const typeMap = {
      'comment': 'comment',
      'review': 'book review',
      'user': 'user report',
      'content': 'content flag'
    };
    
    return typeMap[type] || 'item';
  }

  function generateItemId() {
    return 'item_' + Math.random().toString(36).substr(2, 9);
  }

  function addMockQueueItem() {
    const queueItems = document.querySelector('.nr-queue-items');
    if (!queueItems) return;
    
    const mockTypes = ['comment', 'review', 'user', 'content'];
    const mockPriorities = ['high', 'medium', 'low'];
    const randomType = mockTypes[Math.floor(Math.random() * mockTypes.length)];
    const randomPriority = mockPriorities[Math.floor(Math.random() * mockPriorities.length)];
    
    const newItem = document.createElement('div');
    newItem.className = 'nr-queue-item new';
    newItem.setAttribute('data-type', randomType);
    newItem.setAttribute('data-priority', randomPriority);
    newItem.setAttribute('data-item-id', generateItemId());
    
    newItem.innerHTML = `
      <div class="nr-queue-select">
        <input type="checkbox" class="form-check-input queue-checkbox">
      </div>
      <div class="nr-queue-content flex-grow-1">
        <div class="nr-queue-meta d-flex align-items-center gap-2 mb-2 flex-wrap">
          <span class="nr-queue-type badge bg-primary">${randomType.charAt(0).toUpperCase() + randomType.slice(1)}</span>
          <span class="nr-queue-priority ${randomPriority} badge bg-${randomPriority === 'high' ? 'danger' : randomPriority === 'medium' ? 'warning' : 'success'}">${randomPriority.charAt(0).toUpperCase() + randomPriority.slice(1)} Priority</span>
          <span class="nr-queue-time text-muted small">Just now</span>
        </div>
        <div class="nr-queue-text fst-italic mb-2">
          "New item requiring moderation review..."
        </div>
        <div class="nr-queue-details d-flex gap-3 flex-wrap">
          <span class="nr-queue-user text-muted small">Reported by: System</span>
          <span class="nr-queue-reason text-muted small">Reason: Auto-detected</span>
          <span class="nr-queue-location text-muted small">On: Automated Test</span>
        </div>
      </div>
      <div class="nr-queue-actions">
        <div class="btn-group">
          <button class="nr-action-btn approve btn btn-sm btn-outline-success" title="Approve">
            <i class="bi bi-check-lg"></i>
          </button>
          <button class="nr-action-btn reject btn btn-sm btn-outline-danger" title="Reject">
            <i class="bi bi-x-lg"></i>
          </button>
          <button class="nr-action-btn view btn btn-sm btn-outline-primary" title="View Context">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </div>
    `;
    
    // Add to top of queue
    queueItems.insertBefore(newItem, queueItems.firstChild);
    
    // Initialize actions for new item
    initializeIndividualActionsForItem(newItem);
    
    // Update counts
    updateQueueCounts();
  }

  function initializeIndividualActionsForItem(item) {
    const approveBtn = item.querySelector('.nr-action-btn.approve');
    const rejectBtn = item.querySelector('.nr-action-btn.reject');
    const viewBtn = item.querySelector('.nr-action-btn.view');
    
    if (approveBtn) {
      approveBtn.addEventListener('click', function() {
        const itemId = item.getAttribute('data-item-id');
        approveItem(item, itemId);
      });
    }
    
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function() {
        const itemId = item.getAttribute('data-item-id');
        rejectItem(item, itemId);
      });
    }
    
    if (viewBtn) {
      viewBtn.addEventListener('click', function() {
        const itemId = item.getAttribute('data-item-id');
        viewItemContext(item, itemId);
      });
    }
  }

  // Toast notification function
  function showToast(message, type = 'info') {
    // Remove any existing toasts
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

  // Initialize when page loads
  console.log('Content Moderation fully loaded and initialized');
  updateQueueCounts();
});