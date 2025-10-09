// simple client-side preview + save to localStorage demo
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const saveBtn = document.getElementById('saveBtn');

  // load saved values
  const savedAvatar = localStorage.getItem('nr_avatar');
  const savedName = localStorage.getItem('nr_name');
  const savedEmail = localStorage.getItem('nr_email');

  if (savedAvatar) avatarPreview.src = savedAvatar;
  if (savedName) nameInput.value = savedName;
  if (savedEmail) emailInput.value = savedEmail;

  // file chooser triggered by label
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.src = reader.result;
      localStorage.setItem('nr_avatar', reader.result);
    };
    reader.readAsDataURL(file);
  });

  // save button stores fields (demo)
  saveBtn.addEventListener('click', () => {
    localStorage.setItem('nr_name', nameInput.value.trim());
    localStorage.setItem('nr_email', emailInput.value.trim());

    // simple visual feedback
    saveBtn.textContent = 'saved ✓';
    saveBtn.style.background = '#b8860b';
    setTimeout(() => {
      saveBtn.textContent = 'save';
      saveBtn.style.background = '';
    }, 1200);
  });
});
