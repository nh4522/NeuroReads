// admin_dashboard.js - UPDATED
document.addEventListener('DOMContentLoaded', () => {
  // Only dashboard-specific functionality here
  // NO DROPDOWN CODE - that's in admin_common.js

  // Generate Report Button
  const generateReportBtn = document.getElementById('generateReportBtn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      console.log('Generate Report clicked');
      alert('Generating dashboard report...');
      // Add report generation logic here
    });
  }

  // Export Data Button
  const exportDataBtn = document.getElementById('exportDataBtn');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      console.log('Export Data clicked');
      alert('Exporting dashboard data...');
      // Add export logic here
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

  // Chart period switching
  const chartButtons = document.querySelectorAll('.nr-chart-btn');
  chartButtons.forEach(button => {
    button.addEventListener('click', () => {
      console.log('Chart period changed to:', button.textContent);
      // Add chart update logic here
    });
  });

  // View All Activity
  const viewAllBtn = document.querySelector('.nr-dashboard-btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      console.log('View All Activity clicked');
      alert('Showing all activity...');
    });
  }
});