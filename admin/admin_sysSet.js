// admin_sysSet.js - SYSTEM SETTINGS SPECIFIC FUNCTIONALITY ONLY
document.addEventListener('DOMContentLoaded', () => {
  // Only system settings specific functionality here
  // NO DROPDOWN CODE - that's in admin_common.js

  console.log('System Settings initialized');

  // Tab Navigation
  const navItems = document.querySelectorAll('.nr-nav-item');
  const tabs = document.querySelectorAll('.nr-settings-tab');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.dataset.tab;
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Show target tab
      tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === `${targetTab}-tab`) {
          tab.classList.add('active');
        }
      });
      
      console.log(`Switched to ${targetTab} settings`);
    });
  });

  // Save Settings Button
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveAllSettings);
  }

  // Apply Settings Button
  const applySettingsBtn = document.getElementById('applySettingsBtn');
  if (applySettingsBtn) {
    applySettingsBtn.addEventListener('click', applySettings);
  }

  // Reset Settings Button
  const resetSettingsBtn = document.getElementById('resetSettingsBtn');
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', resetSettings);
  }

  // Import/Export Settings
  const importSettingsBtn = document.getElementById('importSettingsBtn');
  const exportSettingsBtn = document.getElementById('exportSettingsBtn');

  if (importSettingsBtn) {
    importSettingsBtn.addEventListener('click', importSettings);
  }

  if (exportSettingsBtn) {
    exportSettingsBtn.addEventListener('click', exportSettings);
  }

  // Maintenance Mode Toggle
  const maintenanceMode = document.getElementById('maintenanceMode');
  const maintenanceMessageGroup = document.getElementById('maintenanceMessageGroup');

  if (maintenanceMode) {
    maintenanceMode.addEventListener('change', function() {
      if (this.checked) {
        maintenanceMessageGroup.style.display = 'block';
        showWarning('Maintenance mode will restrict access to administrators only.');
      } else {
        maintenanceMessageGroup.style.display = 'none';
      }
    });
  }

  // Auto-approve Books Toggle
  const autoApproveBooks = document.getElementById('autoApproveBooks');
  if (autoApproveBooks) {
    autoApproveBooks.addEventListener('change', function() {
      if (this.checked) {
        showWarning('Auto-approval may allow inappropriate content. Ensure you have proper moderation systems in place.');
      }
    });
  }

  // Two-Factor Authentication Toggle
  const twoFactorAuth = document.getElementById('twoFactorAuth');
  if (twoFactorAuth) {
    twoFactorAuth.addEventListener('change', function() {
      if (this.checked) {
        if (confirm('Enabling 2FA will require all administrators to set up two-factor authentication on their next login. Continue?')) {
          showSuccess('Two-factor authentication will be enabled for all administrators.');
        } else {
          this.checked = false;
        }
      }
    });
  }

  // Cloud Backup Toggle
  const cloudBackup = document.getElementById('cloudBackup');
  if (cloudBackup) {
    cloudBackup.addEventListener('change', function() {
      if (this.checked) {
        showInfo('Cloud backup requires additional configuration. Please check the integration settings.');
      }
    });
  }

  // Permission Group Actions
  const permissionActions = document.querySelectorAll('.nr-permission-action');
  permissionActions.forEach(action => {
    action.addEventListener('click', function() {
      const card = this.closest('.nr-permission-card');
      const role = card.querySelector('h4').textContent;
      const actionType = this.classList.contains('edit') ? 'edit' : 'manage';
      
      if (actionType === 'edit') {
        editPermissionGroup(role);
      } else {
        managePermissionUsers(role);
      }
    });
  });

  // Template Edit Actions
  const templateEdits = document.querySelectorAll('.nr-template-edit');
  templateEdits.forEach(edit => {
    edit.addEventListener('click', function() {
      const template = this.closest('.nr-template-item').querySelector('h4').textContent;
      editEmailTemplate(template);
    });
  });

  // Backup Actions
  const createBackupBtn = document.getElementById('createBackupBtn');
  const restoreBackupBtn = document.getElementById('restoreBackupBtn');

  if (createBackupBtn) {
    createBackupBtn.addEventListener('click', createBackup);
  }

  if (restoreBackupBtn) {
    restoreBackupBtn.addEventListener('click', restoreBackup);
  }

  // Individual Backup Item Actions
  const backupActions = document.querySelectorAll('.nr-backup-action');
  backupActions.forEach(action => {
    action.addEventListener('click', function() {
      const backupItem = this.closest('.nr-backup-item');
      const backupName = backupItem.querySelector('.nr-backup-name').textContent;
      const actionType = this.classList.contains('download') ? 'download' : 'restore';
      
      if (actionType === 'download') {
        downloadBackup(backupName);
      } else {
        restoreFromBackup(backupName);
      }
    });
  });

  // Range Input Feedback
  const rangeInputs = document.querySelectorAll('.nr-range-input');
  rangeInputs.forEach(range => {
    range.addEventListener('input', function() {
      const value = this.value;
      console.log(`Range value changed to: ${value}`);
      // In a real application, you might update a display value or preview
    });
  });

  // Setting Chips Management
  const chipAddButtons = document.querySelectorAll('.nr-setting-chip-add');
  chipAddButtons.forEach(button => {
    button.addEventListener('click', function() {
      const chipsContainer = this.closest('.nr-setting-chips');
      const newChipValue = prompt('Enter new value:');
      if (newChipValue && newChipValue.trim()) {
        addNewChip(chipsContainer, newChipValue.trim());
      }
    });
  });

  // Main Functions
  function saveAllSettings() {
    console.log('Saving all settings...');
    const settings = gatherAllSettings();
    
    // Simulate API call
    setTimeout(() => {
      showSuccess('All settings have been saved successfully.');
      console.log('Settings saved:', settings);
    }, 1000);
  }

  function applySettings() {
    console.log('Applying settings...');
    const settings = gatherAllSettings();
    
    // Simulate API call
    setTimeout(() => {
      showSuccess('Settings have been applied successfully. Some changes may require a system restart.');
      console.log('Settings applied:', settings);
    }, 1000);
  }

  function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
      console.log('Resetting settings to defaults...');
      
      // Simulate API call
      setTimeout(() => {
        showSuccess('All settings have been reset to their default values.');
        location.reload(); // Refresh to show default values
      }, 1000);
    }
  }

  function importSettings() {
    console.log('Importing settings from file...');
    // This would typically open a file picker
    alert('Settings import functionality would open a file picker to select a configuration file.');
  }

  function exportSettings() {
    console.log('Exporting settings to file...');
    const settings = gatherAllSettings();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "neuroreads_settings_" + new Date().toISOString().split('T')[0] + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showSuccess('Settings exported successfully.');
  }

  function gatherAllSettings() {
    const settings = {
      general: {
        libraryName: document.getElementById('libraryName')?.value,
        libraryDescription: document.getElementById('libraryDescription')?.value,
        contactEmail: document.getElementById('contactEmail')?.value,
        supportPhone: document.getElementById('supportPhone')?.value,
        defaultLanguage: document.getElementById('defaultLanguage')?.value,
        timeZone: document.getElementById('timeZone')?.value,
        dateFormat: document.getElementById('dateFormat')?.value,
        currency: document.getElementById('currency')?.value,
        maintenanceMode: document.getElementById('maintenanceMode')?.checked,
        maintenanceMessage: document.getElementById('maintenanceMessage')?.value
      },
      users: {
        allowRegistrations: document.getElementById('allowRegistrations')?.checked,
        requireEmailVerification: document.getElementById('requireEmailVerification')?.checked,
        defaultUserRole: document.getElementById('defaultUserRole')?.value,
        minPasswordLength: document.getElementById('minPasswordLength')?.value
      },
      content: {
        maxFileSize: document.getElementById('maxFileSize')?.value,
        autoApproveBooks: document.getElementById('autoApproveBooks')?.checked,
        maxBooksPerUser: document.getElementById('maxBooksPerUser')?.value,
        autoModeration: document.getElementById('autoModeration')?.checked,
        moderationSensitivity: document.getElementById('moderationSensitivity')?.value,
        bannedWords: document.getElementById('bannedWords')?.value
      },
      notifications: {
        welcomeEmails: document.getElementById('welcomeEmails')?.checked,
        readingReminders: document.getElementById('readingReminders')?.checked,
        promotionalEmails: document.getElementById('promotionalEmails')?.checked,
        systemAnnouncements: document.getElementById('systemAnnouncements')?.checked
      },
      security: {
        sessionTimeout: document.getElementById('sessionTimeout')?.value,
        maxLoginAttempts: document.getElementById('maxLoginAttempts')?.value,
        twoFactorAuth: document.getElementById('twoFactorAuth')?.checked,
        passwordHistory: document.getElementById('passwordHistory')?.checked
      },
      backup: {
        backupFrequency: document.getElementById('backupFrequency')?.value,
        backupRetention: document.getElementById('backupRetention')?.value,
        cloudBackup: document.getElementById('cloudBackup')?.checked
      }
    };
    
    return settings;
  }

  function editPermissionGroup(role) {
    console.log(`Editing permission group: ${role}`);
    alert(`Editing permissions for: ${role}\n\nPermission management interface would open here.`);
  }

  function managePermissionUsers(role) {
    console.log(`Managing users for permission group: ${role}`);
    alert(`Managing users in: ${role}\n\nUser management interface for this role would open here.`);
  }

  function editEmailTemplate(template) {
    console.log(`Editing email template: ${template}`);
    alert(`Editing email template: ${template}\n\nEmail template editor would open here.`);
  }

  function createBackup() {
    console.log('Creating manual backup...');
    
    // Simulate backup process
    const button = createBackupBtn;
    const originalHTML = button.innerHTML;
    
    button.innerHTML = '<img src="../icons/loading.png" alt="Creating..." style="width:16px;height:16px;"> Creating Backup...';
    button.disabled = true;
    
    setTimeout(() => {
      showSuccess('Backup created successfully. The backup file has been saved to the server.');
      button.innerHTML = originalHTML;
      button.disabled = false;
      
      // Add to backups list
      addNewBackup();
    }, 3000);
  }

  function restoreBackup() {
    console.log('Initiating backup restoration...');
    alert('Backup restoration interface would open here.\nPlease select a backup file to restore from.');
  }

  function downloadBackup(backupName) {
    console.log(`Downloading backup: ${backupName}`);
    
    // Simulate download
    showInfo(`Downloading backup: ${backupName}\nThis may take a few moments...`);
    
    setTimeout(() => {
      showSuccess(`Backup ${backupName} downloaded successfully.`);
    }, 2000);
  }

  function restoreFromBackup(backupName) {
    if (confirm(`Are you sure you want to restore from backup: ${backupName}? This will overwrite current system data.`)) {
      console.log(`Restoring from backup: ${backupName}`);
      
      // Simulate restoration
      showWarning(`Initiating system restoration from: ${backupName}\nThe system may be temporarily unavailable.`);
      
      setTimeout(() => {
        showSuccess(`System successfully restored from backup: ${backupName}`);
      }, 3000);
    }
  }

  function addNewChip(container, value) {
    const newChip = document.createElement('span');
    newChip.className = 'nr-setting-chip';
    newChip.textContent = value;
    
    const removeBtn = document.createElement('span');
    removeBtn.textContent = '×';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.marginLeft = '5px';
    removeBtn.addEventListener('click', function() {
      newChip.remove();
    });
    
    newChip.appendChild(removeBtn);
    container.insertBefore(newChip, container.lastElementChild);
  }

  function addNewBackup() {
    const backupsList = document.querySelector('.nr-backups-list');
    if (!backupsList) return;

    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0];
    const backupName = `backup_${timestamp}.zip`;
    const formattedDate = now.toLocaleDateString() + ', ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    const newBackup = document.createElement('div');
    newBackup.className = 'nr-backup-item';
    
    newBackup.innerHTML = `
      <div class="nr-backup-icon success">
        <img src="../icons/success.png" alt="Success" style="width:16px;height:16px;">
      </div>
      <div class="nr-backup-info">
        <div class="nr-backup-name">${backupName}</div>
        <div class="nr-backup-details">2.4 GB • ${formattedDate}</div>
      </div>
      <div class="nr-backup-actions">
        <button class="nr-backup-action download">Download</button>
        <button class="nr-backup-action restore">Restore</button>
      </div>
    `;

    backupsList.insertBefore(newBackup, backupsList.firstChild);
    
    // Add event listeners to new buttons
    newBackup.querySelector('.nr-backup-action.download').addEventListener('click', function() {
      downloadBackup(backupName);
    });
    
    newBackup.querySelector('.nr-backup-action.restore').addEventListener('click', function() {
      restoreFromBackup(backupName);
    });
    
    // Update backup status
    updateBackupStatus();
  }

  function updateBackupStatus() {
    const lastBackupInfo = document.querySelector('.nr-backup-info:first-child');
    if (lastBackupInfo) {
      const now = new Date();
      lastBackupInfo.innerHTML = `<strong>Last Backup:</strong> ${now.toLocaleDateString()}, ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
  }

  // Utility Functions
  function showSuccess(message) {
    alert('✅ ' + message);
  }

  function showWarning(message) {
    alert('⚠️ ' + message);
  }

  function showInfo(message) {
    alert('ℹ️ ' + message);
  }

  function showError(message) {
    alert('❌ ' + message);
  }

  // Initialize settings
  console.log('System Settings loaded successfully');
  
  // Load saved settings from localStorage (simulated)
  setTimeout(() => {
    console.log('Settings loaded from storage');
  }, 500);
});