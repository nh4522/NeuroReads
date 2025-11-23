// admin_books.js - COMPLETE FIXED VERSION
document.addEventListener('DOMContentLoaded', () => {
    console.log('Books Management initialized with Django integration');

    // Global variables
    let booksData = [];
    let currentView = 'table';
    let currentPage = 1;
    const booksPerPage = 8;

    // Static paths
    const STATIC_PATHS = {
        eyeIcon: '/static/myapp/icons/eye.png',
        editIcon: '/static/myapp/icons/edit.png',
        deleteIcon: '/static/myapp/icons/delete.png',
        bookPlaceholder: '/static/myapp/images/bookCover/default.jpg'
    };

    // CSRF Token for Django
    function getCSRFToken() {
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Initialize the application
    initApplication();

    async function initApplication() {
        await loadBooks();
        await initCharts();
        initEventListeners();
        applyFilters();
    }

    // DATABASE FUNCTIONS
    async function loadBooks() {
        try {
            showLoading('Loading books...');
            console.log('🔄 Loading all books from API...');
            
            // Try the new endpoint first, fallback to old one
            let response = await fetch('/api/admin/books/all/');
            if (!response.ok) {
                console.log('Trying fallback endpoint...');
                response = await fetch('/api/admin/books/');
            }
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            console.log('📦 API Response:', data);
            
            if (data.success) {
                booksData = data.books || [];
                console.log(`✅ Successfully loaded ${booksData.length} books`);
                
                // Debug: Log first few books to verify data
                if (booksData.length > 0) {
                    console.log('Sample books:', booksData.slice(0, 3));
                } else {
                    console.warn('⚠️ No books found in database');
                }
                
                renderBooks();
                updateBookCount(booksData.length);
                updatePagination(booksData.length);
                hideLoading();
            } else {
                throw new Error(data.error || 'Failed to load books');
            }
        } catch (error) {
            console.error('❌ Error loading books:', error);
            showBootstrapAlert('Error loading books: ' + error.message, 'danger');
            hideLoading();
            
            // Show empty state
            booksData = [];
            renderBooks();
        }
    }

    async function loadBooksStatistics() {
        try {
            console.log('📊 Loading books statistics...');
            const response = await fetch('/api/admin/books/statistics/');
            if (!response.ok) {
                console.warn('Statistics endpoint not available, using fallback data');
                return getFallbackStatistics();
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading books statistics:', error);
            return getFallbackStatistics();
        }
    }

    function getFallbackStatistics() {
        // Generate statistics from loaded books data
        const totalBooks = booksData.length;
        const categoryCount = {};
        
        booksData.forEach(book => {
            const category = book.display_category || book.category || 'Uncategorized';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const categories = Object.keys(categoryCount);
        const categoryCounts = Object.values(categoryCount);

        // Generate monthly data (last 6 months)
        const monthlyLabels = [];
        const monthlyData = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthlyLabels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            // Simple random data for fallback
            monthlyData.push(Math.floor(Math.random() * 20) + 5);
        }

        return {
            success: true,
            statistics: {
                total_books: totalBooks,
                available_books: totalBooks,
                reading_count: Math.floor(totalBooks * 0.2),
                completed_count: Math.floor(totalBooks * 0.3),
                new_this_month: monthlyData[monthlyData.length - 1] || 0
            },
            charts: {
                categories: {
                    labels: categories,
                    data: categoryCounts
                },
                monthly_additions: {
                    labels: monthlyLabels,
                    data: monthlyData
                }
            }
        };
    }

    async function addBook(bookData) {
        const response = await fetch('/api/admin/books/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(bookData)
        });
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to add book');
        }
        return data;
    }

    async function updateBook(bookId, bookData) {
        const response = await fetch(`/api/admin/books/${bookId}/update/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(bookData)
        });
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to update book');
        }
        return data;
    }

    async function deleteBook(bookId) {
        const response = await fetch(`/api/admin/books/${bookId}/delete/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to delete book');
        }
        return data;
    }

    // RENDERING FUNCTIONS
    function renderBooks() {
        console.log(`🔄 Rendering ${booksData.length} books in ${currentView} view`);
        
        if (currentView === 'table') {
            renderTableView();
        } else {
            renderCardView();
        }
    }

    function renderTableView() {
        const tbody = document.querySelector('.nr-books-table tbody');
        if (!tbody) {
            console.error('❌ Table body not found');
            return;
        }

        const filteredBooks = getFilteredBooks();
        const paginatedBooks = getPaginatedBooks(filteredBooks);
        
        console.log(`📊 Table View: ${filteredBooks.length} filtered, ${paginatedBooks.length} paginated`);

        if (paginatedBooks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <div class="text-muted">
                            <i class="fas fa-book fa-2x mb-3"></i>
                            <p>No books found matching your criteria</p>
                            ${booksData.length === 0 ? '<small class="text-warning">No books in database</small>' : ''}
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = paginatedBooks.map(book => `
            <tr data-book-id="${book._id}">
                <td>
                    <div class="nr-book-cover">
                        <img src="${book.cover_image || STATIC_PATHS.bookPlaceholder}" 
                             alt="${book.title}" 
                             onerror="this.src='${STATIC_PATHS.bookPlaceholder}'">
                    </div>
                </td>
                <td>
                    <div class="nr-book-title">${escapeHtml(book.title)}</div>
                    <div class="nr-book-author">${escapeHtml(book.author)}</div>
                    <div class="nr-book-meta">
                        Published: ${book.publication_year || 'N/A'} • 
                        Pages: ${book.pages || 'N/A'} • 
                        Rating: ${book.average_rating || 'N/A'}⭐ •
                        Views: ${book.views_count || 0}
                    </div>
                </td>
                <td>${book.isbn || 'N/A'}</td>
                <td><span class="nr-category-badge ${(book.category || 'general').toLowerCase()}">${book.display_category || book.category || 'Uncategorized'}</span></td>
                <td><span class="nr-status-badge available">Available</span></td>
                <td>${formatDate(book.created_at)}</td>
                <td>
                    <div class="nr-action-buttons">
                        <button class="nr-action-btn view" title="View Details" onclick="viewBook('${book._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="nr-action-btn edit" title="Edit Book" onclick="editBook('${book._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="nr-action-btn delete" title="Delete Book" onclick="deleteBookHandler('${book._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        updatePagination(filteredBooks.length);
    }

    function renderCardView() {
        const cardContainer = document.querySelector('#cardView .row');
        if (!cardContainer) {
            console.error('❌ Card container not found');
            return;
        }

        const filteredBooks = getFilteredBooks();
        const paginatedBooks = getPaginatedBooks(filteredBooks);
        
        console.log(`🃏 Card View: ${filteredBooks.length} filtered, ${paginatedBooks.length} paginated`);

        if (paginatedBooks.length === 0) {
            cardContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="text-muted">
                        <i class="fas fa-book fa-2x mb-3"></i>
                        <p>No books found matching your criteria</p>
                        ${booksData.length === 0 ? '<small class="text-warning">No books in database</small>' : ''}
                    </div>
                </div>
            `;
            return;
        }
        
        cardContainer.innerHTML = paginatedBooks.map(book => `
            <div class="col-xl-3 col-lg-4 col-md-6">
                <div class="card h-100 book-card" data-book-id="${book._id}">
                    <div class="card-img-container">
                        <img src="${book.cover_image || STATIC_PATHS.bookPlaceholder}" 
                             class="card-img-top" 
                             alt="${book.title}"
                             onerror="this.src='${STATIC_PATHS.bookPlaceholder}'">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${escapeHtml(book.title)}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${escapeHtml(book.author)}</h6>
                        <p class="card-text flex-grow-1">${escapeHtml(book.description?.substring(0, 120) || 'No description available.')}...</p>
                        <div class="book-meta mb-2">
                            <small class="text-muted"><i class="fas fa-calendar me-1"></i>Published: ${book.publication_year || 'N/A'}</small><br>
                            <small class="text-muted"><i class="fas fa-file me-1"></i>Pages: ${book.pages || 'N/A'}</small><br>
                            <small class="text-muted"><i class="fas fa-barcode me-1"></i>${book.isbn || 'No ISBN'}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="badge bg-primary">${book.display_category || book.category || 'Uncategorized'}</span>
                            <span class="badge bg-success">Available</span>
                        </div>
                        <div class="mt-3 d-grid gap-2">
                            <button class="btn btn-outline-primary btn-sm view-book-btn" onclick="viewBook('${book._id}')">
                                <i class="fas fa-eye me-1"></i>View Details
                            </button>
                            <div class="btn-group" role="group">
                                <button class="btn btn-outline-secondary btn-sm edit-book-btn" onclick="editBook('${book._id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm delete-book-btn" onclick="deleteBookHandler('${book._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        updateCardPagination(filteredBooks.length);
    }

    // FILTERING AND PAGINATION
    function getFilteredBooks() {
        const category = document.getElementById('categoryFilter').value;
        const status = document.getElementById('statusFilter').value;
        const search = document.getElementById('searchBooks').value.toLowerCase();
        const sort = document.getElementById('sortBooks').value;

        let filtered = booksData.filter(book => {
            const matchesCategory = !category || 
                (book.category && book.category.toLowerCase().includes(category.toLowerCase())) ||
                (book.display_category && book.display_category.toLowerCase().includes(category.toLowerCase())) ||
                (book.genre && book.genre.some(g => g.toLowerCase().includes(category.toLowerCase())));
            
            const matchesSearch = !search ||
                book.title.toLowerCase().includes(search) ||
                book.author.toLowerCase().includes(search) ||
                (book.isbn && book.isbn.toLowerCase().includes(search)) ||
                (book.description && book.description.toLowerCase().includes(search));
            
            return matchesCategory && matchesSearch;
        });

        // Sort books
        filtered.sort((a, b) => {
            switch (sort) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'popular':
                    return (b.views_count || 0) - (a.views_count || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }

    function getPaginatedBooks(books) {
        const startIndex = (currentPage - 1) * booksPerPage;
        return books.slice(startIndex, startIndex + booksPerPage);
    }

    function updatePagination(totalBooks) {
        const totalPages = Math.ceil(totalBooks / booksPerPage);
        const paginationInfo = document.querySelector('.nr-pagination-info');
        const paginationControls = document.querySelector('.nr-pagination-controls');
        
        if (paginationInfo) {
            const start = totalBooks === 0 ? 0 : (currentPage - 1) * booksPerPage + 1;
            const end = Math.min(currentPage * booksPerPage, totalBooks);
            paginationInfo.textContent = `Showing ${start}-${end} of ${totalBooks} books`;
        }

        if (paginationControls) {
            let paginationHTML = `
                <button class="nr-pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
                    Previous
                </button>
            `;

            // Show limited pagination buttons
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `
                    <button class="nr-pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                        ${i}
                    </button>
                `;
            }

            paginationHTML += `
                <button class="nr-pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
                    Next
                </button>
            `;

            paginationControls.innerHTML = paginationHTML;
        }
    }

    function updateCardPagination(totalBooks) {
        const totalPages = Math.ceil(totalBooks / booksPerPage);
        const pagination = document.querySelector('#cardView .pagination');
        
        if (pagination) {
            let paginationHTML = `
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Previous</a>
                </li>
            `;

            // Show limited pagination buttons
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                    </li>
                `;
            }

            paginationHTML += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Next</a>
                </li>
            `;

            pagination.innerHTML = paginationHTML;
        }
    }

    // CHART FUNCTIONS
    async function initCharts() {
        try {
            const statsData = await loadBooksStatistics();
            if (statsData.success) {
                createCategoryChart(statsData.charts.categories);
                createMonthlyAdditionsChart(statsData.charts.monthly_additions);
                updateStatisticsCards(statsData.statistics);
            }
        } catch (error) {
            console.error('Error initializing charts:', error);
            // Use fallback data
            const fallbackData = getFallbackStatistics();
            createCategoryChart(fallbackData.charts.categories);
            createMonthlyAdditionsChart(fallbackData.charts.monthly_additions);
            updateStatisticsCards(fallbackData.statistics);
        }
    }

    function createCategoryChart(categoryData = null) {
        const categoryCtx = document.getElementById('booksCategoryChart');
        if (!categoryCtx) {
            console.warn('Category chart canvas not found');
            return;
        }

        let labels, data;
        
        if (categoryData && categoryData.labels && categoryData.labels.length > 0) {
            labels = categoryData.labels;
            data = categoryData.data;
        } else {
            // Fallback: generate from books data
            const categoryCount = {};
            booksData.forEach(book => {
                const category = book.display_category || book.category || 'Uncategorized';
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });

            labels = Object.keys(categoryCount);
            data = Object.values(categoryCount);
        }

        // Limit to top 10 categories for better visualization
        const topCategories = labels.slice(0, 10);
        const topData = data.slice(0, 10);

        new Chart(categoryCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: topCategories,
                datasets: [{
                    label: 'Number of Books',
                    data: topData,
                    backgroundColor: [
                        '#297a79', '#34b4a9', '#5cd6cd', '#8ae3dc', '#b8f0eb',
                        '#e0f2f1', '#a7d8d6', '#7bbdb9', '#4fa29d', '#238780'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Books: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Books'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Categories'
                        }
                    }
                }
            }
        });
    }

    function createMonthlyAdditionsChart(monthlyData = null) {
        const monthlyCtx = document.getElementById('monthlyAdditionsChart');
        if (!monthlyCtx) {
            console.warn('Monthly additions chart canvas not found');
            return;
        }

        let labels, data;
        
        if (monthlyData && monthlyData.labels && monthlyData.labels.length > 0) {
            labels = monthlyData.labels;
            data = monthlyData.data;
        } else {
            // Fallback sample data
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            data = [15, 22, 18, 25, 30, 28];
        }

        new Chart(monthlyCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Books Added',
                    data: data,
                    borderColor: '#297a79',
                    backgroundColor: 'rgba(41, 122, 121, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#297a79',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Books: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Books Added'
                        }
                    }
                }
            }
        });
    }

    function updateStatisticsCards(statistics) {
        if (!statistics) return;
        
        // Update statistics cards
        const cards = document.querySelectorAll('.card-title');
        if (cards.length >= 4) {
            cards[0].textContent = statistics.total_books.toLocaleString();
            cards[1].textContent = statistics.available_books.toLocaleString();
            cards[2].textContent = statistics.reading_count.toLocaleString();
            cards[3].textContent = statistics.new_this_month.toLocaleString();
        }
        
        // Update card subtitles
        const cardTexts = document.querySelectorAll('.card-text');
        cardTexts.forEach((card, index) => {
            const small = card.nextElementSibling;
            if (small && small.classList.contains('text-success')) {
                if (index === 0) {
                    small.textContent = `+${statistics.new_this_month} this month`;
                } else if (index === 1) {
                    small.textContent = `${Math.round((statistics.available_books / statistics.total_books) * 100)}% of collection`;
                }
            }
        });
    }

    // EVENT HANDLERS
    function initEventListeners() {
        // Add Book Button
        const addBookBtn = document.getElementById('addBookBtn');
        if (addBookBtn) {
            addBookBtn.addEventListener('click', showBootstrapAddBookModal);
        }

        // Import Books Button
        const importBooksBtn = document.getElementById('importBooksBtn');
        if (importBooksBtn) {
            importBooksBtn.addEventListener('click', showImportModal);
        }

        // Export Books Button
        const exportBooksBtn = document.getElementById('exportBooksBtn');
        if (exportBooksBtn) {
            exportBooksBtn.addEventListener('click', exportBooks);
        }

        // Print Books Button
        const printBooksBtn = document.getElementById('printBooksBtn');
        if (printBooksBtn) {
            printBooksBtn.addEventListener('click', () => window.print());
        }

        // Refresh Books Button
        const refreshBooksBtn = document.getElementById('refreshBooksBtn');
        if (refreshBooksBtn) {
            refreshBooksBtn.addEventListener('click', () => {
                const refreshBtn = refreshBooksBtn;
                const originalHTML = refreshBtn.innerHTML;
                
                refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Refreshing...';
                refreshBtn.disabled = true;
                
                loadBooks().finally(() => {
                    refreshBtn.innerHTML = originalHTML;
                    refreshBtn.disabled = false;
                    showBootstrapAlert('Books refreshed successfully!', 'success');
                });
            });
        }

        // Reset Filters
        const resetFilters = document.getElementById('resetFilters');
        if (resetFilters) {
            resetFilters.addEventListener('click', resetAllFilters);
        }

        // Filter functionality
        const filters = ['categoryFilter', 'statusFilter', 'searchBooks', 'sortBooks'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', applyFilters);
                if (filterId === 'searchBooks') {
                    filter.addEventListener('input', debounce(applyFilters, 300));
                }
            }
        });

        // View Toggle
        initViewToggle();
    }

    function initViewToggle() {
        const tableViewBtn = document.getElementById('tableViewBtn');
        const cardViewBtn = document.getElementById('cardViewBtn');
        const tableView = document.getElementById('tableView');
        const cardView = document.getElementById('cardView');

        if (tableViewBtn && cardViewBtn) {
            tableViewBtn.addEventListener('click', () => {
                currentView = 'table';
                tableViewBtn.classList.add('active');
                cardViewBtn.classList.remove('active');
                if (tableView) tableView.classList.remove('d-none');
                if (cardView) cardView.classList.add('d-none');
                renderBooks();
            });

            cardViewBtn.addEventListener('click', () => {
                currentView = 'card';
                cardViewBtn.classList.add('active');
                tableViewBtn.classList.remove('active');
                if (cardView) cardView.classList.remove('d-none');
                if (tableView) tableView.classList.add('d-none');
                renderBooks();
            });
        }
    }

    // BOOK OPERATIONS
    async function handleAddBook(formData) {
        const addBtn = document.getElementById('confirmAddBook');
        const originalText = addBtn.innerHTML;
        
        addBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Adding...';
        addBtn.disabled = true;

        try {
            await addBook(formData);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'));
            if (modal) modal.hide();
            
            showBootstrapAlert('Book added successfully!', 'success');
            await loadBooks(); // Reload books
            
        } catch (error) {
            showBootstrapAlert('Error adding book: ' + error.message, 'danger');
        } finally {
            addBtn.innerHTML = originalText;
            addBtn.disabled = false;
        }
    }

    async function handleEditBook(bookId, bookData) {
        try {
            await updateBook(bookId, bookData);
            showBootstrapAlert('Book updated successfully!', 'success');
            await loadBooks(); // Reload books
            return true;
        } catch (error) {
            showBootstrapAlert('Error updating book: ' + error.message, 'danger');
            return false;
        }
    }

    async function handleDeleteBook(bookId) {
        try {
            await deleteBook(bookId);
            showBootstrapAlert('Book deleted successfully!', 'success');
            await loadBooks(); // Reload books
            return true;
        } catch (error) {
            showBootstrapAlert('Error deleting book: ' + error.message, 'danger');
            return false;
        }
    }

    // UTILITY FUNCTIONS
    function applyFilters() {
        currentPage = 1;
        renderBooks();
    }

    function resetAllFilters() {
        document.getElementById('categoryFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('searchBooks').value = '';
        document.getElementById('sortBooks').value = 'newest';
        currentPage = 1;
        applyFilters();
        showBootstrapAlert('All filters have been reset', 'info');
    }

    function updateBookCount(total) {
        const countElement = document.querySelector('.nr-table-title');
        if (countElement) {
            countElement.textContent = `Book Collection (${total} books)`;
        }
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    }

    function showLoading(message = 'Loading...') {
        let loading = document.getElementById('loadingIndicator');
        if (!loading) {
            loading = document.createElement('div');
            loading.id = 'loadingIndicator';
            loading.className = 'alert alert-info d-flex align-items-center';
            loading.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2"></span>
                ${message}
            `;
            const main = document.querySelector('.nr-main');
            if (main) main.prepend(loading);
        }
    }

    function hideLoading() {
        const loading = document.getElementById('loadingIndicator');
        if (loading) {
            loading.remove();
        }
    }

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

    function exportBooks() {
        const exportBtn = document.getElementById('exportBooksBtn');
        const originalHTML = exportBtn.innerHTML;
        
        exportBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Exporting...';
        exportBtn.disabled = true;
        
        try {
            const csvContent = convertToCSV(booksData);
            downloadCSV(csvContent, `books_export_${new Date().toISOString().split('T')[0]}.csv`);
            showBootstrapAlert('Books exported successfully!', 'success');
        } catch (error) {
            showBootstrapAlert('Error exporting books: ' + error.message, 'danger');
        } finally {
            exportBtn.innerHTML = originalHTML;
            exportBtn.disabled = false;
        }
    }

    function convertToCSV(books) {
        const headers = ['Title', 'Author', 'ISBN', 'Category', 'Publication Year', 'Pages', 'Publisher', 'Language', 'Rating', 'Views'];
        const rows = books.map(book => [
            `"${book.title}"`,
            `"${book.author}"`,
            `"${book.isbn}"`,
            `"${book.category}"`,
            book.publication_year,
            book.pages,
            `"${book.publisher}"`,
            `"${book.language}"`,
            book.average_rating,
            book.views_count
        ]);
        
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    function downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // GLOBAL FUNCTIONS (attached to window for HTML onclick)
    window.changePage = function(page) {
        currentPage = page;
        renderBooks();
        // Scroll to top of books section
        const booksSection = document.querySelector('.nr-books-table-container') || document.querySelector('#cardView');
        if (booksSection) {
            booksSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    window.viewBook = function(bookId) {
        const book = booksData.find(b => b._id === bookId);
        if (book) {
            showBootstrapBookDetailsModal(book);
        }
    };

    window.editBook = function(bookId) {
        const book = booksData.find(b => b._id === bookId);
        if (book) {
            showBootstrapEditBookModal(book);
        }
    };

    window.deleteBookHandler = function(bookId) {
        const book = booksData.find(b => b._id === bookId);
        if (book) {
            showBootstrapDeleteConfirmation(book);
        }
    };

    // MODAL FUNCTIONS
    function showBootstrapAddBookModal() {
        const modalHTML = `
            <div class="modal fade" id="addBookModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Add New Book</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addBookForm">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Book Title *</label>
                                        <input type="text" class="form-control" name="title" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Author *</label>
                                        <input type="text" class="form-control" name="author" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">ISBN</label>
                                        <input type="text" class="form-control" name="isbn">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Category *</label>
                                        <select class="form-select" name="category" required>
                                            <option value="">Select Category</option>
                                            <option value="fiction">Fiction</option>
                                            <option value="non-fiction">Non-Fiction</option>
                                            <option value="science">Science</option>
                                            <option value="technology">Technology</option>
                                            <option value="history">History</option>
                                            <option value="literature">Literature</option>
                                            <option value="psychology">Psychology</option>
                                            <option value="bestseller">Bestseller</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Publication Year</label>
                                        <input type="number" class="form-control" name="publication_year" min="1000" max="2030">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Pages</label>
                                        <input type="number" class="form-control" name="pages" min="1">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Publisher</label>
                                        <input type="text" class="form-control" name="publisher">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Language</label>
                                        <input type="text" class="form-control" name="language" value="English">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Cover Image URL</label>
                                        <input type="text" class="form-control" name="cover_image" placeholder="https://...">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">PDF URL</label>
                                        <input type="text" class="form-control" name="pdf_url" placeholder="/static/myapp/books/book.pdf">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Description</label>
                                        <textarea class="form-control" name="description" rows="3" placeholder="Enter book description"></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirmAddBook">Add Book</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('addBookModal');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('addBookModal'));
        modal.show();

        // Add event listener for the new modal
        document.getElementById('confirmAddBook').addEventListener('click', () => {
            const form = document.getElementById('addBookForm');
            const formData = new FormData(form);
            
            const bookData = {
                title: formData.get('title'),
                author: formData.get('author'),
                isbn: formData.get('isbn'),
                category: formData.get('category'),
                display_category: formData.get('category'),
                description: formData.get('description'),
                publication_year: formData.get('publication_year') ? parseInt(formData.get('publication_year')) : null,
                pages: formData.get('pages') ? parseInt(formData.get('pages')) : null,
                publisher: formData.get('publisher'),
                language: formData.get('language'),
                cover_image: formData.get('cover_image') || '/static/myapp/images/bookCover/default.jpg',
                pdf_url: formData.get('pdf_url')
            };

            handleAddBook(bookData);
        });

        // Clean up modal on hide
        document.getElementById('addBookModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    function showBootstrapBookDetailsModal(book) {
        const modalHTML = `
            <div class="modal fade" id="bookDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Book Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <img src="${book.cover_image || STATIC_PATHS.bookPlaceholder}" 
                                         class="img-fluid rounded" 
                                         alt="${book.title}"
                                         onerror="this.src='${STATIC_PATHS.bookPlaceholder}'">
                                </div>
                                <div class="col-md-8">
                                    <h4>${escapeHtml(book.title)}</h4>
                                    <h6 class="text-muted">by ${escapeHtml(book.author)}</h6>
                                    <div class="mt-3">
                                        <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
                                        <p><strong>Category:</strong> <span class="badge bg-primary">${book.display_category || book.category || 'Uncategorized'}</span></p>
                                        <p><strong>Publication Year:</strong> ${book.publication_year || 'N/A'}</p>
                                        <p><strong>Pages:</strong> ${book.pages || 'N/A'}</p>
                                        <p><strong>Publisher:</strong> ${book.publisher || 'N/A'}</p>
                                        <p><strong>Language:</strong> ${book.language || 'English'}</p>
                                        <p><strong>Rating:</strong> ${book.average_rating || 'N/A'} ⭐</p>
                                        <p><strong>Views:</strong> ${book.views_count || 0}</p>
                                        <p><strong>Added:</strong> ${formatDate(book.created_at)}</p>
                                    </div>
                                    <div class="mt-3">
                                        <strong>Description:</strong>
                                        <p class="mt-2">${escapeHtml(book.description) || 'No description available.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="editBook('${book._id}')">Edit Book</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));
        modal.show();
        
        document.getElementById('bookDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    function showBootstrapEditBookModal(book) {
        const modalHTML = `
            <div class="modal fade" id="editBookModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Book: ${escapeHtml(book.title)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editBookForm">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Book Title *</label>
                                        <input type="text" class="form-control" name="title" value="${escapeHtml(book.title)}" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Author *</label>
                                        <input type="text" class="form-control" name="author" value="${escapeHtml(book.author)}" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">ISBN</label>
                                        <input type="text" class="form-control" name="isbn" value="${book.isbn || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Category *</label>
                                        <select class="form-select" name="category" required>
                                            <option value="fiction" ${(book.category === 'fiction' || book.display_category === 'fiction') ? 'selected' : ''}>Fiction</option>
                                            <option value="non-fiction" ${(book.category === 'non-fiction' || book.display_category === 'non-fiction') ? 'selected' : ''}>Non-Fiction</option>
                                            <option value="science" ${(book.category === 'science' || book.display_category === 'science') ? 'selected' : ''}>Science</option>
                                            <option value="technology" ${(book.category === 'technology' || book.display_category === 'technology') ? 'selected' : ''}>Technology</option>
                                            <option value="history" ${(book.category === 'history' || book.display_category === 'history') ? 'selected' : ''}>History</option>
                                            <option value="literature" ${(book.category === 'literature' || book.display_category === 'literature') ? 'selected' : ''}>Literature</option>
                                            <option value="psychology" ${(book.category === 'psychology' || book.display_category === 'psychology') ? 'selected' : ''}>Psychology</option>
                                            <option value="bestseller" ${(book.category === 'bestseller' || book.display_category === 'bestseller') ? 'selected' : ''}>Bestseller</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Publication Year</label>
                                        <input type="number" class="form-control" name="publication_year" value="${book.publication_year || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Pages</label>
                                        <input type="number" class="form-control" name="pages" value="${book.pages || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Publisher</label>
                                        <input type="text" class="form-control" name="publisher" value="${book.publisher || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Language</label>
                                        <input type="text" class="form-control" name="language" value="${book.language || 'English'}">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Cover Image URL</label>
                                        <input type="text" class="form-control" name="cover_image" value="${book.cover_image || ''}">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">PDF URL</label>
                                        <input type="text" class="form-control" name="pdf_url" value="${book.pdf_url || ''}">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Description</label>
                                        <textarea class="form-control" name="description" rows="3">${escapeHtml(book.description) || ''}</textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirmEditBook">Update Book</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('editBookModal'));
        modal.show();

        document.getElementById('confirmEditBook').addEventListener('click', async () => {
            const form = document.getElementById('editBookForm');
            const formData = new FormData(form);
            
            const bookData = {
                title: formData.get('title'),
                author: formData.get('author'),
                isbn: formData.get('isbn'),
                category: formData.get('category'),
                display_category: formData.get('category'),
                description: formData.get('description'),
                publication_year: formData.get('publication_year') ? parseInt(formData.get('publication_year')) : null,
                pages: formData.get('pages') ? parseInt(formData.get('pages')) : null,
                publisher: formData.get('publisher'),
                language: formData.get('language'),
                cover_image: formData.get('cover_image'),
                pdf_url: formData.get('pdf_url')
            };

            const editBtn = document.getElementById('confirmEditBook');
            const originalText = editBtn.innerHTML;
            
            editBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Updating...';
            editBtn.disabled = true;

            const success = await handleEditBook(book._id, bookData);
            
            if (success) {
                modal.hide();
            }
            
            editBtn.innerHTML = originalText;
            editBtn.disabled = false;
        });

        document.getElementById('editBookModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    function showBootstrapDeleteConfirmation(book) {
        const modalHTML = `
            <div class="modal fade" id="deleteBookModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title text-danger">Confirm Delete</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to delete the following book?</p>
                            <div class="alert alert-warning">
                                <strong>${escapeHtml(book.title)}</strong><br>
                                <em>by ${escapeHtml(book.author)}</em>
                            </div>
                            <p class="text-danger"><small>This action cannot be undone.</small></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmDeleteBook">Delete Book</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('deleteBookModal'));
        modal.show();

        document.getElementById('confirmDeleteBook').addEventListener('click', async () => {
            const deleteBtn = document.getElementById('confirmDeleteBook');
            const originalText = deleteBtn.innerHTML;
            
            deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
            deleteBtn.disabled = true;

            const success = await handleDeleteBook(book._id);
            
            if (success) {
                modal.hide();
            }
            
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        });

        document.getElementById('deleteBookModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    function showImportModal() {
        const modalHTML = `
            <div class="modal fade" id="importBooksModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Import Books</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Bulk import books using JSON format. Each book should have at least title and author.</p>
                            <textarea class="form-control" rows="10" placeholder='[{"title": "Book Title", "author": "Author Name", "category": "fiction", ...}]' id="importBooksData"></textarea>
                            <div class="mt-2">
                                <small class="text-muted">Example format:</small>
                                <pre class="bg-light p-2 small">[
  {
    "title": "Book Title",
    "author": "Author Name", 
    "category": "fiction",
    "publication_year": 2020,
    "pages": 300,
    "publisher": "Publisher Name"
  }
]</pre>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirmImportBooks">Import Books</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('importBooksModal'));
        modal.show();

        document.getElementById('confirmImportBooks').addEventListener('click', async () => {
            const importData = document.getElementById('importBooksData').value;
            
            if (!importData) {
                showBootstrapAlert('Please enter book data to import', 'warning');
                return;
            }

            try {
                const booksData = JSON.parse(importData);
                const importBtn = document.getElementById('confirmImportBooks');
                const originalText = importBtn.innerHTML;
                
                importBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Importing...';
                importBtn.disabled = true;

                const response = await fetch('/api/admin/books/bulk-import/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify({ books: booksData })
                });

                const data = await response.json();
                
                if (data.success) {
                    modal.hide();
                    showBootstrapAlert(`Successfully imported ${data.imported_count} books`, 'success');
                    await loadBooks(); // Reload books
                } else {
                    showBootstrapAlert('Error importing books: ' + (data.error || 'Unknown error'), 'danger');
                }

                importBtn.innerHTML = originalText;
                importBtn.disabled = false;

            } catch (error) {
                showBootstrapAlert('Invalid JSON format: ' + error.message, 'danger');
            }
        });

        document.getElementById('importBooksModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    function showBootstrapAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const main = document.querySelector('.nr-main');
        if (main) {
            main.insertAdjacentElement('afterbegin', alertDiv);
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                const bsAlert = new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }
        }, 5000);
    }
});

