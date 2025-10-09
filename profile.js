
/* small demo JS: file preview + localStorage (optional) */
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const saveBtn = document.getElementById('saveBtn');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');

  // load saved
  const img = localStorage.getItem('nr_demo_avatar');
  if (img) avatarPreview.src = img;
  const n = localStorage.getItem('nr_demo_name');
  if (n) nameInput.value = n;
  const e = localStorage.getItem('nr_demo_email');
  if (e) emailInput.value = e;

  fileInput.addEventListener('change', (ev)=>{
    const f = ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      avatarPreview.src = r.result;
      localStorage.setItem('nr_demo_avatar', r.result);
    };
    r.readAsDataURL(f);
  });

  saveBtn.addEventListener('click', ()=>{
    localStorage.setItem('nr_demo_name', nameInput.value.trim());
    localStorage.setItem('nr_demo_email', emailInput.value.trim());
    saveBtn.textContent = 'saved ✓';
    setTimeout(()=> saveBtn.textContent = 'save',1200);
  });
});

