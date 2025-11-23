// myapp/static/myapp/js/search.js - COMPLETE FIXED VERSION
class SearchManager {
    constructor() {
        this.filters = {
            languages: [],
            genres: [],
            sortBy: 'relevance',
            order: 'desc',
            query: ''
        };
        this.currentResults = [];
        this.currentPage = 1;
        this.hasMore = false;
        this.isLoading = false;
        
        // Initialize debounced search
        this.debouncedSearch = this.debounce(() => {
            if (this.filters.query.length >= 2) {
                this.performSearch(true);
            } else if (this.filters.query.length === 0) {
                this.clearResults();
            }
        }, 500);
    }

    init() {
        console.log('🚀 Initializing Search Manager');
        this.setupEventListeners();
        this.loadSavedFilters();
        this.initializeBootstrapComponents();
        this.checkBooksStructure();
        
        // Test checkboxes after initialization
        setTimeout(() => {
            this.testCheckboxes();
        }, 500);
    }

    async checkBooksStructure() {
        try {
            const response = await fetch('/debug-books-structure/');
            const data = await response.json();
            
            console.log('📊 Books collection structure:', data);
            
            // Hide filters if fields don't exist
            if (!data.field_checks?.language) {
                this.hideLanguageFilter();
            }
            
        } catch (error) {
            console.error('Error checking book structure:', error);
        }
    }

    hideLanguageFilter() {
        const languageSection = document.querySelector('.filter-section:nth-child(2)');
        if (languageSection) {
            languageSection.style.display = 'none';
            console.log('🔧 Hiding language filter');
        }
    }

    setupEventListeners() {
        console.log('🔧 Setting up search event listeners');
        
        // Sort changes
        document.getElementById('sortBy')?.addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.saveFilters();
            this.performSearch(true);
        });

        document.getElementById('orderBy')?.addEventListener('change', (e) => {
            this.filters.order = e.target.value;
            this.saveFilters();
            this.performSearch(true);
        });

        // Apply filters button
        document.getElementById('applyFiltersBtn')?.addEventListener('click', () => {
            this.performSearch(true);
        });

        // Main search input
        const mainSearchInput = document.querySelector('.search-main-input');
        const mainSearchBtn = document.getElementById('mainSearchBtn');

        if (mainSearchInput) {
            mainSearchInput.addEventListener('input', (e) => {
                this.filters.query = e.target.value.trim();
                this.debouncedSearch();
                this.updateSearchSuggestions();
            });

            mainSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(true);
                }
            });
        }

        if (mainSearchBtn) {
            mainSearchBtn.addEventListener('click', () => {
                this.performSearch(true);
            });
        }

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.filter;
                this.handleQuickAction(action);
            });
        });

        // Load more button
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.loadMore();
        });

        // Topbar search integration
        this.setupTopbarSearch();
        
        // Setup filter toggles - FIXED VERSION
        this.setupFilterToggles();
    }

    setupFilterToggles() {
        console.log('🎯 Setting up filter toggles');
        
        // Clear any existing listeners by cloning elements
        const languageGroup = document.getElementById('languageGroup');
        const genreGroup = document.getElementById('genreGroup');
        
        if (languageGroup) {
            languageGroup.innerHTML = languageGroup.innerHTML;
        }
        if (genreGroup) {
            genreGroup.innerHTML = genreGroup.innerHTML;
        }

        // Language filters (2-state) - FIXED EVENT LISTENERS
        document.querySelectorAll('#languageGroup .checkbox-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🌍 Language clicked:', item);
                this.toggleLanguage(item);
            });
            
            // Also prevent default on checkbox click
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        });

        // Genre filters (3-state) - FIXED EVENT LISTENERS
        document.querySelectorAll('#genreGroup .checkbox-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎭 Genre clicked:', item);
                this.toggleGenre(item);
            });
            
            // Also prevent default on checkbox click
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        });
        
        console.log('✅ Filter toggles setup complete');
    }

    setupTopbarSearch() {
        const topbarSearch = document.querySelector('.nr-search-input');
        const topbarSearchBtn = document.querySelector('.nr-search-btn');

        if (topbarSearch) {
            topbarSearch.addEventListener('input', (e) => {
                this.filters.query = e.target.value.trim();
                this.debouncedSearch();
            });

            topbarSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(true);
                }
            });
        }

        if (topbarSearchBtn) {
            topbarSearchBtn.addEventListener('click', () => {
                this.performSearch(true);
            });
        }
    }

    // ===== 2-state Language Toggle - FIXED =====
    toggleLanguage(item) {
        console.log('🎯 Toggling language:', item);
        const state = item.dataset.state || 'neutral';
        const label = item.querySelector('label').textContent;
        const checkbox = item.querySelector('input[type="checkbox"]');
        
        console.log('Current state:', state, 'Label:', label);
        
        // Remove from filters first
        this.filters.languages = this.filters.languages.filter(lang => lang !== label);
        
        if (state === 'neutral') {
            // Activate: Green check
            item.dataset.state = 'active';
            item.className = 'checkbox-item lang-active';
            checkbox.checked = true;
            this.filters.languages.push(label);
            
            console.log('✅ Language activated:', label);
        } else {
            // Deactivate: Back to neutral
            item.dataset.state = 'neutral';
            item.className = 'checkbox-item lang-neutral';
            checkbox.checked = false;
            
            console.log('❌ Language deactivated:', label);
        }
        
        console.log('🌍 Current languages:', this.filters.languages);
        this.saveFilters();
        this.performSearch(true);
    }

    // ===== 3-state Genre Toggle - FIXED =====
    toggleGenre(item) {
        console.log('🎯 Toggling genre:', item);
        const state = item.dataset.state || 'neutral';
        const label = item.querySelector('label').textContent;
        const checkbox = item.querySelector('input[type="checkbox"]');
        
        console.log('Current state:', state, 'Label:', label);
        
        // Clean up any existing entries for this genre
        this.filters.genres = this.filters.genres.filter(genre => 
            genre !== label && genre !== `!${label}`
        );
        
        if (state === 'neutral') {
            // First click: Green check (include)
            item.dataset.state = 'include';
            item.className = 'checkbox-item genre-include';
            checkbox.checked = true;
            this.filters.genres.push(label);
            console.log('✅ Genre included:', label);
            
        } else if (state === 'include') {
            // Second click: Red exclude
            item.dataset.state = 'exclude';
            item.className = 'checkbox-item genre-exclude';
            checkbox.checked = false;
            this.filters.genres.push(`!${label}`);
            console.log('❌ Genre excluded:', label);
            
        } else {
            // Third click: Back to neutral
            item.dataset.state = 'neutral';
            item.className = 'checkbox-item genre-neutral';
            checkbox.checked = false;
            console.log('⚪ Genre reset:', label);
        }
        
        console.log('🎭 Current genres:', this.filters.genres);
        this.saveFilters();
        this.performSearch(true);
    }

    handleQuickAction(action) {
        switch (action) {
            case 'reset':
                this.resetFilters();
                break;
            case 'popular':
                this.filters.sortBy = 'popularity';
                document.getElementById('sortBy').value = 'popularity';
                this.performSearch(true);
                break;
            case 'recent':
                this.filters.sortBy = 'year';
                this.filters.order = 'desc';
                document.getElementById('sortBy').value = 'year';
                document.getElementById('orderBy').value = 'desc';
                this.performSearch(true);
                break;
        }
    }

    resetFilters() {
        console.log('🔄 Resetting all filters');
        
        // Reset language filters
        document.querySelectorAll('#languageGroup .checkbox-item').forEach(item => {
            item.dataset.state = 'neutral';
            item.className = 'checkbox-item lang-neutral';
            item.querySelector('input[type="checkbox"]').checked = false;
        });

        // Reset genre filters
        document.querySelectorAll('#genreGroup .checkbox-item').forEach(item => {
            item.dataset.state = 'neutral';
            item.className = 'checkbox-item genre-neutral';
            item.querySelector('input[type="checkbox"]').checked = false;
        });

        // Reset filter data
        this.filters.languages = [];
        this.filters.genres = [];
        this.filters.sortBy = 'relevance';
        this.filters.order = 'desc';
        // Keep current query

        // Reset select elements
        document.getElementById('sortBy').value = 'relevance';
        document.getElementById('orderBy').value = 'desc';

        this.saveFilters();
        this.performSearch(true);
    }

    debounce(func, wait) {
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

    async performSearch(resetPagination = false) {
        if (this.isLoading) return;
        
        console.log('🔍 Performing search with filters:', this.filters);
        
        // If no filters are active and no query, clear results
        if (!this.filters.query && this.filters.languages.length === 0 && this.filters.genres.length === 0) {
            this.clearResults();
            return;
        }

        if (resetPagination) {
            this.currentPage = 1;
            this.currentResults = [];
        }

        this.showLoading();

        try {
            const booksData = await this.searchBooks(this.filters, this.currentPage);
            
            console.log('📦 Search results:', booksData);
            
            if (resetPagination) {
                this.currentResults = booksData.books || [];
            } else {
                this.currentResults = [...this.currentResults, ...(booksData.books || [])];
            }
            
            this.hasMore = booksData.has_more || false;
            this.displayResults(this.currentResults, booksData.total_count || 0, resetPagination);
            this.saveFilters();
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Failed to search books. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async searchBooks(filters, page = 1) {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters.query) params.append('q', filters.query);
        filters.languages.forEach(lang => params.append('languages[]', lang));
        filters.genres.forEach(genre => params.append('genres[]', genre));
        
        params.append('sort_by', filters.sortBy);
        params.append('order', filters.order);
        params.append('page', page.toString());
        params.append('limit', '20');

        console.log('🌐 API request params:', params.toString());

        const response = await fetch(`/api/search/books/?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    displayResults(books, totalCount, resetPagination = true) {
        const searchResults = document.getElementById('searchResults');
        const resultsCount = document.getElementById('resultsCount');
        const noResults = document.getElementById('noResults');
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        
        console.log('🎨 Displaying results:', books.length, 'books');

        // Update results count
        resultsCount.textContent = `${totalCount} book${totalCount !== 1 ? 's' : ''} found`;

        if (books.length === 0) {
            if (resetPagination) {
                searchResults.innerHTML = '';
                noResults.style.display = 'block';
            }
            loadMoreContainer.style.display = 'none';
            return;
        }

        noResults.style.display = 'none';
        
        const resultsHTML = books.map(book => {
            // Handle genre display (could be string or array)
            let genreDisplay = 'Unknown Genre';
            if (typeof book.genre === 'string') {
                genreDisplay = book.genre;
            } else if (Array.isArray(book.genre) && book.genre.length > 0) {
                genreDisplay = book.genre.join(', ');
            }

            return `
            <div class="book-card" data-book-id="${book._id}">
                <div class="book-card-content">
                    <img src="${book.cover_image || '/static/myapp/images/bookCover/default.jpg'}" 
                         alt="${book.title}" class="book-cover"
                         onerror="this.src='/static/myapp/images/bookCover/default.jpg'">
                    <div class="book-info">
                        <h3 class="book-title">${book.title}</h3>
                        <div class="book-author">by ${book.author || 'Unknown Author'}</div>
                        <div class="book-meta">
                            ${book.average_rating ? `
                            <div class="book-rating">
                                ${this.generateStarRating(book.average_rating)}
                                <span>${book.average_rating.toFixed(1)}</span>
                            </div>
                            ` : ''}
                            <div class="book-details">
                                ${book.publication_year && book.publication_year !== 'Unknown' ? `<span>${book.publication_year}</span>` : ''}
                                ${book.language && book.language !== 'Unknown' ? `<span>${book.language}</span>` : ''}
                                <span>${genreDisplay}</span>
                            </div>
                            ${book.description ? `
                            <div class="book-description">
                                ${book.description.substring(0, 150)}...
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
        
        if (resetPagination) {
            searchResults.innerHTML = resultsHTML;
        } else {
            searchResults.innerHTML += resultsHTML;
        }

        // Show/hide load more button
        loadMoreContainer.style.display = this.hasMore ? 'block' : 'none';

        // Add click events to book cards
        document.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', () => {
                const bookId = card.dataset.bookId;
                this.viewBookDetails(bookId);
            });
        });
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
    }

    viewBookDetails(bookId) {
        // For now, show a notification. You can implement book details page later.
        this.showNotification(`Book details for ID: ${bookId}`, 'info');
    }

    showLoading() {
        this.isLoading = true;
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'flex';
            spinner.classList.add('active');
        }
    }

    hideLoading() {
        this.isLoading = false;
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
            spinner.classList.remove('active');
        }
    }

    clearResults() {
        const searchResults = document.getElementById('searchResults');
        const noResults = document.getElementById('noResults');
        const resultsCount = document.getElementById('resultsCount');
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        
        if (searchResults) searchResults.innerHTML = '';
        if (noResults) {
            noResults.style.display = 'none';
            noResults.classList.remove('active');
        }
        if (resultsCount) resultsCount.textContent = '';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        
        this.currentResults = [];
        this.currentPage = 1;
        this.hasMore = false;
    }

    loadMore() {
        if (this.hasMore && !this.isLoading) {
            this.currentPage++;
            this.performSearch(false);
        }
    }

    showError(message) {
        // Simple error notification
        alert(`Error: ${message}`);
    }

    showNotification(message, type = 'info') {
        // Simple notification
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    saveFilters() {
        // Save filters to localStorage for persistence
        try {
            localStorage.setItem('searchFilters', JSON.stringify(this.filters));
        } catch (e) {
            console.warn('Could not save filters to localStorage');
        }
    }

    loadSavedFilters() {
        // Load filters from localStorage
        try {
            const saved = localStorage.getItem('searchFilters');
            if (saved) {
                const savedFilters = JSON.parse(saved);
                this.filters = { ...this.filters, ...savedFilters };
                
                // Restore UI state
                document.getElementById('sortBy').value = this.filters.sortBy;
                document.getElementById('orderBy').value = this.filters.order;
                
                const mainInput = document.querySelector('.search-main-input');
                if (mainInput && this.filters.query) {
                    mainInput.value = this.filters.query;
                }
                
                // Restore filter visual states
                this.restoreFilterStates();
            }
        } catch (e) {
            console.warn('Could not load filters from localStorage');
        }
    }

    restoreFilterStates() {
        console.log('🔄 Restoring filter states from saved filters');
        
        // Restore language filter states
        document.querySelectorAll('#languageGroup .checkbox-item').forEach(item => {
            const label = item.querySelector('label').textContent;
            const checkbox = item.querySelector('input[type="checkbox"]');
            
            if (this.filters.languages.includes(label)) {
                item.dataset.state = 'active';
                item.className = 'checkbox-item lang-active';
                checkbox.checked = true;
            } else {
                item.dataset.state = 'neutral';
                item.className = 'checkbox-item lang-neutral';
                checkbox.checked = false;
            }
        });

        // Restore genre filter states
        document.querySelectorAll('#genreGroup .checkbox-item').forEach(item => {
            const label = item.querySelector('label').textContent;
            const checkbox = item.querySelector('input[type="checkbox"]');
            
            if (this.filters.genres.includes(label)) {
                item.dataset.state = 'include';
                item.className = 'checkbox-item genre-include';
                checkbox.checked = true;
            } else if (this.filters.genres.includes(`!${label}`)) {
                item.dataset.state = 'exclude';
                item.className = 'checkbox-item genre-exclude';
                checkbox.checked = false;
            } else {
                item.dataset.state = 'neutral';
                item.className = 'checkbox-item genre-neutral';
                checkbox.checked = false;
            }
        });
    }

    initializeBootstrapComponents() {
        console.log('✅ Bootstrap components initialized');
    }

    async updateSearchSuggestions() {
        if (this.filters.query.length < 2) {
            this.hideSuggestions();
            return;
        }

        try {
            const response = await fetch(`/api/search/suggestions/?q=${encodeURIComponent(this.filters.query)}`);
            const data = await response.json();
            
            this.displaySuggestions(data.suggestions, '.search-main-input-container');
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    displaySuggestions(suggestions, containerSelector) {
        const container = document.querySelector(containerSelector);
        let suggestionsEl = container.querySelector('.search-suggestions-dropdown');
        
        if (!suggestionsEl) {
            suggestionsEl = document.createElement('div');
            suggestionsEl.className = 'search-suggestions-dropdown';
            container.appendChild(suggestionsEl);
        }

        if (suggestions.length === 0) {
            suggestionsEl.style.display = 'none';
            return;
        }

        suggestionsEl.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-type="${suggestion.type}" data-text="${suggestion.text}">
                <span class="suggestion-icon">${suggestion.type === 'book' ? '📖' : '✍️'}</span>
                ${suggestion.text}
            </div>
        `).join('');

        suggestionsEl.style.display = 'block';

        // Add click handlers
        suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const text = item.dataset.text;
                const mainInput = document.querySelector('.search-main-input');
                const topbarInput = document.querySelector('.nr-search-input');
                
                if (mainInput) mainInput.value = text;
                if (topbarInput) topbarInput.value = text;
                
                this.filters.query = text;
                this.hideAllSuggestions();
                this.performSearch(true);
            });
        });
    }

    hideSuggestions() {
        const suggestions = document.querySelectorAll('.search-suggestions-dropdown');
        suggestions.forEach(el => el.style.display = 'none');
    }

    hideAllSuggestions() {
        this.hideSuggestions();
    }

    // Debug function to test checkboxes
    testCheckboxes() {
        console.log('🧪 Testing checkboxes...');
        
        // Test language checkboxes
        const langItems = document.querySelectorAll('#languageGroup .checkbox-item');
        console.log('Language items found:', langItems.length);
        
        langItems.forEach((item, index) => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const state = item.dataset.state;
            console.log(`Language ${index + 1}:`, {
                checked: checkbox.checked,
                state: state,
                classes: item.className,
                label: item.querySelector('label').textContent
            });
        });
        
        // Test genre checkboxes
        const genreItems = document.querySelectorAll('#genreGroup .checkbox-item');
        console.log('Genre items found:', genreItems.length);
        
        genreItems.forEach((item, index) => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const state = item.dataset.state;
            console.log(`Genre ${index + 1}:`, {
                checked: checkbox.checked,
                state: state,
                classes: item.className,
                label: item.querySelector('label').textContent
            });
        });
    }
}

// Initialize search manager when DOM is loaded
let searchManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 Search page loaded');
    searchManager = new SearchManager();
    searchManager.init();
    
    // Add global debug function
    window.debugSearch = () => {
        console.log('=== SEARCH DEBUG ===');
        searchManager.testCheckboxes();
        console.log('Current filters:', searchManager.filters);
    };
});