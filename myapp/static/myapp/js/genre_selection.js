// static/myapp/js/genre_selection.js
class GenreSelectionManager {
    constructor() {
        this.allGenres = [];
        this.selectedGenres = [];
        this.init();
    }

    async init() {
        console.log('🎯 Initializing Genre Selection Manager');
        await this.loadAllGenres();
        this.setupEventListeners();
        this.loadUserCurrentGenres();
    }

    async loadAllGenres() {
        try {
            const response = await fetch('/api/genres/all/');
            const result = await response.json();
            
            if (result.success) {
                this.allGenres = result.genres;
                console.log(`📚 Loaded ${this.allGenres.length} genres`);
                this.renderGenreSelection();
            } else {
                console.error('Failed to load genres:', result.error);
            }
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }

    loadUserCurrentGenres() {
        // Get current user genres from the page data
        const genreElements = document.querySelectorAll('.genre-tag.selected');
        this.selectedGenres = Array.from(genreElements).map(el => 
            el.getAttribute('data-genre')
        );
        console.log('📋 Current selected genres:', this.selectedGenres);
    }

    renderGenreSelection() {
        const container = document.getElementById('genresContainer');
        if (!container) return;

        container.innerHTML = '';

        this.allGenres.forEach(genre => {
            const isSelected = this.selectedGenres.includes(genre);
            const genreElement = document.createElement('div');
            genreElement.className = `genre-tag ${isSelected ? 'selected' : ''}`;
            genreElement.setAttribute('data-genre', genre);
            genreElement.innerHTML = `
                <span>${genre}</span>
                ${isSelected ? '<i class="bi bi-check-lg"></i>' : ''}
            `;
            
            genreElement.addEventListener('click', () => this.toggleGenre(genre, genreElement));
            container.appendChild(genreElement);
        });

        this.updateSelectionCount();
    }

    toggleGenre(genre, element) {
        const index = this.selectedGenres.indexOf(genre);
        
        if (index === -1) {
            // Add genre (limit to 10)
            if (this.selectedGenres.length >= 10) {
                this.showNotification('Maximum 10 genres allowed', 'warning');
                return;
            }
            this.selectedGenres.push(genre);
            element.classList.add('selected');
            element.innerHTML = `<span>${genre}</span><i class="bi bi-check-lg"></i>`;
        } else {
            // Remove genre
            this.selectedGenres.splice(index, 1);
            element.classList.remove('selected');
            element.innerHTML = `<span>${genre}</span>`;
        }

        this.updateSelectionCount();
        console.log('📋 Updated selected genres:', this.selectedGenres);
    }

    updateSelectionCount() {
        const countElement = document.getElementById('selectedGenresCount');
        if (countElement) {
            countElement.textContent = `${this.selectedGenres.length}/10 genres selected`;
        }
    }

    async saveFavoriteGenres() {
        try {
            const saveBtn = document.getElementById('saveGenresBtn');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="bi bi-arrow-repeat spinner"></i> Saving...';
            }

            const response = await fetch('/api/profile/favorite-genres/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                    favorite_genres: this.selectedGenres
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Favorite genres updated successfully!', 'success');
            } else {
                throw new Error(result.error || 'Failed to save genres');
            }

        } catch (error) {
            console.error('❌ Error saving genres:', error);
            this.showNotification('Failed to save genres: ' + error.message, 'error');
        } finally {
            const saveBtn = document.getElementById('saveGenresBtn');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Favorite Genres';
            }
        }
    }

    setupEventListeners() {
        const saveBtn = document.getElementById('saveGenresBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveFavoriteGenres());
        }

        // Search functionality for genres
        const searchInput = document.getElementById('genreSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterGenres(e.target.value));
        }
    }

    filterGenres(searchTerm) {
        const genreTags = document.querySelectorAll('.genre-tag');
        const term = searchTerm.toLowerCase();
        
        genreTags.forEach(tag => {
            const genre = tag.getAttribute('data-genre').toLowerCase();
            if (genre.includes(term)) {
                tag.style.display = 'flex';
            } else {
                tag.style.display = 'none';
            }
        });
    }

    showNotification(message, type = 'info') {
        // Use your existing notification system
        if (window.settingsManager && window.settingsManager.showNotification) {
            window.settingsManager.showNotification(message, type);
        } else {
            // Fallback notification
            alert(message);
        }
    }

    getCsrfToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing GenreSelectionManager...');
    window.genreManager = new GenreSelectionManager();
});