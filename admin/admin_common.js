// admin_common.js - ONLY COMMON FUNCTIONALITY
document.addEventListener('DOMContentLoaded', () => {
  const userProfile = document.getElementById('userProfile');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  // Only initialize if elements exist
  if (userProfile && userDropdown) {
    // Dropdown menu functionality
    userProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
      userProfile.classList.toggle('dropdown-active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userProfile.contains(e.target)) {
        userDropdown.classList.remove('active');
        userProfile.classList.remove('dropdown-active');
      }
    });

    // Close dropdown when clicking on dropdown items
    userDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        alert('Logging out...');
        // Add your logout logic here
        // window.location.href = 'login.html';
      }
    });
  }

  // Notification button functionality
  const notificationBtn = document.querySelector('.nr-notification-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      alert('Notifications would appear here');
    });
  }
});