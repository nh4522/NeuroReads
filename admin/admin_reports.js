// admin_reports.js - REPORTS & ANALYTICS SPECIFIC FUNCTIONALITY ONLY
document.addEventListener('DOMContentLoaded', () => {
  // Only reports-specific functionality here
  // NO DROPDOWN CODE - that's in admin_common.js

  console.log('Reports & Analytics system initialized');

  // Generate Report Button
  const generateReportBtn = document.getElementById('generateReportBtn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      console.log('Generate Report clicked');
      showReportModal('generate');
    });
  }

  // Schedule Report Button
  const scheduleReportBtn = document.getElementById('scheduleReportBtn');
  if (scheduleReportBtn) {
    scheduleReportBtn.addEventListener('click', () => {
      console.log('Schedule Report clicked');
      showReportModal('schedule');
    });
  }

  // Date Range Presets
  const datePresets = document.querySelectorAll('.nr-date-preset');
  datePresets.forEach(preset => {
    preset.addEventListener('click', () => {
      // Remove active class from all presets
      datePresets.forEach(p => p.classList.remove('active'));
      // Add active class to clicked preset
      preset.classList.add('active');
      
      const days = preset.dataset.days;
      if (days === 'custom') {
        document.getElementById('customDateRange').style.display = 'block';
      } else {
        document.getElementById('customDateRange').style.display = 'none';
        applyDateRange(parseInt(days));
      }
    });
  });

  // Apply Custom Date Range
  const applyDateRangeBtn = document.getElementById('applyDateRange');
  if (applyDateRangeBtn) {
    applyDateRangeBtn.addEventListener('click', () => {
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      
      if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
      }
      
      if (new Date(startDate) > new Date(endDate)) {
        alert('Start date cannot be after end date');
        return;
      }
      
      console.log('Applying custom date range:', { startDate, endDate });
      loadReportsData(startDate, endDate);
    });
  }

  // Set default dates for custom range
  function setDefaultDates() {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    document.getElementById('startDate').value = oneWeekAgo.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
  }

  // Apply date range
  function applyDateRange(days) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    console.log(`Loading data for last ${days} days`);
    loadReportsData(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
  }

  // Load reports data (simulated)
  function loadReportsData(startDate, endDate) {
    console.log('Loading reports data from', startDate, 'to', endDate);
    
    // Simulate API call
    setTimeout(() => {
      updateMetrics();
      console.log('Reports data loaded successfully');
    }, 1000);
  }

  // Update metrics with new data
  function updateMetrics() {
    const metrics = document.querySelectorAll('.nr-metric-value');
    metrics.forEach(metric => {
      // Simulate data update with small random variation
      const currentText = metric.textContent;
      
      if (currentText.includes('%')) {
        // Handle percentage metrics
        const currentValue = parseFloat(currentText);
        const variation = (Math.random() * 4) - 2; // -2% to +2%
        const newValue = Math.max(0, currentValue + variation);
        metric.textContent = newValue.toFixed(1) + '%';
      } else {
        // Handle count metrics
        const currentValue = parseInt(currentText.replace(/[^0-9]/g, ''));
        const variation = Math.floor(Math.random() * 201) - 100; // -100 to +100
        const newValue = Math.max(1000, currentValue + variation);
        
        if (currentValue < 100) {
          // For percentage-like values under 100
          metric.textContent = newValue.toFixed(1) + '%';
        } else {
          metric.textContent = newValue.toLocaleString();
        }
      }
    });
  }

  // Report Card Actions
  const reportCards = document.querySelectorAll('.nr-report-card');
  reportCards.forEach(card => {
    const reportType = card.dataset.report;
    const viewBtn = card.querySelector('.nr-report-action.view');
    const downloadBtn = card.querySelector('.nr-report-action.download');
    const scheduleBtn = card.querySelector('.nr-report-action.schedule');
    const createBtn = card.querySelector('.nr-report-action.create');
    const templateBtn = card.querySelector('.nr-report-action.template');

    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        viewReport(reportType);
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadReport(reportType);
      });
    }

    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scheduleReport(reportType);
      });
    }

    if (createBtn) {
      createBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        createCustomReport();
      });
    }

    if (templateBtn) {
      templateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showReportTemplates();
      });
    }

    // Card click for quick view
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.nr-report-actions')) {
        viewReport(reportType);
      }
    });
  });

  // View Report
  function viewReport(reportType) {
    console.log(`Viewing ${reportType} report`);
    alert(`Opening ${getReportName(reportType)} report viewer...`);
    // In real implementation, this would open a detailed report view
  }

  // Download Report
  function downloadReport(reportType) {
    console.log(`Downloading ${reportType} report`);
    
    // Simulate download process
    const downloadBtn = event.target.closest('.nr-report-action');
    const originalHTML = downloadBtn.innerHTML;
    
    downloadBtn.innerHTML = '<img src="../icons/loading.png" alt="Loading" style="width:14px;height:14px;">';
    downloadBtn.disabled = true;
    
    setTimeout(() => {
      alert(`Downloading ${getReportName(reportType)} report...`);
      downloadBtn.innerHTML = originalHTML;
      downloadBtn.disabled = false;
      
      // Add to recent reports
      addRecentReport(reportType, 'success');
    }, 2000);
  }

  // Schedule Report
  function scheduleReport(reportType) {
    console.log(`Scheduling ${reportType} report`);
    showScheduleModal(reportType);
  }

  // Create Custom Report
  function createCustomReport() {
    console.log('Opening custom report builder');
    alert('Opening Custom Report Builder...');
  }

  // Show Report Templates
  function showReportTemplates() {
    console.log('Showing report templates');
    alert('Opening Report Templates Gallery...');
  }

  // Get report display name
  function getReportName(reportType) {
    const names = {
      'user-activity': 'User Activity',
      'book-performance': 'Book Performance',
      'engagement': 'Engagement Analytics',
      'moderation': 'Moderation Activity',
      'system': 'System Performance',
      'custom': 'Custom'
    };
    return names[reportType] || reportType;
  }

  // Scheduled Reports Actions
  const scheduledItems = document.querySelectorAll('.nr-scheduled-item');
  scheduledItems.forEach(item => {
    const editBtn = item.querySelector('.nr-scheduled-action.edit');
    const pauseBtn = item.querySelector('.nr-scheduled-action.pause');
    const resumeBtn = item.querySelector('.nr-scheduled-action.resume');
    const deleteBtn = item.querySelector('.nr-scheduled-action.delete');

    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = item.querySelector('.nr-scheduled-title').textContent;
        editSchedule(title);
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = item.querySelector('.nr-scheduled-title').textContent;
        pauseSchedule(title, item);
      });
    }

    if (resumeBtn) {
      resumeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = item.querySelector('.nr-scheduled-title').textContent;
        resumeSchedule(title, item);
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = item.querySelector('.nr-scheduled-title').textContent;
        deleteSchedule(title, item);
      });
    }
  });

  // Add New Schedule
  const addScheduleBtn = document.getElementById('addScheduleBtn');
  if (addScheduleBtn) {
    addScheduleBtn.addEventListener('click', () => {
      console.log('Adding new schedule');
      showScheduleModal();
    });
  }

  // Schedule Management Functions
  function editSchedule(title) {
    console.log(`Editing schedule: ${title}`);
    alert(`Editing schedule: ${title}`);
  }

  function pauseSchedule(title, item) {
    console.log(`Pausing schedule: ${title}`);
    const status = item.querySelector('.nr-scheduled-status');
    status.textContent = 'Paused';
    status.className = 'nr-scheduled-status paused';
    alert(`Schedule "${title}" has been paused`);
  }

  function resumeSchedule(title, item) {
    console.log(`Resuming schedule: ${title}`);
    const status = item.querySelector('.nr-scheduled-status');
    status.textContent = 'Active';
    status.className = 'nr-scheduled-status active';
    alert(`Schedule "${title}" has been resumed`);
  }

  function deleteSchedule(title, item) {
    if (confirm(`Are you sure you want to delete the schedule "${title}"?`)) {
      console.log(`Deleting schedule: ${title}`);
      item.style.opacity = '0.5';
      setTimeout(() => item.remove(), 300);
      alert(`Schedule "${title}" has been deleted`);
    }
  }

  // Recent Reports Actions
  const recentItems = document.querySelectorAll('.nr-recent-item');
  recentItems.forEach(item => {
    const downloadBtn = item.querySelector('.nr-recent-action.download');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = item.querySelector('.nr-recent-title').textContent;
        downloadRecentReport(title);
      });
    }
  });

  function downloadRecentReport(title) {
    console.log(`Downloading recent report: ${title}`);
    alert(`Downloading ${title}...`);
  }

  // Add to recent reports
  function addRecentReport(reportType, status) {
    const recentList = document.querySelector('.nr-recent-list');
    if (!recentList) return;

    const reportName = getReportName(reportType);
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newItem = document.createElement('div');
    newItem.className = 'nr-recent-item';
    
    const statusIcon = status === 'success' ? 'success' : 'warning';
    const statusText = status === 'success' ? 'Generated in 32s' : 'Completed with warnings';

    newItem.innerHTML = `
      <div class="nr-recent-icon ${statusIcon}">
        <img src="../icons/${statusIcon}.png" alt="${status}" style="width:16px;height:16px;">
      </div>
      <div class="nr-recent-content">
        <div class="nr-recent-title">${reportName} Report</div>
        <div class="nr-recent-details">
          <span class="nr-recent-date">Today, ${timeString}</span>
          <span class="nr-recent-size">PDF • 2.1 MB</span>
          <span class="nr-recent-duration">${statusText}</span>
        </div>
      </div>
      <div class="nr-recent-actions">
        <button class="nr-recent-action download" title="Download">
          <img src="../icons/download.png" alt="Download" style="width:14px;height:14px;">
        </button>
      </div>
    `;

    recentList.insertBefore(newItem, recentList.firstChild);
    
    // Limit to 5 items
    const items = recentList.querySelectorAll('.nr-recent-item');
    if (items.length > 5) {
      items[items.length - 1].remove();
    }
  }

  // View All Reports History
  const viewAllReports = document.getElementById('viewAllReports');
  if (viewAllReports) {
    viewAllReports.addEventListener('click', () => {
      console.log('Viewing all report history');
      alert('Opening Complete Report History...');
    });
  }

  // Modal functions (would be implemented in a real application)
  function showReportModal(type) {
    alert(`${type === 'generate' ? 'Generate' : 'Schedule'} Report modal would open here`);
  }

  function showScheduleModal(reportType) {
    if (reportType) {
      alert(`Scheduling ${getReportName(reportType)} Report...`);
    } else {
      alert('New Schedule modal would open here');
    }
  }

  // Initialize
  setDefaultDates();
  applyDateRange(7); // Load data for last 7 days by default
});