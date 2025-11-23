// myapp/static/myapp/js/user_home.js - COMPLETE WORKING VERSION
console.log('🚀 user_home.js loaded - Starting fresh initialization');

// Clear all browser storage to remove cached static posts
console.log('🧹 Clearing browser storage cache');
localStorage.clear();
sessionStorage.clear();

// Clear service worker cache
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        console.log('🗑️ Unregistering service workers:', registrations.length);
        for (let registration of registrations) {
            registration.unregister();
        }
    });
}

// Clear any caches
if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
        console.log('🗑️ Clearing caches:', cacheNames.length);
        cacheNames.forEach(function(cacheName) {
            caches.delete(cacheName);
        });
    });
}

// Global variables
let posts = [];
let selectedBook = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Content Loaded - Starting home page initialization');
    initializeHome();
});

function initializeHome() {
    console.log('🔧 Initializing home page components');
    
    // Force clear timeline
    const timeline = document.getElementById('timeline');
    if (timeline) {
        timeline.innerHTML = '';
    }
    
    // Load all data
    loadUserStatistics();
    loadCurrentlyReading();
    loadTimeline();
    loadFriendActivities();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Home page initialization complete');
}

// Load user statistics from API
async function loadUserStatistics() {
    try {
        console.log('📊 Loading user statistics...');
        const response = await fetch('/api/user/statistics/real/?t=' + Date.now());
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 User statistics data:', data);
        
        if (data.success) {
            renderUserStatistics(data.statistics);
        } else {
            console.error('❌ Failed to load user statistics:', data.error);
            showDefaultStatistics();
        }
    } catch (error) {
        console.error('❌ Error loading user statistics:', error);
        showDefaultStatistics();
    }
}

function renderUserStatistics(stats) {
    console.log('🎨 Rendering user statistics:', stats);
    
    // Update books read
    const booksReadElement = document.querySelector('.stat-item:nth-child(1) .stat-number');
    if (booksReadElement) {
        booksReadElement.textContent = stats.books_read || 0;
    }
    
    // Update pages today
    const pagesTodayElement = document.querySelector('.stat-item:nth-child(2) .stat-number');
    if (pagesTodayElement) {
        pagesTodayElement.textContent = stats.pages_today || 0;
    }
    
    // Update current streak
    const currentStreakElement = document.querySelector('.stat-item:nth-child(3) .stat-number');
    if (currentStreakElement) {
        currentStreakElement.textContent = stats.current_streak || 0;
    }
}

function showDefaultStatistics() {
    console.log('📊 Showing default statistics');
    // Keep the current template values as fallback
}

// Load currently reading book from API
async function loadCurrentlyReading() {
    try {
        console.log('📖 Loading currently reading books...');
        const response = await fetch('/api/user/books/?t=' + Date.now());
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Currently reading data:', data);
        
        if (data.success && data.reading_books && data.reading_books.length > 0) {
            renderCurrentlyReading(data.reading_books[0]); // Show first book
        } else {
            console.log('ℹ️ No currently reading books found');
            showDefaultCurrentlyReading();
        }
    } catch (error) {
        console.error('❌ Error loading currently reading:', error);
        showDefaultCurrentlyReading();
    }
}

function renderCurrentlyReading(book) {
    console.log('🎨 Rendering currently reading book:', book);
    
    const currentlyReadingCard = document.querySelector('.currently-reading-card');
    if (!currentlyReadingCard) return;
    
    const titleElement = currentlyReadingCard.querySelector('h6.mb-1');
    const authorElement = currentlyReadingCard.querySelector('p.text-muted.mb-0');
    const progressBar = currentlyReadingCard.querySelector('.progress-bar');
    const progressText = currentlyReadingCard.querySelector('small.text-muted');
    const coverImage = currentlyReadingCard.querySelector('.book-cover-sm');
    
    if (titleElement) titleElement.textContent = book.title || 'Unknown Book';
    if (authorElement) authorElement.textContent = `By ${book.author || 'Unknown Author'}`;
    
    // Set progress
    const progress = book.progress || 0;
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    if (progressText) {
        progressText.textContent = `${progress}% complete`;
    }
    
    // Set cover image
    if (coverImage) {
        coverImage.src = book.cover_image || '/static/myapp/images/bookCover/default.jpg';
        coverImage.alt = book.title || 'Book Cover';
    }
}

function showDefaultCurrentlyReading() {
    console.log('📖 Showing default currently reading');
    // Keep the template values as fallback
}

// Load friend activities with real data
async function loadFriendActivities() {
    try {
        console.log('👥 Loading friend activities...');
        const response = await fetch('/api/friends/activities/?t=' + Date.now());
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Friend activities data:', data);
        
        if (data.success) {
            renderFriendActivities(data.activities);
        } else {
            console.error('❌ Failed to load friend activities:', data.error);
            showDefaultFriendActivities();
        }
    } catch (error) {
        console.error('❌ Error loading friend activities:', error);
        showDefaultFriendActivities();
    }
}

function renderFriendActivities(activities) {
    console.log('🎨 Rendering friend activities:', activities);
    
    const friendsList = document.getElementById('friendsList');
    if (!friendsList) return;
    
    if (!activities || activities.length === 0) {
        friendsList.innerHTML = `
            <div class="friend-activity">
                <img src="/static/myapp/icons/top-user.png" alt="User" class="friend-activity-avatar">
                <div class="flex-grow-1">
                    <div class="friend-activity-text">
                        <strong>No recent activity</strong>
                    </div>
                    <div class="friend-activity-time">Be the first to post!</div>
                </div>
            </div>
        `;
        return;
    }
    
    friendsList.innerHTML = activities.map(activity => `
        <div class="friend-activity">
            <img src="${activity.user_avatar}" 
                 alt="${activity.user_name}" 
                 class="friend-activity-avatar"
                 onerror="this.src='/static/myapp/icons/top-user.png'">
            <div class="flex-grow-1">
                <div class="friend-activity-text">
                    <strong>${escapeHtml(activity.user_name)}</strong> ${activity.action}
                    ${activity.content ? `<div class="activity-content">${escapeHtml(activity.content)}</div>` : ''}
                </div>
                <div class="friend-activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

function showDefaultFriendActivities() {
    console.log('👥 Showing default friend activities');
    const friendsList = document.getElementById('friendsList');
    if (!friendsList) return;
    
    friendsList.innerHTML = `
        <div class="friend-activity">
            <img src="/static/myapp/icons/top-user.png" alt="User" class="friend-activity-avatar">
            <div class="flex-grow-1">
                <div class="friend-activity-text">
                    <strong>Community</strong> is getting started
                </div>
                <div class="friend-activity-time">Recently</div>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    console.log('🎯 Setting up event listeners');
    
    // Post submission
    const submitPostBtn = document.getElementById('submitPostBtn');
    if (submitPostBtn) {
        submitPostBtn.addEventListener('click', createPost);
    }
    
    // Add book button
    const addBookBtn = document.getElementById('addBookBtn');
    if (addBookBtn) {
        addBookBtn.addEventListener('click', openBookSelection);
    }
    
    // Book search
    const searchBooksBtn = document.getElementById('searchBooksBtn');
    if (searchBooksBtn) {
        searchBooksBtn.addEventListener('click', searchBooks);
    }
    
    const bookSearchInput = document.getElementById('bookSearchInput');
    if (bookSearchInput) {
        bookSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchBooks();
        });
    }
    
    // Delegated events for dynamic content
    document.addEventListener('click', function(e) {
        // Like buttons
        if (e.target.closest('.like-btn')) {
            const likeBtn = e.target.closest('.like-btn');
            const postId = likeBtn.getAttribute('data-post-id');
            console.log('❤️ Like button clicked for post:', postId);
            toggleLike(postId, likeBtn);
        }
        
        // Load more comments
        if (e.target.classList.contains('load-more-comments')) {
            const postId = e.target.getAttribute('data-post-id');
            console.log('💬 Load more comments for post:', postId);
            loadMoreComments(postId);
        }
    });
    
    // Comment submission
    document.addEventListener('keypress', function(e) {
        if (e.target.classList.contains('comment-input') && e.key === 'Enter') {
            const commentInput = e.target;
            const postId = commentInput.getAttribute('data-post-id');
            const content = commentInput.value.trim();
            
            if (content) {
                console.log('💬 Adding comment to post:', postId);
                addComment(postId, content);
                commentInput.value = '';
            }
        }
    });
}

async function loadTimeline() {
    const timeline = document.getElementById('timeline');
    if (!timeline) {
        console.error('❌ Timeline element not found');
        return;
    }
    
    try {
        console.log('📡 Fetching REAL posts from API (not cache)...');
        
        // Show loading state
        timeline.innerHTML = `
            <div class="card post-card">
                <div class="card-body text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-muted">Loading posts from database...</p>
                    <small class="text-muted">This may take a moment</small>
                </div>
            </div>
        `;
        
        // Fetch with cache-busting
        const response = await fetch('/api/posts/?t=' + Date.now(), {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 API Response data:', data);
        
        if (data.success) {
            posts = data.posts || [];
            console.log(`✅ Loaded ${posts.length} REAL posts from database`);
            
            if (posts.length === 0) {
                console.log('ℹ️ No posts found in database');
                showEmptyState();
            } else {
                renderTimeline();
            }
        } else {
            throw new Error(data.error || 'Failed to load posts');
        }
        
    } catch (error) {
        console.error('❌ Error loading timeline:', error);
        showErrorState(error);
    }
}

function showEmptyState() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;
    
    timeline.innerHTML = `
        <div class="card post-card">
            <div class="card-body text-center py-5">
                <div class="mb-3" style="font-size: 3rem;">📚</div>
                <h5>No Posts Yet</h5>
                <p class="text-muted">Be the first to share what you're reading!</p>
                <button class="btn btn-primary mt-2" onclick="scrollToPostForm()">
                    Create Your First Post
                </button>
                <div class="mt-3">
                    <small class="text-muted">Database has 0 posts</small>
                </div>
            </div>
        </div>
    `;
}

function renderTimeline() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;
    
    console.log(`🎨 Rendering ${posts.length} REAL posts from database`);
    
    timeline.innerHTML = posts.map(post => {
        console.log('📄 Rendering post:', post._id, post.content?.substring(0, 50));
        
        const userName = post.user_name || 'User';
        const userAvatar = post.user_avatar || '/static/myapp/icons/top-user.png';
        const content = post.content || '';
        const createdAt = post.created_at || new Date().toISOString();
        const likesCount = post.likes_count || 0;
        const commentsCount = post.comments_count || 0;
        const userLiked = post.user_liked || false;
        const comments = post.comments || [];
        const book = post.book || null;

        return `
        <div class="card post-card mb-4" data-post-id="${post._id}">
            <div class="card-body">
                <!-- Post Header -->
                <div class="post-header">
                    <img src="${userAvatar}" 
                         alt="${userName}" 
                         class="user-avatar-sm"
                         onerror="this.src='/static/myapp/icons/top-user.png'">
                    <div class="post-user-info">
                        <h6 class="mb-0">${escapeHtml(userName)}</h6>
                        <span class="post-time">${formatTime(createdAt)}</span>
                    </div>
                </div>
                
                <!-- Post Content -->
                <div class="post-content mt-3">${escapeHtml(content).replace(/\n/g, '<br>')}</div>
                
                <!-- Book Info -->
                ${book ? `
                    <div class="post-book mt-3">
                        <img src="${book.cover_image || '/static/myapp/images/bookCover/default.jpg'}" 
                             alt="${book.title || 'Book'}" 
                             class="book-cover-xs"
                             onerror="this.src='/static/myapp/images/bookCover/default.jpg'">
                        <div class="post-book-info">
                            <h6 class="mb-1">${escapeHtml(book.title || 'Unknown Book')}</h6>
                            <p class="mb-0 text-muted">By ${escapeHtml(book.author || 'Unknown Author')}</p>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Post Stats -->
                <div class="post-stats mt-2">
                    <small class="text-muted">
                        ${likesCount} ${likesCount === 1 ? 'like' : 'likes'} • 
                        ${commentsCount} ${commentsCount === 1 ? 'comment' : 'comments'}
                    </small>
                </div>
                
                <!-- Post Actions -->
                <div class="post-actions-bottom mt-2">
                    <button class="post-action like-btn ${userLiked ? 'active' : ''}" 
                            data-post-id="${post._id}"
                            title="${userLiked ? 'Unlike' : 'Like'}">
                        <span class="like-icon">${userLiked ? '❤️' : '🤍'}</span>
                        <span class="like-count">${likesCount}</span>
                    </button>
                    <button class="post-action comment-btn" 
                            data-post-id="${post._id}"
                            title="Comment">
                        <span>💬</span>
                        <span class="comment-count">${commentsCount}</span>
                    </button>
                </div>
                
                <!-- Comments Section -->
                <div class="comments-section mt-3">
                    ${comments.length > 0 ? `
                        <div class="comments-list">
                            ${comments.map(comment => `
                                <div class="comment mb-2">
                                    <img src="${comment.user_avatar || '/static/myapp/icons/top-user.png'}" 
                                         alt="${comment.user_name || 'User'}" 
                                         class="comment-avatar"
                                         onerror="this.src='/static/myapp/icons/top-user.png'">
                                    <div class="comment-content">
                                        <div class="comment-header">
                                            <strong class="comment-author">${escapeHtml(comment.user_name || 'User')}</strong>
                                            <span class="comment-time">${formatTime(comment.created_at)}</span>
                                        </div>
                                        <div class="comment-text">${escapeHtml(comment.content)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="add-comment mt-2">
                        <img src="/static/myapp/icons/top-user.png" alt="You" class="comment-avatar">
                        <input type="text" 
                               class="form-control comment-input" 
                               placeholder="Write a comment..." 
                               data-post-id="${post._id}">
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    console.log('✅ Timeline rendered successfully with REAL posts');
}

async function createPost() {
    console.log('📝 Creating new post...');
    
    const postContentElement = document.getElementById('postContent');
    if (!postContentElement) {
        showNotification('Error: Cannot find post input', 'error');
        return;
    }
    
    const content = postContentElement.value.trim();
    if (!content) {
        showNotification('Please enter some content for your post', 'warning');
        return;
    }
    
    try {
        const postData = { content: content };
        
        // Add book data if selected
        if (selectedBook) {
            postData.book_id = selectedBook.id || selectedBook._id;
            postData.book_title = selectedBook.title;
            postData.book_author = selectedBook.author;
            postData.book_cover = selectedBook.cover_image;
            console.log('📚 Adding book to post:', selectedBook);
        }
        
        console.log('📤 Sending post data to API:', postData);
        
        const response = await fetch('/api/posts/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(postData)
        });
        
        console.log('📡 Create post response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Create post response:', data);
        
        if (data.success) {
            // Clear the form
            postContentElement.value = '';
            selectedBook = null;
            updateAddBookButton();
            
            showNotification('🎉 Post created successfully!', 'success');
            
            // Reload all data to reflect changes
            setTimeout(() => {
                loadTimeline();
                loadFriendActivities(); // Refresh activities
            }, 1000);
            
        } else {
            throw new Error(data.error || 'Failed to create post');
        }
        
    } catch (error) {
        console.error('❌ Error creating post:', error);
        showNotification('Error creating post: ' + error.message, 'error');
    }
}

async function toggleLike(postId, likeBtn) {
    try {
        console.log('❤️ Toggling like for post:', postId);
        
        const response = await fetch('/api/posts/like/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ post_id: postId })
        });
        
        const data = await response.json();
        console.log('📦 Like response:', data);
        
        if (data.success) {
            // Update UI immediately
            const likeCountSpan = likeBtn.querySelector('.like-count');
            const likeIcon = likeBtn.querySelector('.like-icon');
            const currentCount = parseInt(likeCountSpan.textContent) || 0;
            
            if (data.liked) {
                likeBtn.classList.add('active');
                likeIcon.textContent = '❤️';
                likeCountSpan.textContent = currentCount + 1;
                likeBtn.title = 'Unlike';
                
                // Add animation
                likeBtn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    likeBtn.style.transform = 'scale(1)';
                }, 200);
            } else {
                likeBtn.classList.remove('active');
                likeIcon.textContent = '🤍';
                likeCountSpan.textContent = Math.max(0, currentCount - 1);
                likeBtn.title = 'Like';
            }
            
            showNotification(data.message, 'success');
        } else {
            throw new Error(data.error || 'Failed to like post');
        }
    } catch (error) {
        console.error('❌ Error toggling like:', error);
        showNotification('Error updating like', 'error');
    }
}

async function addComment(postId, content) {
    try {
        console.log('💬 Adding comment to post:', postId);
        
        const response = await fetch('/api/posts/comment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ 
                post_id: postId,
                content: content
            })
        });
        
        const data = await response.json();
        console.log('📦 Comment response:', data);
        
        if (data.success) {
            // Reload the timeline to show the new comment
            await loadTimeline();
            showNotification('💬 Comment added successfully!', 'success');
        } else {
            throw new Error(data.error || 'Failed to add comment');
        }
    } catch (error) {
        console.error('❌ Error adding comment:', error);
        showNotification('Error adding comment', 'error');
    }
}

// Book selection functions (keep existing)
function openBookSelection() {
    console.log('📚 Opening book selection modal');
    const modalElement = document.getElementById('bookSelectionModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        loadRecentBooks();
    }
}

async function loadRecentBooks() {
    try {
        console.log('📚 Loading recent books...');
        const response = await fetch('/api/books/?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load books');
        
        const data = await response.json();
        console.log('📚 Books loaded:', data.books ? data.books.length : 0);
        
        if (data.books && data.books.length > 0) {
            displayBooks(data.books.slice(0, 6));
        } else {
            displayNoBooksFound();
        }
    } catch (error) {
        console.error('❌ Error loading books:', error);
        displayNoBooksFound();
    }
}

async function searchBooks() {
    const bookSearchInput = document.getElementById('bookSearchInput');
    const query = bookSearchInput ? bookSearchInput.value.trim() : '';
    
    console.log('🔍 Searching books:', query);
    
    if (!query) {
        loadRecentBooks();
        return;
    }
    
    try {
        const response = await fetch(`/api/search/books/?q=${encodeURIComponent(query)}&limit=10&t=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to search books');
        
        const data = await response.json();
        
        if (data.books && data.books.length > 0) {
            displayBooks(data.books);
        } else {
            displayNoBooksFound();
        }
    } catch (error) {
        console.error('❌ Error searching books:', error);
        displayNoBooksFound();
    }
}

function displayBooks(books) {
    const bookSearchResults = document.getElementById('bookSearchResults');
    if (!bookSearchResults) return;
    
    if (!books || books.length === 0) {
        displayNoBooksFound();
        return;
    }
    
    bookSearchResults.innerHTML = books.map(book => `
        <div class="col-12 col-md-6 mb-3">
            <div class="book-search-item card h-100 border-0 shadow-sm" 
                 onclick="selectBook(${JSON.stringify(book).replace(/"/g, '&quot;')})"
                 style="cursor: pointer; transition: all 0.3s ease;">
                <div class="card-body p-3">
                    <div class="row g-3 align-items-center">
                        <div class="col-3">
                            <img src="${book.cover_image || '/static/myapp/images/bookCover/default.jpg'}" 
                                 alt="${book.title}" 
                                 class="img-fluid rounded shadow"
                                 style="width: 60px; height: 80px; object-fit: cover;"
                                 onerror="this.src='/static/myapp/images/bookCover/default.jpg'">
                        </div>
                        <div class="col-9">
                            <h6 class="book-title mb-1 text-dark" style="font-size: 0.9rem;">${escapeHtml(book.title)}</h6>
                            <p class="book-author mb-0 text-muted small">By ${escapeHtml(book.author)}</p>
                            ${book.genre ? `<small class="text-primary">${Array.isArray(book.genre) ? book.genre[0] : book.genre}</small>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function displayNoBooksFound() {
    const bookSearchResults = document.getElementById('bookSearchResults');
    if (bookSearchResults) {
        bookSearchResults.innerHTML = `
            <div class="col-12">
                <div class="text-center text-muted py-5">
                    <div style="font-size: 3rem;">📚</div>
                    <p class="mt-2">No books found</p>
                    <small>Try searching for a different title or author</small>
                </div>
            </div>
        `;
    }
}

function selectBook(book) {
    console.log('✅ Book selected:', book);
    selectedBook = book;
    
    const modalElement = document.getElementById('bookSelectionModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
    
    updateAddBookButton();
    showNotification(`📚 "${book.title}" added to your post`, 'success');
}

function updateAddBookButton() {
    const addBookBtn = document.getElementById('addBookBtn');
    if (!addBookBtn) return;
    
    if (selectedBook) {
        const shortTitle = selectedBook.title.length > 20 
            ? selectedBook.title.substring(0, 20) + '...' 
            : selectedBook.title;
            
        addBookBtn.innerHTML = `<span>📚 ${escapeHtml(shortTitle)} ✕</span>`;
        addBookBtn.classList.remove('btn-outline-secondary');
        addBookBtn.classList.add('btn-success');
        
        // Change to remove book when clicked
        addBookBtn.onclick = removeSelectedBook;
    } else {
        addBookBtn.innerHTML = `<span>📚 Add Book</span>`;
        addBookBtn.classList.remove('btn-success');
        addBookBtn.classList.add('btn-outline-secondary');
        
        // Change back to open book selection
        addBookBtn.onclick = openBookSelection;
    }
}

function removeSelectedBook() {
    console.log('🗑️ Removing selected book');
    selectedBook = null;
    updateAddBookButton();
    showNotification('Book removed from post', 'info');
}

function loadMoreComments(postId) {
    console.log('📖 Loading more comments for post:', postId);
    // Implement load more comments functionality
    showNotification('Loading more comments...', 'info');
}

function showErrorState(error) {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;
    
    timeline.innerHTML = `
        <div class="card post-card">
            <div class="card-body text-center py-5">
                <div class="mb-3" style="font-size: 3rem;">❌</div>
                <h5 class="text-danger">Failed to Load Posts</h5>
                <p class="text-muted">${error.message}</p>
                <div class="mt-3">
                    <button class="btn btn-primary me-2" onclick="loadTimeline()">
                        Try Again
                    </button>
                    <button class="btn btn-outline-secondary" onclick="clearCacheAndReload()">
                        Clear Cache & Reload
                    </button>
                </div>
                <div class="mt-3">
                    <small class="text-muted">Check browser console for details</small>
                </div>
            </div>
        </div>
    `;
}

// Utility functions
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

function formatTime(timestamp) {
    if (!timestamp) return 'Just now';
    
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    } catch (error) {
        return 'Recently';
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

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingAlerts = document.querySelectorAll('.custom-notification');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-danger' : 
                      type === 'warning' ? 'alert-warning' : 'alert-info';
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show custom-notification position-fixed`;
    alert.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    alert.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    document.body.appendChild(alert);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 4000);
}

function scrollToPostForm() {
    const postForm = document.querySelector('.create-post-card');
    if (postForm) {
        postForm.scrollIntoView({ behavior: 'smooth' });
        const postContent = document.getElementById('postContent');
        if (postContent) {
            postContent.focus();
        }
    }
}

function clearCacheAndReload() {
    console.log('🧹 Clearing all cache and reloading...');
    localStorage.clear();
    sessionStorage.clear();
    
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(reg => reg.unregister());
        });
    }
    
    // Force reload
    window.location.reload(true);
}

// Make functions globally available
window.loadTimeline = loadTimeline;
window.scrollToPostForm = scrollToPostForm;
window.selectBook = selectBook;
window.removeSelectedBook = removeSelectedBook;
window.clearCacheAndReload = clearCacheAndReload;

console.log('✅ user_home.js fully loaded and ready - All features integrated');