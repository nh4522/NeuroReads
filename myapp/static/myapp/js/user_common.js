// myapp/static/myapp/js/user_common.js - SIMPLE WORKING VERSION
console.log('🟢 user_common.js loaded - SIMPLE WORKING VERSION');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ user_common.js fully loaded');
    setupDropdown();
    setupSearch();
});

function setupDropdown() {
    const userProfile = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');
    
    console.log('🔍 Setting up user dropdown...');

    if (userProfile && userDropdown) {
        // Simple click handler for user profile
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('👤 User profile clicked - toggling dropdown');
            
            // Toggle dropdown
            userDropdown.classList.toggle('active');
            userProfile.classList.toggle('dropdown-active');
            
            console.log('👤 Dropdown is now:', userDropdown.classList.contains('active') ? 'OPEN' : 'CLOSED');
        });

        // Close dropdown when clicking anywhere else
        document.addEventListener('click', function(e) {
            if (!userProfile.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
                userProfile.classList.remove('dropdown-active');
                console.log('👤 Closed dropdown (clicked outside)');
            }
        });

        // Close dropdown when clicking on dropdown items
        const dropdownItems = userDropdown.querySelectorAll('a, button');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                userDropdown.classList.remove('active');
                userProfile.classList.remove('dropdown-active');
                console.log('👤 Closed dropdown (item clicked)');
            });
        });
        
        console.log('✅ User dropdown setup complete');
    } else {
        console.warn('⚠️ User dropdown elements not found');
    }
}

function setupSearch() {
    const searchInput = document.querySelector('.nr-search-input');
    const searchBtn = document.querySelector('.nr-search-btn');

    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', function() {
            performSearch(searchInput.value);
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
}

function performSearch(query) {
    if (query.trim()) {
        console.log('🔍 Performing search:', query);
        window.location.href = `/search/?q=${encodeURIComponent(query)}`;
    }
}

// Simple debug function
window.debugDropdown = function() {
    const userProfile = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');
    
    console.log('=== DROPDOWN DEBUG ===');
    console.log('User Profile:', userProfile);
    console.log('User Dropdown:', userDropdown);
    console.log('Dropdown active:', userDropdown?.classList.contains('active'));
    console.log('Profile active:', userProfile?.classList.contains('dropdown-active'));
    console.log('=== END DEBUG ===');
};