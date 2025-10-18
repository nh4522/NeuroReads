
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

  // Table row click functionality (for demonstration)
  const tableRows = document.querySelectorAll('.nr-books-table tbody tr');
  tableRows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (!e.target.closest('.nr-action-buttons')) {
        const bookTitle = row.querySelector('.nr-book-title').textContent;
        console.log(`Viewing details for: ${bookTitle}`);
        // In real implementation, you would open a modal or navigate to details page
      }
    });
  });
});
