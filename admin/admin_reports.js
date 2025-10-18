// admin_reports.js - ENHANCED WITH FRAMEWORK FUNCTIONALITY
document.addEventListener('DOMContentLoaded', () => {
  console.log('Reports & Analytics system initialized with frameworks');

  // Initialize frameworks
  initCharts();
  
  // YOUR EXISTING FUNCTIONALITY - KEEP ALL OF THIS
  const generateReportBtn = document.getElementById('generateReportBtn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      console.log('Generate Report clicked');
      // ENHANCED: Use Bootstrap modal instead of alert
      showBootstrapModal('generate');
    });
  }

  const scheduleReportBtn = document.getElementById('scheduleReportBtn');
  if (scheduleReportBtn) {
    scheduleReportBtn.addEventListener('click', () => {
      console.log('Schedule Report clicked');
      // ENHANCED: Use Bootstrap modal instead of alert
      showBootstrapModal('schedule');
    });
  }

  // Date Range Presets - YOUR EXISTING CODE
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

  // Apply Custom Date Range - YOUR EXISTING CODE
  const applyDateRangeBtn = document.getElementById('applyDateRange');
  if (applyDateRangeBtn) {
    applyDateRangeBtn.addEventListener('click', () => {
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      
      if (!startDate || !endDate) {
        // ENHANCED: Use Bootstrap alert instead of basic alert
        showBootstrapAlert('Please select both start and end dates', 'warning');
        return;
      }
      
      if (new Date(startDate) > new Date(endDate)) {
        showBootstrapAlert('Start date cannot be after end date', 'warning');
        return;
      }
      
      console.log('Applying custom date range:', { startDate, endDate });
      loadReportsData(startDate, endDate);
    });
  }

  // Report Card Actions - YOUR EXISTING CODE
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

  // Scheduled Reports Actions - YOUR EXISTING CODE
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

  // Add New Schedule - YOUR EXISTING CODE
  const addScheduleBtn = document.getElementById('addScheduleBtn');
  if (addScheduleBtn) {
    addScheduleBtn.addEventListener('click', () => {
      console.log('Adding new schedule');
      showBootstrapModal('schedule');
    });
  }

  // Recent Reports Actions - YOUR EXISTING CODE
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

  // View All Reports History - YOUR EXISTING CODE
  const viewAllReports = document.getElementById('viewAllReports');
  if (viewAllReports) {
    viewAllReports.addEventListener('click', () => {
      console.log('Viewing all report history');
      showBootstrapAlert('Opening Complete Report History...', 'info');
    });
  }

  // FRAMEWORK FUNCTIONS

  function initCharts() {
    // Engagement Line Chart
    const engagementCtx = document.getElementById('engagementChart');
    if (engagementCtx) {
      new Chart(engagementCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [{
            label: 'Active Users',
            data: [6500, 7200, 8000, 7800, 8500, 8200, 8742],
            borderColor: '#297a79',
            backgroundColor: 'rgba(41, 122, 121, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 6000
            }
          }
        }
      });
    }

    // Category Doughnut Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
      new Chart(categoryCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History'],
          datasets: [{
            data: [30, 25, 15, 20, 10],
            backgroundColor: [
              '#297a79',
              '#34b4a9',
              '#5cd6cd',
              '#8ae3dc',
              '#b8f0eb'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          cutout: '60%'
        }
      });
    }
  }

  function showBootstrapModal(type) {
    const modalElement = document.getElementById('reportModal');
    const modalTitle = document.getElementById('reportModalTitle');
    
    if (type === 'generate') {
      modalTitle.textContent = 'Generate Report';
      document.getElementById('confirmGenerate').textContent = 'Generate Report';
    } else {
      modalTitle.textContent = 'Schedule Report';
      document.getElementById('confirmGenerate').textContent = 'Schedule Report';
    }
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  function showBootstrapAlert(message, type = 'info') {
    // Create and show Bootstrap alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.nr-main').insertBefore(alertDiv, document.querySelector('.nr-main').firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }

  // Modal confirmation
  const confirmGenerate = document.getElementById('confirmGenerate');
  if (confirmGenerate) {
    confirmGenerate.addEventListener('click', () => {
      const reportType = document.getElementById('reportTypeSelect').value;
      const format = document.querySelector('input[name="format"]:checked').value;
      
      generateReportWithFramework(reportType, format);
    });
  }

  function generateReportWithFramework(reportType, format) {
    const reportName = getReportName(reportType);
    
    // Show loading state
    const generateBtn = document.getElementById('confirmGenerate');
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Generating...';
    generateBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      // Hide modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
      modal.hide();
      
      // Reset button
      generateBtn.innerHTML = originalText;
      generateBtn.disabled = false;
      
      // Show success message
      showBootstrapAlert(`Successfully generated ${reportName} report in ${format.toUpperCase()} format`, 'success');
      
      // Add to recent reports
      addRecentReport(reportType, 'success');
      
    }, 2000);
  }

  // YOUR EXISTING HELPER FUNCTIONS - KEEP ALL OF THESE
  function setDefaultDates() {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    document.getElementById('startDate').value = oneWeekAgo.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
  }

  function applyDateRange(days) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    console.log(`Loading data for last ${days} days`);
    loadReportsData(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
  }

  function loadReportsData(startDate, endDate) {
    console.log('Loading reports data from', startDate, 'to', endDate);
    // Simulate API call
    setTimeout(() => {
      updateMetrics();
      console.log('Reports data loaded successfully');
    }, 1000);
  }

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
        metric.textContent = newValue.toLocaleString();
      }
    });
  }

  function viewReport(reportType) {
    console.log(`Viewing ${reportType} report`);
    showBootstrapAlert(`Opening ${getReportName(reportType)} report viewer...`, 'info');
  }

  function downloadReport(reportType) {
    console.log(`Downloading ${reportType} report`);
    
    // Simulate download process
    const downloadBtn = event.target.closest('.nr-report-action');
    const originalHTML = downloadBtn.innerHTML;
    
    // ENHANCED: Use Bootstrap spinner
    downloadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
    downloadBtn.disabled = true;
    
    setTimeout(() => {
      showBootstrapAlert(`Downloading ${getReportName(reportType)} report...`, 'success');
      downloadBtn.innerHTML = originalHTML;
      downloadBtn.disabled = false;
      addRecentReport(reportType, 'success');
    }, 2000);
  }

  function scheduleReport(reportType) {
    console.log(`Scheduling ${reportType} report`);
    showBootstrapModal('schedule');
  }

  function createCustomReport() {
    console.log('Opening custom report builder');
    showBootstrapAlert('Opening Custom Report Builder...', 'info');
  }

  function showReportTemplates() {
    console.log('Showing report templates');
    showBootstrapAlert('Opening Report Templates Gallery...', 'info');
  }

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

  // Schedule Management Functions - YOUR EXISTING CODE
  function editSchedule(title) {
    console.log(`Editing schedule: ${title}`);
    showBootstrapAlert(`Editing schedule: ${title}`, 'info');
  }

  function pauseSchedule(title, item) {
    console.log(`Pausing schedule: ${title}`);
    const status = item.querySelector('.nr-scheduled-status');
    status.textContent = 'Paused';
    status.className = 'nr-scheduled-status paused';
    showBootstrapAlert(`Schedule "${title}" has been paused`, 'warning');
  }

  function resumeSchedule(title, item) {
    console.log(`Resuming schedule: ${title}`);
    const status = item.querySelector('.nr-scheduled-status');
    status.textContent = 'Active';
    status.className = 'nr-scheduled-status active';
    showBootstrapAlert(`Schedule "${title}" has been resumed`, 'success');
  }

  function deleteSchedule(title, item) {
    if (confirm(`Are you sure you want to delete the schedule "${title}"?`)) {
      console.log(`Deleting schedule: ${title}`);
      item.style.opacity = '0.5';
      setTimeout(() => item.remove(), 300);
      showBootstrapAlert(`Schedule "${title}" has been deleted`, 'info');
    }
  }

  function downloadRecentReport(title) {
    console.log(`Downloading recent report: ${title}`);
    showBootstrapAlert(`Downloading ${title}...`, 'info');
  }

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

  // Initialize
  setDefaultDates();
  applyDateRange(7);
});