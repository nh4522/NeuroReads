// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {

  // ==========================
  // Redirect Buttons (main page)
  // ==========================
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }

  // ==========================
  // Toggle Password Visibility (auth pages)
  // ==========================
  const toggleIcons = document.querySelectorAll('.toggle-password');
  toggleIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const target = document.getElementById(icon.dataset.target);
      if (target) {
        if (target.type === 'password') {
          target.type = 'text';
          icon.textContent = '🙈';
        } else {
          target.type = 'password';
          icon.textContent = '👁️';
        }
      }
    });
  });

});
