// admin_common.js - COMPLETE WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Admin Common JS Loaded');
    initializeDropdown();
    initializeLogout();
});

function initializeDropdown() {
    const dropdownTrigger = document.getElementById('userDropdown');
    const dropdownMenu = document.querySelector('.nr-dropdown');
    
    console.log('🎯 Dropdown Elements:', {
        trigger: dropdownTrigger,
        menu: dropdownMenu
    });

    if (!dropdownTrigger || !dropdownMenu) {
        console.error('❌ Dropdown elements not found');
        return;
    }

    console.log('✅ Initializing dropdown...');

    // Add debug styling to ensure visibility
    dropdownMenu.style.background = '#ffffff';
    dropdownMenu.style.opacity = '1';
    dropdownMenu.style.visibility = 'visible';
    dropdownMenu.style.border = '2px solid #297a79';

    // Click handler for dropdown trigger
    dropdownTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('👆 Dropdown clicked');
        
        const isVisible = dropdownMenu.classList.contains('active');
        
        // Toggle dropdown
        dropdownMenu.classList.toggle('active');
        
        console.log('📱 Dropdown visible:', !isVisible);
        
        // Force styles when active
        if (!isVisible) {
            dropdownMenu.style.display = 'block';
            dropdownMenu.style.background = '#ffffff';
            dropdownMenu.style.opacity = '1';
            dropdownMenu.style.visibility = 'visible';
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
            if (dropdownMenu.classList.contains('active')) {
                dropdownMenu.classList.remove('active');
                console.log('📱 Dropdown closed (outside click)');
            }
        }
    });

    // Handle clicks inside dropdown (except logout)
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const target = e.target.closest('a') || e.target.closest('button');
        if (target && target.id !== 'logoutBtn') {
            console.log('📱 Dropdown item clicked:', target.textContent.trim());
            // Close dropdown after a short delay for regular links
            setTimeout(() => {
                dropdownMenu.classList.remove('active');
            }, 200);
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
            console.log('📱 Dropdown closed (Escape key)');
        }
    });
}

function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) {
        console.error('❌ Logout button not found');
        return;
    }

    console.log('✅ Logout button found');

    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🚪 Logout button clicked');
        
        // Close dropdown immediately
        const dropdownMenu = document.querySelector('.nr-dropdown');
        if (dropdownMenu) {
            dropdownMenu.classList.remove('active');
        }
        
        if (confirm('Are you sure you want to log out?')) {
            console.log('✅ User confirmed logout');
            
            // Show loading state
            const originalHTML = logoutBtn.innerHTML;
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            logoutBtn.disabled = true;
            
            // Perform logout after short delay
            setTimeout(() => {
                console.log('🔐 Redirecting to logout...');
                // Use your actual logout URL here
                window.location.href = '/logout/'; // Adjust this to your Django logout URL
            }, 1000);
        } else {
            console.log('❌ User cancelled logout');
        }
    });
}

// Manual test functions
window.testDropdown = function() {
    const dropdownMenu = document.querySelector('.nr-dropdown');
    if (dropdownMenu) {
        const isVisible = dropdownMenu.classList.contains('active');
        dropdownMenu.classList.toggle('active');
        
        // Force visible styles
        if (!isVisible) {
            dropdownMenu.style.display = 'block';
            dropdownMenu.style.background = '#ffffff';
            dropdownMenu.style.opacity = '1';
            dropdownMenu.style.visibility = 'visible';
            dropdownMenu.style.border = '3px solid #00ff00';
        }
        
        console.log('🧪 Manual toggle - Visible:', !isVisible);
    }
};

window.forceShowDropdown = function() {
    const dropdownMenu = document.querySelector('.nr-dropdown');
    if (dropdownMenu) {
        dropdownMenu.classList.add('active');
        dropdownMenu.style.display = 'block';
        dropdownMenu.style.background = '#ffffff';
        dropdownMenu.style.opacity = '1';
        dropdownMenu.style.visibility = 'visible';
        console.log('🔧 Dropdown forced to show');
    }
};

window.testLogout = function() {
    console.log('🧪 Testing logout functionality');
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.click();
    }
};