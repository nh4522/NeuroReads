
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const saveBtn = document.getElementById('saveBtn');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');

  // ==========================
  // Profile Functionality
  // ==========================
  
  // Load saved data from localStorage
  const img = localStorage.getItem('nr_demo_avatar');
  if (img) avatarPreview.src = img;
  const n = localStorage.getItem('nr_demo_name');
  if (n) nameInput.value = n;
  const e = localStorage.getItem('nr_demo_email');
  if (e) emailInput.value = e;

  // File input change
  fileInput.addEventListener('change', (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.src = reader.result;
      localStorage.setItem('nr_demo_avatar', reader.result);
    };
    reader.readAsDataURL(f);
  });

  // Save button click
  saveBtn.addEventListener('click', () => {
    localStorage.setItem('nr_demo_name', nameInput.value.trim());
    localStorage.setItem('nr_demo_email', emailInput.value.trim());
    saveBtn.textContent = 'saved ✓';
    setTimeout(() => saveBtn.textContent = 'save', 1200);
  });

  // ==========================
  // Dropdown Menu Functionality
  // ==========================
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
});
