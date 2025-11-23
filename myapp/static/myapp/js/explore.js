// myapp/static/myapp/js/explore.js - COMPLETE FIXED VERSION
document.addEventListener('DOMContentLoaded', () => {
    initializeExplore();
});

function initializeExplore() {
    loadBooks();
    setupEventListeners();
}

// Debug function to check books loading
async function debugBooksLoading() {
    try {
        console.log('🔍 DEBUG: Checking books API...');
        const response = await fetch('/api/books/');
        console.log('🔍 DEBUG: API Response status:', response.status);
        
        if (!response.ok) {
            console.error('🔍 DEBUG: API Error:', response.status, response.statusText);
            return;
        }
        
        const data = await response.json();
        console.log('🔍 DEBUG: API Data received:', data);
        
        if (data.books) {
            console.log('🔍 DEBUG: Books count:', data.books.length);
            if (data.books.length > 0) {
                console.log('🔍 DEBUG: First book:', data.books[0]);
                console.log('🔍 DEBUG: All books display_categories:', [...new Set(data.books.map(book => book.display_category))]);
            }
        } else {
            console.log('🔍 DEBUG: No books in response');
        }
    } catch (error) {
        console.error('🔍 DEBUG: Fetch error:', error);
    }
}

async function loadBooks() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const booksContainer = document.getElementById('booksContainer');
    const errorState = document.getElementById('errorState');

    try {
        loadingSpinner.style.display = 'block';
        booksContainer.style.display = 'none';
        errorState.style.display = 'none';

        console.log('📚 Loading books from API...');
        
        // DEBUG: Check what's happening
        await debugBooksLoading();
        
        const response = await fetch('/api/books/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 API response received:', data);
        
        if (data.books && data.books.length > 0) {
            console.log(`✅ Loaded ${data.books.length} books total`);
            await organizeBooksByCategory(data.books);
            booksContainer.style.display = 'block';
        } else {
            console.log('ℹ️ No books found in response');
            showEmptyState();
        }

    } catch (error) {
        console.error('❌ Error loading books:', error);
        loadingSpinner.style.display = 'none';
        booksContainer.style.display = 'none';
        errorState.style.display = 'block';
        
        showNotification('Failed to load books. Please try again.', 'error');
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

async function organizeBooksByCategory(books) {
    console.log('📊 Organizing books by display_category...');
    
    // Store all books for later use
    window.allBooks = books;
    
    // Debug: Check what display_categories actually exist
    const actualDisplayCategories = [...new Set(books.map(book => book.display_category))];
    console.log('🎯 Actual display_categories in books:', actualDisplayCategories);
    
    // Use display_category for organization
    const categorizedBooks = {
        // Featured Season
        featuredSeason: books.filter(book => 
            book.display_category === 'featured'
        ).slice(0, 4),
        
        // Best Sellers
        bestSellers: books.filter(book => 
            book.display_category === 'bestseller'
        ).slice(0, 4),
        
        // New Releases
        newReleases: books.filter(book => 
            book.display_category === 'new'
        ).slice(0, 4),
        
        // Classics
        classics: books.filter(book => 
            book.display_category === 'classic'
        ).slice(0, 4),
        
        // Quick Reads
        quickReads: books.filter(book => 
            book.display_category === 'quick'
        ).slice(0, 4),
        
        // Trending
        trending: books.filter(book => 
            book.display_category === 'trending'
        ).slice(0, 4),
        
        // All Books section - show first 8 books from ALL books
        allBooks: books.slice(0, 8)
    };

    console.log('📋 Categorized books count:', {
        featuredSeason: categorizedBooks.featuredSeason.length,
        bestSellers: categorizedBooks.bestSellers.length,
        newReleases: categorizedBooks.newReleases.length,
        classics: categorizedBooks.classics.length,
        quickReads: categorizedBooks.quickReads.length,
        trending: categorizedBooks.trending.length,
        allBooks: categorizedBooks.allBooks.length
    });

    // Render ALL sections that have books
    for (const sectionId in categorizedBooks) {
        const booksArray = categorizedBooks[sectionId];
        const container = document.getElementById(sectionId);
        
        console.log(`🔍 Processing section: ${sectionId}, Books: ${booksArray ? booksArray.length : 0}, Container: ${container ? 'found' : 'not found'}`);
        
        if (container && booksArray && booksArray.length > 0) {
            console.log(`🎯 Rendering ${booksArray.length} books in ${sectionId}`);
            
            const booksWithStatus = await Promise.all(
                booksArray.map(async (book) => {
                    const status = await checkBookInCollection(book.id);
                    return { ...book, userStatus: status };
                })
            );
            
            container.innerHTML = booksWithStatus.map(book => 
                createBookCard(book, sectionId)
            ).join('');
            
            console.log(`✅ Rendered ${booksArray.length} books in ${sectionId}`);
        } else if (container) {
            // Show empty state for empty sections
            if (booksArray && booksArray.length === 0) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="empty-state">
                            <p>No books available in this category</p>
                        </div>
                    </div>
                `;
                console.log(`ℹ️ No books for section: ${sectionId}`);
            }
        } else {
            console.log(`❌ Container not found for section: ${sectionId}`);
        }
    }
}

// FIXED: Universal expand function with proper grid layout
async function expandSection(sectionElement, sectionId, sectionTitle, viewAllBtn) {
    try {
        console.log(`🔍 EXPAND SECTION: ${sectionTitle} (${sectionId})`);
        
        showNotification(`Loading all ${sectionTitle.toLowerCase()}...`, 'info');
        
        let booksToShow = [];
        
        // ALWAYS use all books for All Books section
        if (sectionId === 'allBooks') {
            booksToShow = window.allBooks || [];
            console.log(`📚 All Books: Showing all ${booksToShow.length} books`);
        } else {
            // For category sections, filter by display_category
            const sectionToCategory = {
                'featuredSeason': 'featured',
                'bestSellers': 'bestseller', 
                'newReleases': 'new',
                'classics': 'classic',
                'quickReads': 'quick',
                'trending': 'trending'
            };
            
            const category = sectionToCategory[sectionId];
            console.log(`🔍 Looking for category mapping: ${sectionId} -> ${category}`);
            
            if (!category) {
                console.error(`❌ Category not found for section: '${sectionId}'`);
                showNotification(`Category '${sectionId}' not found`, 'error');
                return;
            }
            
            booksToShow = (window.allBooks || []).filter(book => {
                const matches = book.display_category === category;
                console.log(`📖 Book: ${book.title}, display_category: ${book.display_category}, matches: ${matches}`);
                return matches;
            });
            
            console.log(`📚 ${sectionTitle}: Found ${booksToShow.length} books with display_category ${category}`);
        }
        
        console.log(`📚 Total books to show: ${booksToShow.length}`);
        
        if (booksToShow.length === 0) {
            showNotification(`No books found in ${sectionTitle.toLowerCase()}`, 'info');
            return;
        }
        
        // Add loading state
        viewAllBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Loading...';
        viewAllBtn.disabled = true;
        
        // Get collection status for all books
        const booksWithStatus = await Promise.all(
            booksToShow.map(async (book) => {
                const status = await checkBookInCollection(book.id);
                return { ...book, userStatus: status };
            })
        );
        
        // Find the container
        let container = document.getElementById(sectionId);
        if (!container) {
            console.error(`❌ Container not found for ID: ${sectionId}`);
            showNotification('Error displaying books', 'error');
            return;
        }
        
        // FIXED: Create proper Bootstrap grid structure
        const booksHTML = booksWithStatus.map(book => 
            createBookCard(book, sectionId)
        ).join('');
        
        // FIXED: Ensure proper grid structure
        container.innerHTML = booksHTML;
        
        // Update section state
        sectionElement.classList.add('expanded');
        viewAllBtn.innerHTML = 'Show Less';
        viewAllBtn.disabled = false;
        
        // Add smooth scroll to section
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        showNotification(`Showing all ${booksToShow.length} ${sectionTitle.toLowerCase()}`, 'success');
        
    } catch (error) {
        console.error('❌ Error expanding section:', error);
        showNotification('Failed to load more books', 'error');
        viewAllBtn.innerHTML = 'View All';
        viewAllBtn.disabled = false;
    }
}

// FIXED: Collapse function for All Books
async function collapseSection(sectionElement, sectionId, viewAllBtn) {
    try {
        console.log(`🔍 COLLAPSE SECTION: ${sectionId}`);
        
        let categoryBooks = [];
        
        if (sectionId === 'allBooks') {
            // For All Books section, show first 8 books
            categoryBooks = (window.allBooks || []).slice(0, 8);
            console.log(`📚 All Books: Collapsing to first 8 books`);
        } else {
            // Map section IDs to category names for other sections
            const sectionToCategory = {
                'featuredSeason': 'featured',
                'bestSellers': 'bestseller', 
                'newReleases': 'new',
                'classics': 'classic',
                'quickReads': 'quick',
                'trending': 'trending'
            };
            
            const category = sectionToCategory[sectionId];
            console.log(`🎯 Looking up category for ${sectionId}: ${category}`);
            
            if (!category) {
                console.error(`❌ Category not found for section: ${sectionId}`);
                showNotification('Category not found', 'error');
                return;
            }
            
            categoryBooks = (window.allBooks || []).filter(book => 
                book.display_category === category
            ).slice(0, 4);
            
            console.log(`📚 ${sectionId}: Collapsing to first 4 books with display_category ${category}`);
        }
        
        // Get collection status for the books
        const booksWithStatus = await Promise.all(
            categoryBooks.map(async (book) => {
                const status = await checkBookInCollection(book.id);
                return { ...book, userStatus: status };
            })
        );
        
        // FIXED: Create proper Bootstrap grid structure
        const booksHTML = booksWithStatus.map(book => 
            createBookCard(book, sectionId)
        ).join('');
        
        // Render limited books
        const container = document.getElementById(sectionId);
        container.innerHTML = booksHTML;
        
        // Update section state
        sectionElement.classList.remove('expanded');
        viewAllBtn.innerHTML = 'View All';
        
        // Scroll to section
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        showNotification('Showing featured books only', 'info');
        
    } catch (error) {
        console.error('Error collapsing section:', error);
        showNotification('Failed to collapse section', 'error');
    }
}

async function checkBookInCollection(bookId) {
    try {
        const response = await fetch(`/api/books/${bookId}/in-collection/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.status || null;
    } catch (error) {
        console.error('Error checking book collection:', error);
        return null;
    }
}

function createBookCard(book, section) {
    const categoryLabels = {
        featured: "Featured",
        bestseller: "Bestseller",
        new: "New Release",
        classic: "Classic",
        quick: "Quick Read",
        trending: "Trending",
        general: "Book"
    };

    const fallbackImage = '/static/myapp/images/bookCover/default.jpg';
    const bookImage = book.cover_image || fallbackImage;
    
    // FIXED: Use the correct book ID field
    const bookId = book.id || book._id;
    const bookCategory = book.category || 'general';
    
    // For All Books section, show the actual category of each book
    const displayCategory = section === 'allBooks' ? book.display_category : section;
    
    // Determine button states based on userStatus
    let readingBtnText, readingBtnClass, readingDisabled = false;
    let wishlistBtnText, wishlistBtnClass, wishlistDisabled = false;
    
    switch(book.userStatus) {
        case 'reading':
            readingBtnText = 'Reading ✓';
            readingBtnClass = 'book-action-btn status-reading';
            readingDisabled = true;
            wishlistBtnText = 'In Wishlist';
            wishlistBtnClass = 'book-action-btn status-wishlist';
            wishlistDisabled = true;
            break;
        case 'wishlist':
            readingBtnText = 'Start Reading';
            readingBtnClass = 'book-action-btn btn-start-reading';
            readingDisabled = false;
            wishlistBtnText = 'In Wishlist ✓';
            wishlistBtnClass = 'book-action-btn status-wishlist';
            wishlistDisabled = true;
            break;
        case 'completed':
            readingBtnText = 'Completed ✓';
            readingBtnClass = 'book-action-btn status-completed';
            readingDisabled = true;
            wishlistBtnText = 'In Wishlist';
            wishlistBtnClass = 'book-action-btn status-wishlist';
            wishlistDisabled = true;
            break;
        default:
            readingBtnText = 'Start Reading';
            readingBtnClass = 'book-action-btn btn-start-reading';
            readingDisabled = false;
            wishlistBtnText = 'Add to Wishlist';
            wishlistBtnClass = 'book-action-btn btn-add-wishlist';
            wishlistDisabled = false;
    }
    
    console.log(`🖼️ Creating card for: ${book.title} in section: ${section}, display_category: ${book.display_category}`);
    
    // FIXED: Ensure proper Bootstrap grid column classes
    return `
        <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4">
            <div class="card book-card h-100" data-book-id="${bookId}" data-category="${book.display_category}">
                <span class="book-category">${categoryLabels[displayCategory] || 'Book'}</span>
                <img src="${bookImage}" class="card-img-top" alt="${book.title}" 
                     onerror="this.src='${fallbackImage}'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">By ${book.author}</p>
                    <div class="book-action-buttons mt-auto">
                        <button class="${readingBtnClass}" 
                                data-action="start-reading" 
                                data-book-id="${bookId}"
                                data-book-title="${book.title}"
                                data-book-author="${book.author}"
                                data-book-cover="${bookImage}"
                                data-book-genre="${book.genre ? book.genre.join(', ') : ''}"
                                ${readingDisabled ? 'disabled' : ''}>
                            ${readingBtnText}
                        </button>
                        <button class="${wishlistBtnClass}" 
                                data-action="add-wishlist" 
                                data-book-id="${bookId}"
                                data-book-title="${book.title}"
                                data-book-author="${book.author}"
                                data-book-cover="${bookImage}"
                                data-book-genre="${book.genre ? book.genre.join(', ') : ''}"
                                ${wishlistDisabled ? 'disabled' : ''}>
                            ${wishlistBtnText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    // View All buttons
    const viewAllButtons = document.querySelectorAll('.view-all-btn');
    viewAllButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const section = e.target.closest('.book-section');
            const sectionId = section.querySelector('.row').id;
            const sectionTitle = section.querySelector('.section-title').textContent;
            
            console.log(`🔍 View All clicked for: ${sectionTitle} (${sectionId})`);
            toggleSectionExpand(section, sectionId, sectionTitle);
        });
    });

    // Book action buttons
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('book-action-btn') && !e.target.disabled) {
            e.stopPropagation();
            const bookId = e.target.getAttribute('data-book-id');
            const bookTitle = e.target.getAttribute('data-book-title');
            const bookAuthor = e.target.getAttribute('data-book-author');
            const bookCover = e.target.getAttribute('data-book-cover');
            const bookGenre = e.target.getAttribute('data-book-genre');
            const action = e.target.getAttribute('data-action');
            
            console.log(`🔍 Book action clicked: ${action} for book: ${bookTitle}`);
            console.log(`📖 Book data:`, { bookId, bookTitle, bookAuthor, bookCover, bookGenre });
            
            await handleBookAction(action, bookId, bookTitle, bookAuthor, bookCover, bookGenre);
        }
    });

    // Book card clicks for details
    document.addEventListener('click', (e) => {
        const bookCard = e.target.closest('.book-card');
        if (bookCard && !e.target.classList.contains('book-action-btn') && !e.target.classList.contains('book-category')) {
            const bookId = bookCard.getAttribute('data-book-id');
            showBookDetails(bookId);
        }
    });
}

function toggleSectionExpand(sectionElement, sectionId, sectionTitle) {
    console.log(`🔄 TOGGLE SECTION EXPAND CALLED:`);
    console.log(`   Section Element:`, sectionElement);
    console.log(`   Section ID: '${sectionId}'`);
    console.log(`   Section Title: '${sectionTitle}'`);
    
    const viewAllBtn = sectionElement.querySelector('.view-all-btn');
    const isExpanded = sectionElement.classList.contains('expanded');
    
    console.log(`   Is Expanded: ${isExpanded}`);
    console.log(`   View All Button Text: '${viewAllBtn.textContent}'`);
    
    if (isExpanded) {
        console.log(`📥 Collapsing section...`);
        collapseSection(sectionElement, sectionId, viewAllBtn);
    } else {
        console.log(`📤 Expanding section...`);
        expandSection(sectionElement, sectionId, sectionTitle, viewAllBtn);
    }
}

// FIXED: Show book details in modal
async function showBookDetails(bookId) {
    try {
        console.log(`📖 Loading details for book: ${bookId}`);
        
        // Show loading state
        const modalContent = document.getElementById('bookDetailsContent');
        modalContent.innerHTML = `
            <div class="modal-loading">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading book details...</span>
                </div>
                <p class="mt-2">Loading book details...</p>
            </div>
        `;
        
        // Get book details - FIXED: Use the correct endpoint
        const response = await fetch(`/api/books/${bookId}/`);
        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }
        
        const book = await response.json();
        const status = await checkBookInCollection(bookId);
        
        console.log('📖 Book details loaded:', book);
        
        // Render book details
        modalContent.innerHTML = createBookDetailsHTML(book, status);
        
        // Setup action buttons in modal
        const actionButtons = document.getElementById('bookActionButtons');
        actionButtons.innerHTML = createBookActionButtons(book, status);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));
        modal.show();
        
    } catch (error) {
        console.error('❌ Error loading book details:', error);
        const modalContent = document.getElementById('bookDetailsContent');
        modalContent.innerHTML = `
            <div class="text-center py-4">
                <div class="text-danger mb-3">
                    <i class="bi bi-exclamation-triangle" style="font-size: 3rem;"></i>
                </div>
                <h5>Failed to Load Book Details</h5>
                <p class="text-muted">Please try again later.</p>
                <button class="btn btn-primary" onclick="showBookDetails('${bookId}')">Retry</button>
            </div>
        `;
    }
}

// FIXED: Create book details HTML with better structure
function createBookDetailsHTML(book, status) {
    const fallbackImage = '/static/myapp/images/bookCover/default.jpg';
    const bookImage = book.cover_image || fallbackImage;
    
    // Generate star rating
    const rating = book.average_rating || 0;
    const stars = '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');
    
    return `
        <div class="row">
            <div class="col-md-4 text-center mb-4 mb-md-0">
                <img src="${bookImage}" class="book-details-image img-fluid" alt="${book.title}" 
                     onerror="this.src='${fallbackImage}'" style="max-height: 400px; object-fit: cover;">
            </div>
            <div class="col-md-8">
                <h2 class="book-details-title">${book.title}</h2>
                <p class="book-details-author">By ${book.author}</p>
                
                <div class="book-details-section">
                    <h6>Description</h6>
                    <p>${book.description || 'No description available.'}</p>
                </div>
                
                <div class="row">
                    ${book.genre && book.genre.length > 0 ? `
                    <div class="col-sm-6 book-details-section">
                        <h6>Genres</h6>
                        <div class="book-details-genres">
                            ${book.genre.map(genre => `<span class="genre-badge">${genre}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${book.language ? `
                    <div class="col-sm-6 book-details-section">
                        <h6>Language</h6>
                        <p>${book.language}</p>
                    </div>
                    ` : ''}
                </div>
                
                <div class="row">
                    ${book.publication_year ? `
                    <div class="col-sm-6 book-details-section">
                        <h6>Publication Year</h6>
                        <p>${book.publication_year}</p>
                    </div>
                    ` : ''}
                    
                    ${book.pages ? `
                    <div class="col-sm-6 book-details-section">
                        <h6>Pages</h6>
                        <p>${book.pages}</p>
                    </div>
                    ` : ''}
                </div>
                
                ${rating > 0 ? `
                <div class="book-details-section">
                    <h6>Rating</h6>
                    <div class="book-details-rating">
                        <span class="stars">${stars}</span>
                        <span>${rating}/5</span>
                    </div>
                </div>
                ` : ''}
                
                <div class="book-details-section">
                    <h6>Your Status</h6>
                    <span class="book-details-status">${getStatusText(status)}</span>
                </div>
            </div>
        </div>
    `;
}

// FIXED: Create action buttons for modal
function createBookActionButtons(book, status) {
    const bookId = book.id || book._id;
    
    // Escape quotes in book data for JavaScript
    const safeTitle = book.title.replace(/'/g, "\\'");
    const safeAuthor = book.author.replace(/'/g, "\\'");
    const safeCover = (book.cover_image || '').replace(/'/g, "\\'");
    const safeGenre = (book.genre || []).join(', ').replace(/'/g, "\\'");
    
    let buttonsHTML = '';
    
    if (status === 'reading') {
        buttonsHTML = `
            <button class="modal-action-btn primary" disabled>Currently Reading</button>
        `;
    } else if (status === 'wishlist') {
        buttonsHTML = `
            <button class="modal-action-btn primary" onclick="startReadingFromModal('${bookId}', '${safeTitle}', '${safeAuthor}', '${safeCover}', '${safeGenre}')">Start Reading</button>
            <button class="modal-action-btn secondary" disabled>In Wishlist</button>
        `;
    } else if (status === 'completed') {
        buttonsHTML = `
            <button class="modal-action-btn primary" disabled>Completed</button>
        `;
    } else {
        buttonsHTML = `
            <button class="modal-action-btn primary" onclick="startReadingFromModal('${bookId}', '${safeTitle}', '${safeAuthor}', '${safeCover}', '${safeGenre}')">Start Reading</button>
            <button class="modal-action-btn outline" onclick="addToWishlistFromModal('${bookId}', '${safeTitle}', '${safeAuthor}', '${safeCover}', '${safeGenre}')">Add to Wishlist</button>
        `;
    }
    
    return `<div class="modal-action-buttons">${buttonsHTML}</div>`;
}

// Helper function: Get status text for display
function getStatusText(status) {
    switch(status) {
        case 'reading': return '📖 Currently Reading';
        case 'wishlist': return '📚 In Your Wishlist';
        case 'completed': return '✅ Completed';
        default: return '🔍 Not in Your Collection';
    }
}

// FIXED: Start reading from modal
async function startReadingFromModal(bookId, title, author, coverImage, genre) {
    try {
        const response = await fetch('/api/books/start-reading/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                book_id: bookId,
                book_title: title,
                book_author: author,
                book_cover: coverImage,
                book_genre: genre
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('🎉 Started reading "' + title + '"!', 'success');
            // Close modal and update UI
            bootstrap.Modal.getInstance(document.getElementById('bookDetailsModal')).hide();
            updateBookCardStatus(bookId, 'reading');
        } else {
            showNotification(data.error || 'Failed to start reading', 'error');
        }
    } catch (error) {
        console.error('Error starting reading from modal:', error);
        showNotification('Failed to start reading book', 'error');
    }
}

// FIXED: Add to wishlist from modal
async function addToWishlistFromModal(bookId, title, author, coverImage, genre) {
    try {
        const response = await fetch('/api/wishlist/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                book_id: bookId,
                book_title: title,
                book_author: author,
                book_cover: coverImage,
                book_genre: genre
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('📚 Added "' + title + '" to your wishlist!', 'success');
            // Close modal and update UI
            bootstrap.Modal.getInstance(document.getElementById('bookDetailsModal')).hide();
            updateBookCardStatus(bookId, 'wishlist');
        } else {
            showNotification(data.error || 'Failed to add to wishlist', 'error');
        }
    } catch (error) {
        console.error('Error adding to wishlist from modal:', error);
        showNotification('Failed to add book to wishlist', 'error');
    }
}

// FIXED: Handle book action with complete book data
async function handleBookAction(action, bookId, bookTitle, bookAuthor, bookCover, bookGenre) {
    try {
        let endpoint, payload, successMessage;
        
        // FIXED: Include all required book data
        const bookData = {
            book_id: bookId,
            book_title: bookTitle,
            book_author: bookAuthor,
            book_cover: bookCover,
            book_genre: bookGenre
        };
        
        if (action === 'start-reading') {
            endpoint = '/api/books/start-reading/';
            payload = bookData;
            successMessage = `🎉 Started reading "${bookTitle}"!`;
        } else if (action === 'add-wishlist') {
            endpoint = '/api/wishlist/add/';
            payload = bookData;
            successMessage = `📚 Added "${bookTitle}" to your wishlist!`;
        } else {
            throw new Error('Unknown action');
        }

        console.log(`📤 Sending ${action} request:`, payload);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification(successMessage, 'success');
            // Update the book card status
            const newStatus = action === 'start-reading' ? 'reading' : 'wishlist';
            updateBookCardStatus(bookId, newStatus);
        } else {
            showNotification(data.error || `Failed to ${action}`, 'error');
        }
    } catch (error) {
        console.error('Error handling book action:', error);
        showNotification(`Failed to ${action} book`, 'error');
    }
}

function updateBookCardStatus(bookId, status) {
    // Find all book cards with this ID and update their buttons
    const bookCards = document.querySelectorAll(`.book-card[data-book-id="${bookId}"]`);
    
    bookCards.forEach(card => {
        const readingBtn = card.querySelector('[data-action="start-reading"]');
        const wishlistBtn = card.querySelector('[data-action="add-wishlist"]');
        
        // Reset both buttons first
        readingBtn.disabled = false;
        wishlistBtn.disabled = false;
        readingBtn.className = 'book-action-btn btn-start-reading';
        wishlistBtn.className = 'book-action-btn btn-add-wishlist';
        
        switch(status) {
            case 'reading':
                readingBtn.textContent = 'Reading ✓';
                readingBtn.className = 'book-action-btn status-reading';
                readingBtn.disabled = true;
                wishlistBtn.textContent = 'In Wishlist';
                wishlistBtn.className = 'book-action-btn status-wishlist';
                wishlistBtn.disabled = true;
                break;
            case 'wishlist':
                readingBtn.textContent = 'Start Reading';
                wishlistBtn.textContent = 'In Wishlist ✓';
                wishlistBtn.className = 'book-action-btn status-wishlist';
                wishlistBtn.disabled = true;
                break;
            case 'completed':
                readingBtn.textContent = 'Completed ✓';
                readingBtn.className = 'book-action-btn status-completed';
                readingBtn.disabled = true;
                wishlistBtn.textContent = 'In Wishlist';
                wishlistBtn.className = 'book-action-btn status-wishlist';
                wishlistBtn.disabled = true;
                break;
            default:
                readingBtn.textContent = 'Start Reading';
                wishlistBtn.textContent = 'Add to Wishlist';
        }
    });
}

function showEmptyState() {
    const booksContainer = document.getElementById('booksContainer');
    booksContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="empty-state-icon mb-3">
                <i class="bi bi-book" style="font-size: 4rem; color: #6c757d;"></i>
            </div>
            <h3>No Books Available</h3>
            <p class="text-muted">There are no books in the library at the moment.</p>
            <button class="btn btn-primary mt-3" onclick="loadBooks()">Try Again</button>
        </div>
    `;
}

// Utility functions
function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfToken ? csrfToken.value : '';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Make functions available globally
window.loadBooks = loadBooks;
window.handleBookAction = handleBookAction;
window.showBookDetails = showBookDetails;
window.startReadingFromModal = startReadingFromModal;
window.addToWishlistFromModal = addToWishlistFromModal;
window.toggleSectionExpand = toggleSectionExpand;
window.debugBooksLoading = debugBooksLoading;