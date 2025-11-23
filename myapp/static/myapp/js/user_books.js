// myapp/static/myapp/js/user_books.js - DEBUG VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 User Books page loaded');
    loadUserBooks();
});

async function loadUserBooks() {
    try {
        console.log('📚 DEBUG: Loading user books from API...');
        
        const response = await fetch('/api/user/books/', {
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        console.log('📊 DEBUG: Response status:', response.status);
        console.log('📊 DEBUG: Response ok:', response.ok);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 DEBUG: API Response data:', data);
        
        if (data.success) {
            console.log('✅ DEBUG: Successfully loaded books');
            renderUserBooks(data);
        } else {
            console.error('❌ DEBUG: API returned success: false');
            showNotification('Failed to load books', 'error');
        }
    } catch (error) {
        console.error('❌ DEBUG: Error loading user books:', error);
        showNotification('Failed to load your books', 'error');
    }
}

function renderUserBooks(data) {
    console.log('🎨 DEBUG: Rendering books...');
    
    const continueReadingContainer = document.getElementById("continueReading");
    const myBooklistContainer = document.getElementById("myBooklist");

    if (!continueReadingContainer || !myBooklistContainer) {
        console.error('❌ DEBUG: Could not find container elements');
        return;
    }

    // Clear containers
    continueReadingContainer.innerHTML = '';
    myBooklistContainer.innerHTML = '';

    // Render Continue Reading
    if (data.reading_books && data.reading_books.length > 0) {
        console.log('📖 DEBUG: Reading books count:', data.reading_books.length);
        continueReadingContainer.innerHTML = data.reading_books.map(book => createReadingCard(book)).join('');
    } else {
        console.log('📖 DEBUG: No reading books found');
        continueReadingContainer.innerHTML = createEmptyState('reading');
    }

    // Render My Booklist (Wishlist)
    if (data.wishlist_books && data.wishlist_books.length > 0) {
        console.log('📚 DEBUG: Wishlist books count:', data.wishlist_books.length);
        myBooklistContainer.innerHTML = data.wishlist_books.map(book => createWishlistCard(book)).join('');
    } else {
        console.log('📚 DEBUG: No wishlist books found');
        myBooklistContainer.innerHTML = createEmptyState('wishlist');
    }
}

function createReadingCard(book) {
    const progress = book.progress || 0;
    const lastRead = book.last_read ? 'Recently' : 'Not started';
    const bookId = book.book_id || book._id;
    
    console.log('📖 DEBUG: Creating reading card for:', bookId, book.title);
    
    return `
        <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <div class="card book-card">
                <span class="book-status">📖 Reading</span>
                <img src="${book.cover_image}" class="card-img-top" alt="${book.title}" 
                     onerror="this.src='/static/myapp/images/bookCover/default.jpg'">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">By ${book.author}</p>
                    <div class="progress-info">
                        <span class="progress-percent">${progress}%</span>
                        <span class="progress-time">${lastRead}</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="book-action-buttons">
                        <button class="book-action-btn continue-btn" 
                                onclick="openPDFReader('${bookId}')">
                            ${progress === 100 ? 'Read Again' : 'Continue Reading'}
                        </button>
                        <button class="book-action-btn remove-btn" 
                                onclick="removeFromReading('${bookId}')">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createWishlistCard(book) {
    const bookId = book.book_id || book._id;
    
    console.log('📚 DEBUG: Creating wishlist card for:', bookId, book.title);
    
    return `
        <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <div class="card book-card">
                <span class="book-status">📚 Wishlist</span>
                <img src="${book.cover_image}" class="card-img-top" alt="${book.title}"
                     onerror="this.src='/static/myapp/images/bookCover/default.jpg'">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">By ${book.author}</p>
                    <div style="height: 40px;"></div>
                    <div class="book-action-buttons">
                        <button class="book-action-btn start-btn" 
                                onclick="moveToReading('${bookId}')">
                            Start Reading
                        </button>
                        <button class="book-action-btn remove-btn" 
                                onclick="removeFromWishlist('${bookId}')">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createEmptyState(type) {
    const messages = {
        reading: {
            title: 'No books in progress',
            message: 'Start reading some books to see them here!',
            buttonText: 'Explore Books'
        },
        wishlist: {
            title: 'Your wishlist is empty',
            message: 'Add some books to your reading list!',
            buttonText: 'Browse Books'
        }
    };
    
    const msg = messages[type];
    
    return `
        <div class="col-12">
            <div class="empty-state">
                <h4>${msg.title}</h4>
                <p>${msg.message}</p>
                <button class="book-action-btn" onclick="window.location.href='/explore/'">${msg.buttonText}</button>
            </div>
        </div>
    `;
}

// Button functions - DEBUG VERSION
window.openPDFReader = function(bookId) {
    console.log('📖 DEBUG: Opening PDF for:', bookId);
    const url = `/read/${bookId}/`;
    window.open(url, '_blank');
};

window.moveToReading = function(bookId) {
    console.log('🚀 DEBUG: Move to reading called for:', bookId);
    
    // Get book data from the card
    const card = document.querySelector(`[onclick*="moveToReading('${bookId}')"]`).closest('.card');
    const title = card.querySelector('.card-title').textContent;
    const author = card.querySelector('.card-text').textContent.replace('By ', '');
    const cover = card.querySelector('.card-img-top').src;
    
    console.log('📚 DEBUG: Book data:', { bookId, title, author, cover });
    
    showNotification('Moving to reading list...', 'info');
    
    fetch('/api/books/start-reading/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({
            book_id: bookId,
            book_title: title,
            book_author: author,
            book_cover: cover,
            book_genre: '' // You can add genre if available
        })
    })
    .then(response => {
        console.log('📊 DEBUG: Move to reading response status:', response.status);
        return response.json().then(data => {
            console.log('📊 DEBUG: Move to reading response data:', data);
            return { response, data };
        });
    })
    .then(({ response, data }) => {
        if (response.ok && data.success) {
            console.log('✅ DEBUG: Successfully moved to reading');
            showNotification('Book moved to reading list!', 'success');
            // Remove from wishlist and reload
            removeFromWishlistSilent(bookId);
        } else {
            console.error('❌ DEBUG: Move to reading failed:', data.error);
            showNotification(data.error || 'Failed to move book', 'error');
        }
    })
    .catch(error => {
        console.error('❌ DEBUG: Error moving to reading:', error);
        showNotification('Failed to move book to reading list', 'error');
    });
};

window.removeFromReading = function(bookId) {
    console.log('🗑️ DEBUG: Remove from reading called for:', bookId);
    showNotification('Removing book...', 'info');
    
    fetch('/api/books/remove-reading/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({ book_id: bookId })
    })
    .then(response => {
        console.log('📊 DEBUG: Remove from reading response status:', response.status);
        return response.json().then(data => {
            console.log('📊 DEBUG: Remove from reading response data:', data);
            return { response, data };
        });
    })
    .then(({ response, data }) => {
        if (response.ok && data.success) {
            console.log('✅ DEBUG: Successfully removed from reading');
            showNotification('Book removed from reading list', 'success');
            setTimeout(() => loadUserBooks(), 1000);
        } else {
            console.error('❌ DEBUG: Remove from reading failed:', data.error);
            showNotification(data.error || 'Failed to remove', 'error');
        }
    })
    .catch(error => {
        console.error('❌ DEBUG: Error removing from reading:', error);
        showNotification('Failed to remove book from reading list', 'error');
    });
};

window.removeFromWishlist = function(bookId) {
    console.log('🗑️ DEBUG: Remove from wishlist called for:', bookId);
    showNotification('Removing book...', 'info');
    
    fetch('/api/books/remove-wishlist/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({ book_id: bookId })
    })
    .then(response => {
        console.log('📊 DEBUG: Remove from wishlist response status:', response.status);
        return response.json().then(data => {
            console.log('📊 DEBUG: Remove from wishlist response data:', data);
            return { response, data };
        });
    })
    .then(({ response, data }) => {
        if (response.ok && data.success) {
            console.log('✅ DEBUG: Successfully removed from wishlist');
            showNotification('Book removed from wishlist', 'success');
            setTimeout(() => loadUserBooks(), 1000);
        } else {
            console.error('❌ DEBUG: Remove from wishlist failed:', data.error);
            showNotification(data.error || 'Failed to remove', 'error');
        }
    })
    .catch(error => {
        console.error('❌ DEBUG: Error removing from wishlist:', error);
        showNotification('Failed to remove book from wishlist', 'error');
    });
};

// Silent removal without notification
function removeFromWishlistSilent(bookId) {
    console.log('🔇 DEBUG: Silent removal from wishlist:', bookId);
    
    fetch('/api/books/remove-wishlist/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({ book_id: bookId })
    })
    .then(response => response.json())
    .then(data => {
        console.log('📊 DEBUG: Silent removal response:', data);
        if (data.success) {
            setTimeout(() => loadUserBooks(), 500);
        }
    })
    .catch(error => {
        console.error('❌ DEBUG: Error in silent removal:', error);
        setTimeout(() => loadUserBooks(), 500);
    });
}

function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    const token = csrfToken ? csrfToken.value : '';
    console.log('🔐 DEBUG: CSRF Token found:', !!token);
    return token;
}

function showNotification(message, type = 'info') {
    console.log('💬 DEBUG: Showing notification:', message, type);
    
    const existingAlerts = document.querySelectorAll('.alert.position-fixed');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-danger' : 'alert-info';
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alert.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
    `;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 3000);
}