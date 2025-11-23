class PDFReader {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = BOOK_DATA.current_page;
        this.totalPages = BOOK_DATA.total_pages;
        this.scale = 1.5;
        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.readingStartTime = Date.now();
        this.isFullscreen = false;
        
        console.log('🎯 PDF Reader Initialized:', {
            book: BOOK_DATA.title,
            pdfUrl: BOOK_DATA.pdf_url,
            currentPage: this.currentPage,
            totalPages: this.totalPages
        });
        
        this.initializeReader();
        this.loadPDF();
        this.setupEventListeners();
        this.startAutoSave();
    }

    initializeReader() {
        // Set book title and author
        document.getElementById('bookTitle').textContent = BOOK_DATA.title;
        document.getElementById('bookAuthor').textContent = `By ${BOOK_DATA.author}`;
        
        // Load settings from localStorage
        this.loadSettings();
        
        // Update initial progress
        this.updateProgress();
    }

    async loadPDF() {
        try {
            this.showLoading();
            
            console.log('📥 Loading PDF from:', BOOK_DATA.pdf_url);
            
            // Load PDF document directly from the static URL
            this.pdfDoc = await pdfjsLib.getDocument(BOOK_DATA.pdf_url).promise;
            this.totalPages = this.pdfDoc.numPages;
            
            console.log('✅ PDF loaded successfully. Total pages:', this.totalPages);
            
            // Update page counters
            document.getElementById('totalPages').textContent = this.totalPages;
            document.getElementById('totalPagesFooter').textContent = this.totalPages;
            
            // Validate current page
            if (this.currentPage > this.totalPages) {
                this.currentPage = 1;
            }
            
            // Load the current page
            await this.renderPage(this.currentPage);
            this.hideLoading();
            
        } catch (error) {
            console.error('❌ Error loading PDF:', error);
            this.showError(`Failed to load PDF: ${error.message}`);
        }
    }

    async renderPage(pageNum) {
        if (!this.pdfDoc || pageNum < 1 || pageNum > this.totalPages) return;
        
        try {
            this.showLoading();
            
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale });
            
            // Apply page fit settings
            this.applyPageFit(viewport);
            
            // Set canvas dimensions
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;
            
            // Render PDF page
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            this.currentPage = pageNum;
            this.updateUI();
            this.hideLoading();
            this.saveProgress();
            
        } catch (error) {
            console.error('❌ Error rendering page:', error);
            this.showError('Failed to render page');
        }
    }

    applyPageFit(viewport) {
        const container = document.querySelector('.pdf-container');
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        
        const fitMode = document.getElementById('pageFit').value;
        
        switch (fitMode) {
            case 'width':
                this.scale = containerWidth / viewport.width;
                break;
            case 'height':
                this.scale = containerHeight / viewport.height;
                break;
            case 'auto':
            default:
                const widthScale = containerWidth / viewport.width;
                const heightScale = containerHeight / viewport.height;
                this.scale = Math.min(widthScale, heightScale, 2.0);
                break;
        }
        
        // Ensure scale is within reasonable bounds
        this.scale = Math.max(0.5, Math.min(3.0, this.scale));
        
        // Update the zoom display
        const zoomPercent = Math.round(this.scale * 100);
        document.getElementById('fontSize').value = zoomPercent;
        document.getElementById('fontSizeValue').textContent = zoomPercent + '%';
    }

    updateUI() {
        // Update page numbers
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('pageInput').value = this.currentPage;
        
        // Update progress
        this.updateProgress();
        
        // Update button states
        const prevButtons = [
            document.getElementById('prevPage'),
            document.getElementById('prevPageFooter'),
            document.getElementById('firstPage')
        ];
        
        const nextButtons = [
            document.getElementById('nextPage'),
            document.getElementById('nextPageFooter'),
            document.getElementById('lastPage')
        ];
        
        prevButtons.forEach(btn => {
            btn.disabled = this.currentPage <= 1;
        });
        
        nextButtons.forEach(btn => {
            btn.disabled = this.currentPage >= this.totalPages;
        });
    }

    updateProgress() {
        const progress = (this.currentPage / this.totalPages) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressPercent').textContent = `${Math.round(progress)}%`;
        
        // Update reading time
        this.updateReadingTime();
    }

    updateReadingTime() {
        const readingTimeMs = Date.now() - this.readingStartTime;
        const readingTimeMin = Math.floor(readingTimeMs / 60000);
        document.getElementById('readingTime').textContent = `Reading time: ${readingTimeMin}min`;
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.renderPage(this.currentPage + 1);
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.renderPage(this.currentPage - 1);
        }
    }

    goToPage(pageNum) {
        const page = parseInt(pageNum);
        if (page >= 1 && page <= this.totalPages) {
            this.renderPage(page);
        }
    }

    zoomIn() {
        this.scale = Math.min(this.scale + 0.25, 3.0);
        this.renderPage(this.currentPage);
    }

    zoomOut() {
        this.scale = Math.max(this.scale - 0.25, 0.5);
        this.renderPage(this.currentPage);
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            document.documentElement.requestFullscreen?.();
            this.isFullscreen = true;
            document.getElementById('fullscreen').innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen?.();
            this.isFullscreen = false;
            document.getElementById('fullscreen').innerHTML = '<i class="fas fa-expand"></i>';
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('pdfCanvas').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('pdfCanvas').classList.remove('hidden');
    }

    showError(message = 'Failed to load PDF') {
        document.getElementById('loading').classList.add('hidden');
        const errorDiv = document.getElementById('error');
        errorDiv.querySelector('#errorMessage').textContent = message;
        errorDiv.classList.remove('hidden');
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());
        document.getElementById('prevPage').addEventListener('click', () => this.prevPage());
        document.getElementById('nextPageFooter').addEventListener('click', () => this.nextPage());
        document.getElementById('prevPageFooter').addEventListener('click', () => this.prevPage());
        document.getElementById('firstPage').addEventListener('click', () => this.goToPage(1));
        document.getElementById('lastPage').addEventListener('click', () => this.goToPage(this.totalPages));

        // Page input
        document.getElementById('pageInput').addEventListener('change', (e) => {
            this.goToPage(e.target.value);
        });

        // Page input - allow Enter key
        document.getElementById('pageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.goToPage(e.target.value);
            }
        });

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());

        // Fullscreen
        document.getElementById('fullscreen').addEventListener('click', () => this.toggleFullscreen());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Don't trigger if user is typing in input
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextPage();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevPage();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToPage(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToPage(this.totalPages);
                    break;
                case 'Escape':
                    if (this.isFullscreen) {
                        this.toggleFullscreen();
                    }
                    break;
            }
        });

        // Close reader
        document.getElementById('closeReader').addEventListener('click', () => {
            this.saveProgress(true); // Force save before closing
            window.close();
        });

        // Settings modal
        document.getElementById('settings').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());

        // Settings controls
        document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
        document.getElementById('fontSize').addEventListener('input', (e) => this.changeFontSize(e.target.value));
        document.getElementById('pageFit').addEventListener('change', (e) => {
            this.changePageFit(e.target.value);
            this.renderPage(this.currentPage); // Re-render with new fit
        });

        // Retry button
        document.getElementById('retryLoad').addEventListener('click', () => this.loadPDF());

        // Handle page visibility changes for auto-save
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveProgress(true);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.pdfDoc) {
                this.renderPage(this.currentPage);
            }
        });
    }

    openSettings() {
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    changeTheme(theme) {
        document.body.className = theme + '-theme';
        this.saveSetting('theme', theme);
    }

    changeFontSize(size) {
        this.scale = size / 100;
        document.getElementById('fontSizeValue').textContent = size + '%';
        this.renderPage(this.currentPage);
        this.saveSetting('fontSize', size);
    }

    changePageFit(fit) {
        this.saveSetting('pageFit', fit);
    }

    loadSettings() {
        const theme = localStorage.getItem('pdfReader_theme') || 'light';
        const fontSize = localStorage.getItem('pdfReader_fontSize') || '100';
        const pageFit = localStorage.getItem('pdfReader_pageFit') || 'auto';
        
        document.getElementById('themeSelect').value = theme;
        document.getElementById('fontSize').value = fontSize;
        document.getElementById('fontSizeValue').textContent = fontSize + '%';
        document.getElementById('pageFit').value = pageFit;
        
        this.changeTheme(theme);
        this.scale = fontSize / 100;
    }

    saveSetting(key, value) {
        localStorage.setItem(`pdfReader_${key}`, value);
    }

    async saveProgress(force = false) {
        // Only save every 30 seconds unless forced
        if (!force && Date.now() - (this.lastSaveTime || 0) < 30000) return;
        
        try {
            const progress = Math.round((this.currentPage / this.totalPages) * 100);
            
            const response = await fetch('/api/books/save-progress/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                },
                body: JSON.stringify({
                    book_id: BOOK_DATA.id,
                    current_page: this.currentPage,
                    total_pages: this.totalPages,
                    progress: progress
                })
            });

            if (response.ok) {
                this.lastSaveTime = Date.now();
                this.updateLastSaved();
                console.log('💾 Progress saved:', { page: this.currentPage, progress: progress + '%' });
            } else {
                console.error('❌ Failed to save progress');
            }
        } catch (error) {
            console.error('❌ Error saving progress:', error);
        }
    }

    updateLastSaved() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('lastSaved').textContent = `Last saved: ${timeString}`;
    }

    startAutoSave() {
        // Auto-save every minute
        setInterval(() => this.saveProgress(), 60000);
    }

    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }
}

// Initialize the PDF reader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.pdfReader = new PDFReader();
});