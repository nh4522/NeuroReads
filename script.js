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
// Form Validation & Submission
// ==========================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  
  const form = e.target;
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe')?.checked;
  const submitBtn = form.querySelector('.btn-primary');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const errorDiv = document.querySelector('.error-message');
  
  // Clear previous errors
  hideError();
  
  // Basic validation
  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }
  
  // Show loading state
  setLoadingState(true, submitBtn, btnText, btnLoading);
  
  try {
    // Simulate API call - replace with actual authentication
    await simulateLogin(email, password, rememberMe);
    
    // On success - redirect to dashboard or home page
    showSuccess('Login successful! Redirecting...');
    setTimeout(() => {
      window.location.href = 'dashboard.html'; // Change to your actual destination
    }, 1500);
    
  } catch (error) {
    showError(error.message);
  } finally {
    setLoadingState(false, submitBtn, btnText, btnLoading);
  }
}

// ==========================
// Utility Functions
// ==========================
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showError(message) {
  const errorDiv = document.querySelector('.error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

function hideError() {
  const errorDiv = document.querySelector('.error-message');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

function showSuccess(message) {
  const errorDiv = document.querySelector('.error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.classList.add('success-message');
    errorDiv.classList.remove('error-message');
  }
}

function setLoadingState(loading, button, text, loadingText) {
  if (loading) {
    button.disabled = true;
    text.style.display = 'none';
    loadingText.style.display = 'inline';
  } else {
    button.disabled = false;
    text.style.display = 'inline';
    loadingText.style.display = 'none';
  }
}

// Simulate login API call
async function simulateLogin(email, password, rememberMe) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful login for demo
      // In real implementation, you would make a fetch request to your backend
      if (email && password) {
        resolve({ success: true });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1500);
  });
}

// ==========================
// Social Login Handlers
// ==========================
document.querySelectorAll('.social-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    const provider = e.target.closest('.social-btn').classList[1].replace('-btn', '');
    handleSocialLogin(provider);
  });
});

function handleSocialLogin(provider) {
  // Implement social login logic here
  console.log(`Social login with ${provider}`);
  showError(`${provider} login integration would go here`);
}

// ==========================
// Password Strength Indicator
// ==========================
const passwordInput = document.getElementById('loginPassword');
if (passwordInput) {
  passwordInput.addEventListener('input', updatePasswordStrength);
}

function updatePasswordStrength() {
  const password = passwordInput.value;
  const strengthBar = document.querySelector('.strength-bar');
  
  if (!strengthBar) return;
  
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;
  
  strengthBar.style.width = `${strength}%`;
  
  // Update color based on strength
  if (strength < 50) {
    strengthBar.style.backgroundColor = '#ff6b6b';
  } else if (strength < 75) {
    strengthBar.style.backgroundColor = '#ffd93d';
  } else {
    strengthBar.style.backgroundColor = '#51cf66';
  }
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
