document.addEventListener('DOMContentLoaded', () => {
  const userProfile = document.getElementById('userProfile');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  // Dropdown menu functionality
  userProfile.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('active');
    userProfile.classList.toggle('dropdown-active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    userDropdown.classList.remove('active');
    userProfile.classList.remove('dropdown-active');
  });

  // Logout functionality
  logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      alert('Logging out...');
      // Add your logout logic here
      // window.location.href = 'login.html';
    }
  });

  // Close dropdown when clicking on dropdown items
  userDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Update current time for activity items
  function updateActivityTimes() {
    const times = document.querySelectorAll('.nr-activity-time');
    times.forEach(time => {
      const text = time.textContent;
      if (text.includes('minutes ago') || text.includes('hour ago') || text.includes('hours ago')) {
        // In a real app, you would calculate actual times
        // This is just for demonstration
      }
    });
  }
  
  updateActivityTimes();
});