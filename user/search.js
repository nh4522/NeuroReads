// Search page specific functionality
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
    }

    init() {
        this.setupEventListeners();
        this.loadSavedFilters();
        this.updateUserInfo();
        this.initializeBootstrapComponents();
    }

    initializeBootstrapComponents() {
        // Initialize Bootstrap tooltips if needed
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    setupEventListeners() {
        // Sort changes
        document.getElementById('sortBy')?.addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.saveFilters();
            this.performSearch();
        });

        document.getElementById('orderBy')?.addEventListener('change', (e) => {
            this.filters.order = e.target.value;
            this.saveFilters();
            this.performSearch();
        });

        // Apply filters button
        document.getElementById('applyFiltersBtn')?.addEventListener('click', () => {
            this.performSearch();
        });

        // Main search input
        const mainSearchInput = document.querySelector('.search-main-input');
        const mainSearchBtn = document.getElementById('mainSearchBtn');

        if (mainSearchInput) {
            mainSearchInput.addEventListener('input', (e) => {
                this.filters.query = e.target.value;
                this.debouncedSearch();
            });

            mainSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (mainSearchBtn) {
            mainSearchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.filter;
                this.handleQuickAction(action);
            });
        });

        // Topbar search integration
        this.setupTopbarSearch();
    }

    setupTopbarSearch() {
        const topbarSearch = document.querySelector('.nr-search-input');
        const topbarSearchBtn = document.querySelector('.nr-search-btn');

        if (topbarSearch) {
            topbarSearch.addEventListener('input', (e) => {
                this.filters.query = e.target.value;
                this.debouncedSearch();
            });

            topbarSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (topbarSearchBtn) {
            topbarSearchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }
    }

    // ===== 2-state Language Toggle =====
    toggleLanguage(item) {
        const state = item.dataset.state;
        const label = item.querySelector('label').textContent;
        
        console.log('Language toggle:', label, 'from state:', state);
        
        if (state === 'neutral') {
            // Activate: Green check
            item.dataset.state = 'active';
            item.classList.remove('lang-neutral');
            item.classList.add('lang-active');
            item.querySelector('input').checked = true;
            this.filters.languages.push(label);
        } else {
            // Deactivate: Back to neutral
            item.dataset.state = 'neutral';
            item.classList.remove('lang-active');
            item.classList.add('lang-neutral');
            item.querySelector('input').checked = false;
            this.filters.languages = this.filters.languages.filter(lang => lang !== label);
        }
        this.saveFilters();
        console.log('Current languages:', this.filters.languages);
    }

    // ===== 3-state Genre Toggle =====
    toggleGenre(item) {
        const state = item.dataset.state;
        const label = item.querySelector('label').textContent;
        
        console.log('Genre toggle:', label, 'from state:', state);
        
        if (state === 'neutral') {
            // First click: Green check (include)
            item.dataset.state = 'include';
            item.classList.remove('genre-neutral');
            item.classList.add('genre-include');
            item.querySelector('input').checked = true;
            
            // Update filters
            this.filters.genres = this.filters.genres.filter(genre => genre.name !== label);
            this.filters.genres.push({ name: label, type: 'include' });
            
        } else if (state === 'include') {
            // Second click: Red exclude
            item.dataset.state = 'exclude';
            item.classList.remove('genre-include');
            item.classList.add('genre-exclude');
            item.querySelector('input').checked = false;
            
            // Update filters
            this.filters.genres = this.filters.genres.filter(genre => genre.name !== label);
            this.filters.genres.push({ name: label, type: 'exclude' });
            
        } else {
            // Third click: Back to neutral
            item.dataset.state = 'neutral';
            item.classList.remove('genre-exclude');
            item.classList.add('genre-neutral');
            item.querySelector('input').checked = false;
            
            // Remove from filters
            this.filters.genres = this.filters.genres.filter(genre => genre.name !== label);
        }
        this.saveFilters();
        console.log('Current genres:', this.filters.genres);
    }

    handleQuickAction(action) {
        switch (action) {
            case 'reset':
                this.resetFilters();
                break;
            case 'popular':
                this.filters.sortBy = 'popularity';
                document.getElementById('sortBy').value = 'popularity';
                this.performSearch();
                break;
            case 'recent':
                this.filters.sortBy = 'year';
                this.filters.order = 'desc';
                document.getElementById('sortBy').value = 'year';
                document.getElementById('orderBy').value = 'desc';
                this.performSearch();
                break;
        }
    }

    resetFilters() {
        // Reset language filters
        document.querySelectorAll('#languageGroup .checkbox-item').forEach(item => {
            item.dataset.state = 'neutral';
            item.className = 'checkbox-item lang-neutral';
            item.querySelector('input').checked = false;
        });

        // Reset genre filters
        document.querySelectorAll('#genreGroup .checkbox-item').forEach(item => {
            item.dataset.state = 'neutral';
            item.className = 'checkbox-item genre-neutral';
            item.querySelector('input').checked = false;
        });

        // Reset filter data
        this.filters = {
            languages: [],
            genres: [],
            sortBy: 'relevance',
            order: 'desc',
            query: this.filters.query // Keep current query
        };

        // Reset select elements
        document.getElementById('sortBy').value = 'relevance';
        document.getElementById('orderBy').value = 'desc';

        this.saveFilters();
        this.performSearch();
    }

    debouncedSearch = this.debounce(() => {
        if (this.filters.query.length >= 2) {
            this.performSearch();
        } else if (this.filters.query.length === 0) {
            this.clearResults();
        }
    }, 500);

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

    async performSearch() {
        if (!this.filters.query && this.filters.languages.length === 0 && this.filters.genres.length === 0) {
            this.clearResults();
            return;
        }

        this.showLoading();

        try {
            // Simulate API call - replace with actual API endpoint
            const books = await this.searchBooks(this.filters);
            this.currentResults = books;
            this.displayResults(books);
            this.saveFilters();
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Failed to search books. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async searchBooks(filters) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockBooks = [
            {
                id: 1,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                cover: "../icons/book-cover-placeholder.png",
                rating: 4.5,
                year: 1925,
                language: "English",
                genre: "Fiction",
                description: "A classic novel of the Jazz Age."
            },
            {
                id: 2,
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                cover: "../icons/book-cover-placeholder.png",
                rating: 4.8,
                year: 1960,
                language: "English",
                genre: "Fiction",
                description: "A gripping tale of racial injustice and childhood innocence."
            }
        ];

        return mockBooks.filter(book => this.applyFilters(book, filters));
    }

    applyFilters(book, filters) {
        // Apply language filter
        if (filters.languages.length > 0 && !filters.languages.includes(book.language)) {
            return false;
        }
        
        // Apply genre filters
        if (filters.genres.length > 0) {
            const includedGenres = filters.genres.filter(g => g.type === 'include').map(g => g.name);
            const excludedGenres = filters.genres.filter(g => g.type === 'exclude').map(g => g.name);
            
            if (includedGenres.length > 0 && !includedGenres.includes(book.genre)) {
                return false;
            }
            
            if (excludedGenres.length > 0 && excludedGenres.includes(book.genre)) {
                return false;
            }
        }
        
        // Apply search query
        if (filters.query && !this.matchesQuery(book, filters.query)) {
            return false;
        }
        
        return true;
    }

    matchesQuery(book, query) {
        const searchable = `${book.title} ${book.author} ${book.genre} ${book.description}`.toLowerCase();
        return searchable.includes(query.toLowerCase());
    }

    displayResults(books) {
        const searchResults = document.getElementById('searchResults');
        const resultsCount = document.getElementById('resultsCount');
        const noResults = document.getElementById('noResults');
        
        // Update results count
        resultsCount.textContent = `${books.length} book${books.length !== 1 ? 's' : ''} found`;

        if (books.length === 0) {
            searchResults.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        
        const resultsHTML = books.map(book => `
            <div class="book-card" data-book-id="${book.id}">
                <div class="book-card-content">
                    <img src="${book.cover}" alt="${book.title}" class="book-cover">
                    <div class="book-info">
                        <h3 class="book-title">${book.title}</h3>
                        <div class="book-author">by ${book.author}</div>
                        <div class="book-meta">
                            <div class="book-rating">
                                ${this.generateStarRating(book.rating)}
                                <span>${book.rating}</span>
                            </div>
                            <div class="book-details">
                                <span>${book.year}</span>
                                <span>${book.language}</span>
                                <span>${book.genre}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        searchResults.innerHTML = resultsHTML;

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
        const hasHalfStar = rating % 1 !== 0;
        let stars = '★'.repeat(fullStars);
        if (hasHalfStar) stars += '½';
        return stars;
    }

    viewBookDetails(bookId) {
        // Navigate to book details page or show modal
        alert(`Viewing details for book ID: ${bookId}`);
        // window.location.href = `book-details.html?id=${bookId}`;
    }

    clearResults() {
        const searchResults = document.getElementById('searchResults');
        const resultsCount = document.getElementById('resultsCount');
        const noResults = document.getElementById('noResults');
        
        searchResults.innerHTML = '';
        resultsCount.textContent = '';
        noResults.style.display = 'none';
    }

    showLoading() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'block';
    }

    hideLoading() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'none';
    }

    showError(message) {
        // Use Bootstrap alerts for error messages
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    saveFilters() {
        localStorage.setItem('neuroreads_search_filters', JSON.stringify(this.filters));
    }

    loadSavedFilters() {
        const saved = localStorage.getItem('neuroreads_search_filters');
        if (saved) {
            this.filters = { ...this.filters, ...JSON.parse(saved) };
            this.applySavedFilters();
        }
    }

    applySavedFilters() {
        // Apply saved filters to UI
        if (document.getElementById('sortBy')) {
            document.getElementById('sortBy').value = this.filters.sortBy;
        }
        if (document.getElementById('orderBy')) {
            document.getElementById('orderBy').value = this.filters.order;
        }
        
        // Apply to search inputs
        const mainSearchInput = document.querySelector('.search-main-input');
        const topbarSearchInput = document.querySelector('.nr-search-input');
        
        if (mainSearchInput && this.filters.query) {
            mainSearchInput.value = this.filters.query;
        }
        if (topbarSearchInput && this.filters.query) {
            topbarSearchInput.value = this.filters.query;
        }
    }

    updateUserInfo() {
        // Load user data from localStorage
        const profileData = JSON.parse(localStorage.getItem('neuroreads_profile'));
        if (profileData) {
            const usernameElement = document.querySelector('.nr-username');
            if (usernameElement) {
                usernameElement.textContent = `${profileData.firstName} ${profileData.lastName}`;
            }
        }
    }
}

// Initialize search manager when DOM is loaded
let searchManager;

document.addEventListener('DOMContentLoaded', () => {
    searchManager = new SearchManager();
    searchManager.init();
});