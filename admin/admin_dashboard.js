// admin_dashboard.js - UPDATED with Chart.js integration
document.addEventListener('DOMContentLoaded', () => {
  // Only dashboard-specific functionality here
  // NO DROPDOWN CODE - that's in admin_common.js

  // Initialize Charts
  initializeCharts();

  // Generate Report Button
  const generateReportBtn = document.getElementById('generateReportBtn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      console.log('Generate Report clicked');
      showToast('Generating dashboard report...', 'success');
      // Add report generation logic here
    });
  }

  // Export Data Button
  const exportDataBtn = document.getElementById('exportDataBtn');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      console.log('Export Data clicked');
      showToast('Exporting dashboard data...', 'info');
      // Add export logic here
    });
  }

  // Chart period switching
  const chartButtons = document.querySelectorAll('.nr-chart-btn');
  chartButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      chartButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      console.log('Chart period changed to:', this.textContent);
      updateChartData(this.textContent.toLowerCase());
    });
  });

  // View All Activity
  const viewAllBtn = document.querySelector('.nr-dashboard-btn.btn-outline-primary');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      console.log('View All Activity clicked');
      showToast('Loading all activity...', 'info');
    });
  }

  function initializeCharts() {
    // Reading Activity Chart
    const readingCtx = document.getElementById('readingActivityChart').getContext('2d');
    window.readingActivityChart = new Chart(readingCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Books Read',
          data: [120, 150, 180, 90, 200, 160, 210],
          borderColor: '#2C8685',
          backgroundColor: 'rgba(44, 134, 133, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    // User Distribution Chart
    const userCtx = document.getElementById('userDistributionChart').getContext('2d');
    window.userDistributionChart = new Chart(userCtx, {
      type: 'doughnut',
      data: {
        labels: ['Students', 'Teachers', 'Researchers', 'General'],
        datasets: [{
          data: [45, 25, 15, 15],
          backgroundColor: [
            '#4CAF50',
            '#2196F3',
            '#FF9800',
            '#9C27B0'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        },
        cutout: '60%'
      }
    });
  }

  function updateChartData(period) {
    // Simulate data update based on period
    let newData;
    if (period === 'week') {
      newData = [120, 150, 180, 90, 200, 160, 210];
    } else if (period === 'month') {
      newData = [850, 920, 780, 1100, 950, 1200, 890, 1000, 1150, 980, 1300, 1400];
      window.readingActivityChart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    } else if (period === 'year') {
      newData = [4500, 5200, 4800, 5100, 5900, 6300, 5800, 6200, 6800, 7200, 7500, 8000];
      window.readingActivityChart.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
    
    window.readingActivityChart.data.datasets[0].data = newData;
    window.readingActivityChart.update();
  }

  function showToast(message, type = 'info') {
    // Create Bootstrap toast notification
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
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
      toastContainer.remove();
    });
  }

  // Update current time for activity items
  function updateActivityTimes() {
    const times = document.querySelectorAll('.nr-activity-time');
    times.forEach(time => {
      const text = time.textContent;
      if (text.includes('minutes ago') || text.includes('hour ago') || text.includes('hours ago')) {
        // In a real app, you would calculate actual times
        console.log('Updating activity times for dashboard');
      }
    });
  }
  
  updateActivityTimes();
});