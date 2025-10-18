// admin_profile.js - ONLY PROFILE-SPECIFIC FUNCTIONALITY
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const saveBtn = document.getElementById('saveBtn');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');

  // Only run if we're on a profile page (check for profile-specific elements)
  if (!fileInput || !avatarPreview || !saveBtn) {
    return; // Exit if not on profile page
  }

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
});