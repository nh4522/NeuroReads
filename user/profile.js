// profile.js - ENHANCED AVATAR PERSISTENCE & PROFILE MANAGEMENT

document.addEventListener('DOMContentLoaded', () => {
  // Profile page specific: Make logo clickable
  const logoContainer = document.querySelector('.nr-logo-container');
  if (logoContainer) {
    logoContainer.style.cursor = 'pointer';
    logoContainer.addEventListener('click', () => {
      window.location.href = 'home.html';
    });
  }
  
  // Initialize enhanced profile system
  initializeEnhancedProfile();
});

// Configuration
const PROFILE_CONFIG = {
  defaultAvatar: "../icons/avatar-placeholder.png",
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  autoSaveDelay: 1000, // 1 second
  backupInterval: 30000 // 30 seconds
};

// State management
let profileState = {
  isSaving: false,
  hasUnsavedChanges: false,
  lastBackup: null,
  autoSaveTimeout: null
};

function initializeEnhancedProfile() {
  loadProfileData();
  setupEnhancedEventListeners();
  initializeGenreSelection();
  setupAutoSave();
  initializeImageOptimization();
  startBackupService();
}

function loadProfileData() {
  // Try to load from backup first if main data is corrupted
  let profileData = JSON.parse(localStorage.getItem('neuroreads_profile')) || 
                   JSON.parse(localStorage.getItem('neuroreads_profile_backup')) || 
                   getDefaultProfileData();

  console.log('Loading profile data:', profileData);

  // Validate and sanitize profile data
  profileData = validateProfileData(profileData);

  // Populate form fields
  populateFormFields(profileData);
  
  // Update display name and avatar
  updateDisplayInfo(profileData);
  
  // Initialize genre tags
  initializeGenreTags(profileData.genres);

  // Create initial backup
  createBackup(profileData);
}

function getDefaultProfileData() {
  return {
    firstName: "User",
    lastName: "XYZ", 
    username: "booklover123",
    email: "user@example.com",
    bio: "Avid reader who loves fantasy and science fiction. Currently exploring classic literature!",
    avatar: PROFILE_CONFIG.defaultAvatar,
    readingGoal: "24 books",
    genres: ["Fantasy", "Science Fiction", "Mystery", "Classics"],
    notifications: true,
    publicProfile: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
}

function validateProfileData(data) {
  const defaults = getDefaultProfileData();
  
  // Ensure all required fields exist
  const validated = { ...defaults, ...data };
  
  // Validate avatar URL
  if (!validated.avatar || !isValidImageSource(validated.avatar)) {
    validated.avatar = PROFILE_CONFIG.defaultAvatar;
  }
  
  // Validate genres array
  if (!Array.isArray(validated.genres)) {
    validated.genres = defaults.genres;
  }
  
  // Update timestamp
  validated.lastUpdated = new Date().toISOString();
  
  return validated;
}

function isValidImageSource(src) {
  return src.startsWith('data:image/') || 
         src.includes('../icons/') || 
         src.startsWith('blob:') ||
         /\.(jpg|jpeg|png|gif|webp)$/i.test(src);
}

function populateFormFields(profileData) {
  const fields = {
    'firstName': profileData.firstName,
    'lastName': profileData.lastName,
    'username': profileData.username,
    'email': profileData.email,
    'bio': profileData.bio,
    'readingGoal': profileData.readingGoal
  };

  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.value = value;
  });

  // Checkboxes
  const emailNotifications = document.getElementById('emailNotifications');
  const publicProfile = document.getElementById('publicProfile');
  if (emailNotifications) emailNotifications.checked = profileData.notifications;
  if (publicProfile) publicProfile.checked = profileData.publicProfile;
}

function updateDisplayInfo(profileData) {
  console.log('Updating display with:', profileData);

  // Update display name
  const displayNameElement = document.getElementById('userDisplayName');
  if (displayNameElement) {
    displayNameElement.textContent = `${profileData.firstName} ${profileData.lastName}`;
  }

  // Update username in profile card
  const usernameElement = document.querySelector('.avatar-section p.text-muted');
  if (usernameElement) {
    usernameElement.textContent = `@${profileData.username}`;
  }
  
  // Update avatar - ENHANCED VERSION
  updateAvatarDisplay(profileData.avatar);
  
  // Update username in topbar
  const topbarUsername = document.querySelector('.nr-username');
  if (topbarUsername && profileData.firstName && profileData.lastName) {
    topbarUsername.textContent = `${profileData.firstName} ${profileData.lastName}`;
  }

  // Update reading stats if elements exist
  updateReadingStats(profileData);
}

function updateAvatarDisplay(avatarSource) {
  const avatarPreview = document.getElementById('avatarPreview');
  if (!avatarPreview) return;

  // Show loading state
  avatarPreview.style.opacity = '0.7';
  
  if (avatarSource && isValidImageSource(avatarSource)) {
    const img = new Image();
    
    img.onload = () => {
      avatarPreview.src = avatarSource;
      avatarPreview.style.opacity = '1';
      console.log('Avatar loaded successfully');
    };
    
    img.onerror = () => {
      console.warn('Avatar failed to load, using placeholder');
      avatarPreview.src = PROFILE_CONFIG.defaultAvatar;
      avatarPreview.style.opacity = '1';
      
      // Don't overwrite storage - just update display
    };
    
    img.src = avatarSource;
  } else {
    // Invalid source, use placeholder
    avatarPreview.src = PROFILE_CONFIG.defaultAvatar;
    avatarPreview.style.opacity = '1';
  }
}

function updateReadingStats(profileData) {
  // Update reading goal if element exists
  const goalElement = document.querySelector('.reading-goal-display');
  if (goalElement) {
    goalElement.textContent = profileData.readingGoal || '24 books';
  }
}

function initializeGenreTags(genres) {
  const genreTagsContainer = document.querySelector('.genre-tags');
  if (!genreTagsContainer) return;

  const addButton = genreTagsContainer.querySelector('.genre-tag.add-genre') || 
                   genreTagsContainer.querySelector('.genre-tag:last-child');
  
  // Clear existing tags (except add button)
  const existingTags = genreTagsContainer.querySelectorAll('.genre-tag:not(.add-genre):not(:last-child)');
  existingTags.forEach(tag => tag.remove());
  
  // Add genre tags
  genres.forEach(genre => {
    const genreTag = createGenreTag(genre);
    genreTagsContainer.insertBefore(genreTag, addButton);
  });
}

function createGenreTag(genre) {
  const genreTag = document.createElement('span');
  genreTag.className = 'genre-tag active';
  genreTag.textContent = genre;
  genreTag.title = `Click to remove ${genre}`;
  
  genreTag.addEventListener('click', function() {
    const isActive = this.classList.toggle('active');
    if (!isActive) {
      // Add fade out animation before removal
      this.style.opacity = '0';
      this.style.transform = 'scale(0.8)';
      setTimeout(() => {
        this.remove();
        updateGenresInStorage();
        showNotification(`Removed ${genre} from genres`, 'info');
      }, 300);
    } else {
      updateGenresInStorage();
    }
  });
  
  return genreTag;
}

function setupEnhancedEventListeners() {
  setupAvatarUpload();
  setupFormListeners();
  setupPasswordValidation();
  setupDragAndDrop();
}

function setupAvatarUpload() {
  const fileInput = document.getElementById('fileInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarContainer = document.querySelector('.avatar-container');

  if (!fileInput || !avatarPreview || !avatarContainer) return;

  // Click avatar to trigger file input
  avatarContainer.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', handleAvatarUpload);
}

function handleAvatarUpload(e) {
  const file = e.target.files[0];
  const avatarPreview = document.getElementById('avatarPreview');
  
  if (!file) return;

  // Enhanced validation
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    showNotification(validation.message, 'error');
    return;
  }

  // Show upload progress
  showUploadProgress(true);

  const reader = new FileReader();
  
  reader.onloadstart = () => {
    avatarPreview.style.opacity = '0.5';
  };

  reader.onload = (e) => {
    console.log('File read successfully, data URL length:', e.target.result.length);
    
    // Optimize image before saving
    optimizeImage(e.target.result, (optimizedDataUrl) => {
      // Update avatar preview
      avatarPreview.src = optimizedDataUrl;
      avatarPreview.style.opacity = '1';
      
      // Save to localStorage
      saveProfileChange('avatar', optimizedDataUrl);
      
      // Update display throughout the app
      const profileData = JSON.parse(localStorage.getItem('neuroreads_profile')) || {};
      profileData.avatar = optimizedDataUrl;
      updateDisplayInfo(profileData);
      
      showUploadProgress(false);
      showNotification('Profile picture updated successfully!', 'success');
      
      // Reset file input to allow same file re-upload
      e.target.value = '';
    });
  };
  
  reader.onerror = () => {
    showUploadProgress(false);
    avatarPreview.style.opacity = '1';
    showNotification('Error reading image file', 'error');
  };
  
  reader.readAsDataURL(file);
}

function validateImageFile(file) {
  if (!file.type.startsWith('image/')) {
    return { isValid: false, message: 'Please select an image file (JPEG, PNG, GIF, WebP)' };
  }
  
  if (!PROFILE_CONFIG.supportedFormats.includes(file.type)) {
    return { isValid: false, message: `Unsupported format. Please use: ${PROFILE_CONFIG.supportedFormats.join(', ')}` };
  }
  
  if (file.size > PROFILE_CONFIG.maxFileSize) {
    return { isValid: false, message: 'Image must be less than 5MB' };
  }
  
  return { isValid: true, message: 'File is valid' };
}

function showUploadProgress(show) {
  const progressElement = document.getElementById('uploadProgress') || createProgressElement();
  
  if (show) {
    progressElement.style.display = 'block';
  } else {
    progressElement.style.display = 'none';
  }
}

function createProgressElement() {
  const progress = document.createElement('div');
  progress.id = 'uploadProgress';
  progress.innerHTML = 'Uploading...';
  progress.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    z-index: 10;
    display: none;
  `;
  
  const avatarContainer = document.querySelector('.avatar-container');
  if (avatarContainer) {
    avatarContainer.style.position = 'relative';
    avatarContainer.appendChild(progress);
  }
  
  return progress;
}

function optimizeImage(dataUrl, callback) {
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate new dimensions (max 200x200 for avatars)
    let width = img.width;
    let height = img.height;
    const maxSize = 200;
    
    if (width > height && width > maxSize) {
      height = (height * maxSize) / width;
      width = maxSize;
    } else if (height > maxSize) {
      width = (width * maxSize) / height;
      height = maxSize;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(img, 0, 0, width, height);
    
    // Get optimized data URL
    const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    callback(optimizedDataUrl);
  };
  
  img.src = dataUrl;
}

function setupFormListeners() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    // Real-time input handling with debouncing
    input.addEventListener('input', debounce((e) => {
      const field = e.target.id;
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      
      saveProfileChange(field, value);
      
      // Update display in real-time for name changes
      if (field === 'firstName' || field === 'lastName' || field === 'username') {
        updateDisplayFromForm();
      }
      
      profileState.hasUnsavedChanges = true;
    }, 500));
    
    // Change events for select elements
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', (e) => {
        const field = e.target.id;
        const value = e.target.value;
        saveProfileChange(field, value);
        profileState.hasUnsavedChanges = true;
      });
    }
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveAllChanges();
    profileState.hasUnsavedChanges = false;
    showNotification('Profile updated successfully!', 'success');
  });

  // Warn about unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (profileState.hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  });
}

function setupPasswordValidation() {
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  
  if (!newPassword || !confirmPassword) return;

  const validatePassword = () => {
    if (newPassword.value && confirmPassword.value) {
      if (newPassword.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity('Passwords do not match');
        showNotification('Passwords do not match', 'error');
      } else if (newPassword.value.length < 8) {
        newPassword.setCustomValidity('Password must be at least 8 characters');
        showNotification('Password must be at least 8 characters', 'error');
      } else {
        confirmPassword.setCustomValidity('');
        newPassword.setCustomValidity('');
      }
    }
  };

  newPassword.addEventListener('input', validatePassword);
  confirmPassword.addEventListener('input', validatePassword);
  
  // Save password on blur if valid
  [newPassword, confirmPassword].forEach(field => {
    field.addEventListener('blur', () => {
      if (newPassword.value && confirmPassword.value && 
          newPassword.value === confirmPassword.value &&
          newPassword.value.length >= 8) {
        
        saveProfileChange('password', newPassword.value);
        showNotification('Password updated successfully!', 'success');
        
        // Clear password fields for security
        newPassword.value = '';
        confirmPassword.value = '';
        
        profileState.hasUnsavedChanges = false;
      }
    });
  });
}

function setupDragAndDrop() {
  const avatarContainer = document.querySelector('.avatar-container');
  if (!avatarContainer) return;

  avatarContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    avatarContainer.classList.add('drag-over');
  });

  avatarContainer.addEventListener('dragleave', () => {
    avatarContainer.classList.remove('drag-over');
  });

  avatarContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    avatarContainer.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileInput = document.getElementById('fileInput');
      // Create a new FileList (simulated)
      const dt = new DataTransfer();
      dt.items.add(files[0]);
      fileInput.files = dt.files;
      
      // Trigger change event
      fileInput.dispatchEvent(new Event('change'));
    }
  });
}

function initializeGenreSelection() {
  const addGenreBtn = document.querySelector('.genre-tag.add-genre') || 
                      document.querySelector('.genre-tag:last-child');
  
  if (!addGenreBtn) return;

  addGenreBtn.addEventListener('click', () => {
    const currentGenres = Array.from(document.querySelectorAll('.genre-tag.active:not(.add-genre)'))
      .map(tag => tag.textContent);
    
    const newGenre = prompt('Enter a new genre:', '');
    if (newGenre && newGenre.trim()) {
      const genreText = newGenre.trim();
      
      // Check for duplicates
      if (currentGenres.includes(genreText)) {
        showNotification(`"${genreText}" is already in your genres`, 'warning');
        return;
      }
      
      // Check maximum genres
      if (currentGenres.length >= 10) {
        showNotification('Maximum 10 genres allowed', 'warning');
        return;
      }
      
      const genreTagsContainer = document.querySelector('.genre-tags');
      const newTag = createGenreTag(genreText);
      
      genreTagsContainer.insertBefore(newTag, addGenreBtn);
      updateGenresInStorage();
      showNotification(`Added "${genreText}" to your genres`, 'success');
    }
  });
}

function setupAutoSave() {
  // Auto-save every 30 seconds if there are unsaved changes
  setInterval(() => {
    if (profileState.hasUnsavedChanges && !profileState.isSaving) {
      saveAllChanges();
      console.log('Auto-saved profile changes');
    }
  }, 30000);
}

function startBackupService() {
  // Create backups periodically
  setInterval(() => {
    const profileData = JSON.parse(localStorage.getItem('neuroreads_profile'));
    if (profileData) {
      createBackup(profileData);
    }
  }, PROFILE_CONFIG.backupInterval);
}

function createBackup(profileData) {
  const backupData = {
    ...profileData,
    backupCreated: new Date().toISOString()
  };
  
  localStorage.setItem('neuroreads_profile_backup', JSON.stringify(backupData));
  profileState.lastBackup = new Date();
}

function updateDisplayFromForm() {
  const profileData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    username: document.getElementById('username').value
  };
  updateDisplayInfo(profileData);
}

function updateGenresInStorage() {
  const activeGenres = Array.from(document.querySelectorAll('.genre-tag.active:not(.add-genre)'))
    .map(tag => tag.textContent);
  saveProfileChange('genres', activeGenres);
}

function saveProfileChange(field, value) {
  profileState.isSaving = true;
  
  const profileData = JSON.parse(localStorage.getItem('neuroreads_profile')) || {};
  profileData[field] = value;
  profileData.lastUpdated = new Date().toISOString();
  
  localStorage.setItem('neuroreads_profile', JSON.stringify(profileData));
  
  console.log(`Saved ${field}:`, field === 'password' ? '***' : value);
  
  // Special handling for certain fields
  if (field === 'firstName' || field === 'lastName' || field === 'username') {
    updateDisplayInfo(profileData);
  }
  
  profileState.isSaving = false;
}

function saveAllChanges() {
  if (profileState.isSaving) return;
  
  profileState.isSaving = true;
  
  const formData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    bio: document.getElementById('bio').value,
    readingGoal: document.getElementById('readingGoal').value,
    notifications: document.getElementById('emailNotifications')?.checked || false,
    publicProfile: document.getElementById('publicProfile')?.checked || false,
    genres: Array.from(document.querySelectorAll('.genre-tag.active:not(.add-genre)'))
      .map(tag => tag.textContent),
    lastUpdated: new Date().toISOString()
  };
  
  // Get avatar from current state
  const avatarPreview = document.getElementById('avatarPreview');
  if (avatarPreview && avatarPreview.src) {
    formData.avatar = avatarPreview.src;
  }
  
  localStorage.setItem('neuroreads_profile', JSON.stringify(formData));
  createBackup(formData);
  
  // Update all displays
  updateDisplayInfo(formData);
  
  profileState.isSaving = false;
  profileState.hasUnsavedChanges = false;
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function initializeImageOptimization() {
  // Preload and cache avatars
  const profileData = JSON.parse(localStorage.getItem('neuroreads_profile'));
  if (profileData && profileData.avatar && profileData.avatar.startsWith('data:image')) {
    const img = new Image();
    img.src = profileData.avatar;
  }
}

function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.nr-notification');
  existingNotifications.forEach(notification => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });

  const notification = document.createElement('div');
  notification.className = `nr-notification nr-notification-${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  notification.innerHTML = `
    <div class="nr-notification-icon">${icons[type] || icons.info}</div>
    <div class="nr-notification-message">${message}</div>
    <button class="nr-notification-close" onclick="this.parentNode.remove()">×</button>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
    color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
    font-family: "Poppins", sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds for info, 8 for others
  const duration = type === 'info' ? 5000 : 8000;
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => notification.parentNode.removeChild(notification), 300);
    }
  }, duration);
}

// Debug and utility functions
function debugStorage() {
  console.log('Current localStorage neuroreads_profile:', 
    JSON.parse(localStorage.getItem('neuroreads_profile')));
  console.log('Backup data:', 
    JSON.parse(localStorage.getItem('neuroreads_profile_backup')));
}

function exportProfileData() {
  const profileData = localStorage.getItem('neuroreads_profile');
  const blob = new Blob([profileData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'neuroreads-profile-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importProfileData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const profileData = JSON.parse(e.target.result);
      localStorage.setItem('neuroreads_profile', JSON.stringify(profileData));
      loadProfileData();
      showNotification('Profile imported successfully!', 'success');
    } catch (error) {
      showNotification('Invalid profile file', 'error');
    }
  };
  reader.readAsText(file);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .drag-over {
    border: 2px dashed #007bff !important;
    background-color: rgba(0, 123, 255, 0.1) !important;
  }
  
  .genre-tag {
    transition: all 0.3s ease;
  }
  
  .nr-notification-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    margin: 0;
    line-height: 1;
  }
`;
document.head.appendChild(style);