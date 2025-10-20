// profile.js - ENHANCED PROFILE FUNCTIONALITY

document.addEventListener('DOMContentLoaded', () => {
  initializeEnhancedProfile();
});

function initializeEnhancedProfile() {
  loadProfileData();
  setupEnhancedEventListeners();
  initializeGenreSelection();
}

function loadProfileData() {
  // Load from localStorage or API
  const profileData = JSON.parse(localStorage.getItem('neuroreads_profile')) || {
    firstName: "User",
    lastName: "XYZ",
    username: "username",
    email: "user@example.com",
    bio: "Avid reader who loves fantasy and science fiction. Currently exploring classic literature!",
    avatar: "../icons/avatar-placeholder.png",
    readingGoal: "24 books",
    genres: ["Fantasy", "Science Fiction", "Mystery", "Classics"],
    notifications: true,
    publicProfile: true
  };

  // Populate form fields
  document.getElementById('firstName').value = profileData.firstName;
  document.getElementById('lastName').value = profileData.lastName;
  document.getElementById('username').value = profileData.username;
  document.getElementById('email').value = profileData.email;
  document.getElementById('bio').value = profileData.bio;
  document.getElementById('readingGoal').value = profileData.readingGoal;
  document.getElementById('emailNotifications').checked = profileData.notifications;
  document.getElementById('publicProfile').checked = profileData.publicProfile;
  
  // Update display name
  document.getElementById('userDisplayName').textContent = 
    `${profileData.firstName} ${profileData.lastName}`;
  
  // Update avatar
  document.getElementById('avatarPreview').src = profileData.avatar;
}

function setupEnhancedEventListeners() {
  // Avatar upload
  const fileInput = document.getElementById('fileInput');
  const avatarPreview = document.getElementById('avatarPreview');
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview.src = e.target.result;
        saveProfileChange('avatar', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Real-time form saving
  const form = document.getElementById('profileForm');
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const field = e.target.id;
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      saveProfileChange(field, value);
      
      // Update display name in real-time
      if (field === 'firstName' || field === 'lastName') {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        document.getElementById('userDisplayName').textContent = `${firstName} ${lastName}`;
      }
    });
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveAllChanges();
    showNotification('Profile updated successfully!', 'success');
  });

  // Password validation
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  
  confirmPassword.addEventListener('input', () => {
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity('Passwords do not match');
    } else {
      confirmPassword.setCustomValidity('');
    }
  });
}

function initializeGenreSelection() {
  const genreTags = document.querySelectorAll('.genre-tag:not(:last-child)');
  
  genreTags.forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('active');
      
      // Update genres array
      const activeGenres = Array.from(document.querySelectorAll('.genre-tag.active:not(:last-child)'))
        .map(tag => tag.textContent);
      
      saveProfileChange('genres', activeGenres);
    });
  });

  // Add new genre
  const addGenreBtn = document.querySelector('.genre-tag:last-child');
  addGenreBtn.addEventListener('click', () => {
    const newGenre = prompt('Enter a new genre:');
    if (newGenre && newGenre.trim()) {
      const genreTagsContainer = document.querySelector('.genre-tags');
      const newTag = document.createElement('span');
      newTag.className = 'genre-tag active';
      newTag.textContent = newGenre.trim();
      
      // Add click event to new tag
      newTag.addEventListener('click', function() {
        this.classList.toggle('active');
      });
      
      genreTagsContainer.insertBefore(newTag, addGenreBtn);
      showNotification(`Added ${newGenre} to your genres`, 'success');
    }
  });
}

function saveProfileChange(field, value) {
  const profileData = JSON.parse(localStorage.getItem('neuroreads_profile')) || {};
  profileData[field] = value;
  localStorage.setItem('neuroreads_profile', JSON.stringify(profileData));
}

function saveAllChanges() {
  const formData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    bio: document.getElementById('bio').value,
    readingGoal: document.getElementById('readingGoal').value,
    notifications: document.getElementById('emailNotifications').checked,
    publicProfile: document.getElementById('publicProfile').checked
  };
  
  localStorage.setItem('neuroreads_profile', JSON.stringify(formData));
}

function showNotification(message, type = 'info') {
  // Use your existing notification system
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
  } else {
    alert(message); // Fallback
  }
}