// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {

  // ==========================
  // Redirect Buttons (main page) - FIXED FOR DJANGO
  // ==========================
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/login/";  // Django URL
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/register/";  // Django URL
    });
  }

  // ==========================
  // Login Form Handler
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
      const formData = new FormData(form);
      
      const response = await fetch('/login/', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = data.redirect_url || '/user-home/';
        }, 1500);
      } else {
        showError(data.message || 'Login failed');
      }
      
    } catch (error) {
      console.log('AJAX failed, submitting form normally');
      form.submit();
    } finally {
      setLoadingState(false, submitBtn, btnText, btnLoading);
    }
  }

  // ==========================
  // Registration Form Handler - UPDATED WITH USERNAME
  // ==========================
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
    
    // Password confirmation validation
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput && confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch();
      });
      
      passwordInput.addEventListener('input', function() {
        validatePasswordMatch();
        updateRegisterPasswordStrength();
      });
    }
  }

  // ==========================
  // Username Validation - REAL-TIME FIXED
  // ==========================
  const usernameInput = document.getElementById('username');
  if (usernameInput) {
    console.log("✅ Username input found, setting up validation...");
    
    let usernameTimeout;
    
    usernameInput.addEventListener('input', function() {
      const username = this.value.trim();
      const feedback = document.getElementById('usernameFeedback');
      
      console.log(`🔍 Username input: "${username}"`);
      
      // Clear previous timeout
      clearTimeout(usernameTimeout);
      
      // Hide feedback for empty inputs
      if (username.length === 0) {
        feedback.style.display = 'none';
        usernameInput.classList.remove('valid', 'invalid');
        return;
      }
      
      // Validate username format first
      if (!isValidUsername(username)) {
        console.log("❌ Invalid username format");
        showUsernameFeedback('Username can only contain letters, numbers, and underscores', 'error');
        usernameInput.classList.add('invalid');
        usernameInput.classList.remove('valid');
        return;
      }
      
      // Validate length
      if (username.length < 3) {
        console.log("❌ Username too short");
        showUsernameFeedback('Username must be at least 3 characters long', 'error');
        usernameInput.classList.add('invalid');
        usernameInput.classList.remove('valid');
        return;
      }
      
      if (username.length > 20) {
        console.log("❌ Username too long");
        showUsernameFeedback('Username must be less than 20 characters', 'error');
        usernameInput.classList.add('invalid');
        usernameInput.classList.remove('valid');
        return;
      }
      
      // Show loading state
      console.log("⏳ Checking username availability...");
      showUsernameFeedback('Checking availability...', 'loading');
      usernameInput.classList.remove('valid', 'invalid');
      
      // Debounce API call
      usernameTimeout = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500);
    });
    
    // Validate on blur as well
    usernameInput.addEventListener('blur', function() {
      const username = this.value.trim();
      if (username.length >= 3 && isValidUsername(username)) {
        checkUsernameAvailability(username);
      }
    });
  }

  // ==========================
  // Registration Handler - UPDATED WITH USERNAME VALIDATION
  // ==========================
  async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    const submitBtn = form.querySelector('.btn-primary');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Clear previous errors
    hideError();
    
    // Basic validation
    if (!fullName || !username || !email || !password || !confirmPassword) {
      showError('Please fill in all fields');
      return;
    }
    
    // Username validation
    if (!isValidUsername(username)) {
      showError('Username can only contain letters, numbers, and underscores');
      return;
    }
    
    if (username.length < 3) {
      showError('Username must be at least 3 characters long');
      return;
    }
    
    if (username.length > 20) {
      showError('Username must be less than 20 characters');
      return;
    }
    
    // Check if username input shows as invalid (already taken)
    const usernameInput = document.getElementById('username');
    if (usernameInput.classList.contains('invalid')) {
      showError('Username is already taken. Please choose another one.');
      return;
    }
    
    // If username input is not validated yet, check it now
    if (!usernameInput.classList.contains('valid')) {
      try {
        console.log("🔍 Final username check before submission...");
        const usernameCheckResponse = await fetch('/api/check-username/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
          },
          body: JSON.stringify({ username: username })
        });
        
        if (!usernameCheckResponse.ok) {
          throw new Error('Username check failed');
        }
        
        const usernameData = await usernameCheckResponse.json();
        
        if (!usernameData.available) {
          showError('Username is already taken. Please choose another one.');
          return;
        }
      } catch (error) {
        console.error('Error in final username check:', error);
        showError('Error validating username. Please try again.');
        return;
      }
    }
    
    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }
    
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      showError('Password must be at least 8 characters long');
      return;
    }
    
    if (!agreeTerms) {
      showError('Please agree to the Terms & Conditions');
      return;
    }
    
    // Show loading state
    setLoadingState(true, submitBtn, btnText, btnLoading);
    
    try {
      const formData = new FormData(form);
      
      const response = await fetch('/register/', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = data.redirect_url || '/login/';
        }, 1500);
      } else {
        showError(data.message || 'Registration failed');
      }
      
    } catch (error) {
      console.log('AJAX failed, submitting form normally');
      form.submit();
    } finally {
      setLoadingState(false, submitBtn, btnText, btnLoading);
    }
  }

  function validatePasswordMatch() {
    const password = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const errorDiv = document.querySelector('.error-message');
    
    if (!password || !confirmPassword) return;
    
    if (confirmPassword.value && password.value !== confirmPassword.value) {
      confirmPassword.style.borderColor = '#ff6b6b';
      if (errorDiv && (!errorDiv.style.display || errorDiv.style.display === 'none')) {
        showError('Passwords do not match');
      }
    } else {
      confirmPassword.style.borderColor = '';
      if (errorDiv && errorDiv.textContent === 'Passwords do not match') {
        hideError();
      }
    }
  }

  // ==========================
  // Contact Form Handler
  // ==========================
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }

  async function handleContactForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.btn-send-message');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Show loading state
    setLoadingState(true, submitBtn, btnText, btnLoader);
    
    try {
      const formData = new FormData(form);
      
      const response = await fetch('/contact/', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Message sent successfully! We\'ll get back to you soon.');
        form.reset();
      } else {
        showError(data.message || 'Failed to send message');
      }
      
    } catch (error) {
      console.log('AJAX failed, submitting form normally');
      form.submit();
    } finally {
      setLoadingState(false, submitBtn, btnText, btnLoader);
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
      errorDiv.className = 'error-message';
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
      if (loadingText) loadingText.style.display = 'inline';
    } else {
      button.disabled = false;
      text.style.display = 'inline';
      if (loadingText) loadingText.style.display = 'none';
    }
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
    console.log(`Social login with ${provider}`);
    showError(`${provider} login integration would go here`);
  }

  // ==========================
  // Password Strength Indicators
  // ==========================
  const loginPasswordInput = document.getElementById('loginPassword');
  if (loginPasswordInput) {
    loginPasswordInput.addEventListener('input', updateLoginPasswordStrength);
  }

  const registerPasswordInput = document.getElementById('registerPassword');
  if (registerPasswordInput) {
    registerPasswordInput.addEventListener('input', updateRegisterPasswordStrength);
  }

  function updateLoginPasswordStrength() {
    const password = loginPasswordInput.value;
    const strengthBar = document.querySelector('.strength-bar');
    
    if (!strengthBar) return;
    
    let strength = calculatePasswordStrength(password);
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

  function updateRegisterPasswordStrength() {
    const password = registerPasswordInput.value;
    const strengthBar = document.querySelector('.strength-bar');
    
    if (!strengthBar) return;
    
    let strength = calculatePasswordStrength(password);
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

  function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Number check
    if (/[0-9]/.test(password)) strength += 25;
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return strength;
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

  // ==========================
  // Navigation Active State
  // ==========================
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar nav a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '/' && href === '/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Initialize active nav link
  setActiveNavLink();

});

// ==========================
// Forgot Password Handler
// ==========================
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = document.getElementById('resetEmail').value;
    const submitBtn = form.querySelector('.btn-send-reset');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Clear previous messages
    hideError();
    hideSuccess();
    
    // Basic validation
    if (!email) {
        showError('Please enter your email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    setLoadingState(true, submitBtn, btnText, btnLoading);
    
    try {
        const formData = new FormData(form);
        
        const response = await fetch('/forgot-password/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(data.message);
            form.reset();
        } else {
            showError(data.message);
        }
        
    } catch (error) {
        console.log('AJAX failed, submitting form normally');
        form.submit();
    } finally {
        setLoadingState(false, submitBtn, btnText, btnLoading);
    }
}

function hideSuccess() {
    const successDiv = document.querySelector('.success-message');
    if (successDiv) {
        successDiv.style.display = 'none';
    }
}

// ==========================
// Username Validation Functions
// ==========================
function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
}

async function checkUsernameAvailability(username) {
  const feedback = document.getElementById('usernameFeedback');
  const usernameInput = document.getElementById('username');
  
  console.log(`🔍 Checking username: "${username}"`);
  
  try {
    const response = await fetch('/api/check-username/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      body: JSON.stringify({ username: username })
    });
    
    console.log(`📡 API Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 API Response:`, data);
    
    if (data.available) {
      console.log("✅ Username is available");
      showUsernameFeedback('✓ Username is available', 'success');
      usernameInput.classList.add('valid');
      usernameInput.classList.remove('invalid');
    } else {
      console.log("❌ Username is taken");
      showUsernameFeedback('✗ Username is already taken', 'error');
      usernameInput.classList.add('invalid');
      usernameInput.classList.remove('valid');
    }
    
  } catch (error) {
    console.error('❌ Error checking username:', error);
    showUsernameFeedback('Error checking username availability', 'error');
    usernameInput.classList.add('invalid');
    usernameInput.classList.remove('valid');
  }
}

function showUsernameFeedback(message, type) {
  const feedback = document.getElementById('usernameFeedback');
  if (!feedback) {
    console.error("❌ Username feedback element not found!");
    return;
  }
  
  console.log(`💬 Username feedback: ${message} (${type})`);
  
  feedback.textContent = message;
  feedback.style.display = 'block';
  
  // Remove existing classes
  feedback.className = 'username-feedback';
  
  // Add type-specific class
  switch(type) {
    case 'success':
      feedback.classList.add('success');
      break;
    case 'error':
      feedback.classList.add('error');
      break;
    case 'loading':
      feedback.classList.add('loading');
      break;
  }
}

// Utility function to get CSRF token
function getCSRFToken() {
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
  return csrfToken ? csrfToken.value : '';
}

// ==========================
// Debug Functions
// ==========================
// Test the username API endpoint manually
async function testUsernameAPI() {
  const testUsername = "testuser";
  console.log(`🧪 Testing username API with: ${testUsername}`);
  
  try {
    const response = await fetch('/api/check-username/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      body: JSON.stringify({ username: testUsername })
    });
    
    const data = await response.json();
    console.log('🧪 Test result:', data);
    return data;
  } catch (error) {
    console.error('🧪 Test failed:', error);
  }
}

// Check if username feedback element exists
function checkUsernameElements() {
  const usernameInput = document.getElementById('username');
  const feedback = document.getElementById('usernameFeedback');
  
  console.log('🔍 Checking username elements:');
  console.log('Username input:', usernameInput);
  console.log('Feedback element:', feedback);
  
  return {
    usernameInput: !!usernameInput,
    feedback: !!feedback
  };
}

// Run debug checks when page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('🚀 Page loaded - username validation ready');
    checkUsernameElements();
  }, 1000);
});

// Contact Form Handler - Enhanced with AJAX
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
}

async function handleContactForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.btn-send-message');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Show loading state
    setLoadingState(true, submitBtn, btnText, btnLoader);
    
    try {
        // Convert FormData to JSON
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        const response = await fetch('/api/contact/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(formObject)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(data.message || 'Message sent successfully! We\'ll get back to you soon.');
            form.reset();
        } else {
            showError(data.error || data.message || 'Failed to send message');
        }
        
    } catch (error) {
        console.error('Contact form error:', error);
        showError('Network error. Please try again.');
        
        // Fallback: submit form normally
        console.log('AJAX failed, submitting form normally');
        form.submit();
    } finally {
        setLoadingState(false, submitBtn, btnText, btnLoader);
    }
}

// Utility function to get CSRF token
function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfToken ? csrfToken.value : '';
}

