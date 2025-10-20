// mybooks.js - USING BOOTSTRAP CARDS

document.addEventListener('DOMContentLoaded', () => {
  initializeMyBooks();
});

function initializeMyBooks() {
  const continueReadingContainer = document.getElementById("continueReading");
  const myBooklistContainer = document.getElementById("myBooklist");

  if (continueReadingContainer && myBooklistContainer) {
    loadBooks();
    setupEventListeners();
  }
}

function loadBooks() {
  const continueReadingContainer = document.getElementById("continueReading");
  const myBooklistContainer = document.getElementById("myBooklist");

  // Book data
  const continueReadingBooks = [
    {
      title: "Harry Potter and the Half Blood Prince",
      author: "J.K. Rowling",
      progress: 98,
      lastRead: "6 days ago",
      image: "../images/bookCover/harry_potter_hbp.jpg",
      status: "reading"
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      progress: 60,
      lastRead: "6 days ago",
      image: "../images/bookCover/pride_and_prejudice.jpeg",
      status: "reading"
    },
    {
      title: "Crime and Punishment",
      author: "Fyodor Dostoyevsky",
      progress: 100,
      lastRead: "8 days ago",
      image: "../images/bookCover/crime_and_punishment.jpeg",
      status: "completed"
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      progress: 45,
      lastRead: "2 days ago",
      image: "../images/bookCover/to_kill_a_mockingbird.jpg",
      status: "reading"
    }
  ];

  const myBooklistBooks = [
    {
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      image: "../images/bookCover/harry_potter_tps.jpg",
      status: "unread"
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      image: "../images/bookCover/the_great_gatesby.jpg",
      status: "unread"
    },
    {
      title: "The Alchemist",
      author: "Paulo Coehlo",
      image: "../images/bookCover/the_alchemist.jpg",
      status: "unread"
    },
    {
      title: "The Shining",
      author: "Stephen King",
      image: "../images/bookCover/the_outsider_stephen_king.jpg",
      status: "unread"
    }
  ];

  // Function to create Bootstrap card for Continue Reading section
  function createContinueReadingCard(book) {
    const statusBadge = book.status === 'completed' ? 
      '<span class="book-status">✅ Completed</span>' : 
      '<span class="book-status">📖 Reading</span>';
    
    return `
      <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
        <div class="card book-card" data-book-id="${book.title.toLowerCase().replace(/\s+/g, '-')}">
          ${statusBadge}
          <img src="${book.image}" class="card-img-top" alt="${book.title}">
          <div class="card-body">
            <h5 class="card-title">${book.title}</h5>
            <p class="card-text">By ${book.author}</p>
            <div class="progress-info">
              <span class="progress-percent">${book.progress}%</span>
              <span class="progress-time">${book.lastRead}</span>
            </div>
            <div class="progress">
              <div class="progress-bar" style="width: ${book.progress}%"></div>
            </div>
            <button class="book-action-btn" data-action="continue">
              ${book.progress === 100 ? 'Read Again' : 'Continue Reading'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Function to create Bootstrap card for My Booklist section
  function createMyBooklistCard(book) {
    const statusBadge = book.status === 'reading' ? 
      '<span class="book-status">📖 Reading</span>' : 
      '<span class="book-status">📚 Unread</span>';
    
    return `
      <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
        <div class="card book-card" data-book-id="${book.title.toLowerCase().replace(/\s+/g, '-')}">
          ${statusBadge}
          <img src="${book.image}" class="card-img-top" alt="${book.title}">
          <div class="card-body">
            <h5 class="card-title">${book.title}</h5>
            <p class="card-text">By ${book.author}</p>
            <button class="book-action-btn" data-action="${book.status === 'reading' ? 'continue' : 'start'}">
              ${book.status === 'reading' ? 'Continue Reading' : 'Start Reading'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Render books using Bootstrap grid
  continueReadingContainer.innerHTML = continueReadingBooks.map(createContinueReadingCard).join("");
  myBooklistContainer.innerHTML = myBooklistBooks.map(createMyBooklistCard).join("");

  // Add empty states
  addEmptyStates();
}

function addEmptyStates() {
  const continueReadingContainer = document.getElementById("continueReading");
  const myBooklistContainer = document.getElementById("myBooklist");

  if (continueReadingContainer.children.length === 0) {
    continueReadingContainer.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <h4>No books in progress</h4>
          <p>Start reading some books to see them here!</p>
          <button class="book-action-btn" onclick="window.location.href='explore.html'">Explore Books</button>
        </div>
      </div>
    `;
  }

  if (myBooklistContainer.children.length === 0) {
    myBooklistContainer.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <h4>Your booklist is empty</h4>
          <p>Add some books to your reading list!</p>
          <button class="book-action-btn" onclick="window.location.href='explore.html'">Browse Books</button>
        </div>
      </div>
    `;
  }
}

function setupEventListeners() {
  // View All buttons
  const viewAllButtons = document.querySelectorAll('.view-all-btn');
  viewAllButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const section = e.target.closest('.book-section');
      const sectionTitle = section.querySelector('.section-title').textContent;
      showNotification(`Viewing all ${sectionTitle.toLowerCase()}`, 'info');
    });
  });

  // Book action buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('book-action-btn')) {
      e.stopPropagation();
      const action = e.target.getAttribute('data-action');
      const bookCard = e.target.closest('.book-card');
      const bookId = bookCard.getAttribute('data-book-id');
      const bookTitle = bookCard.querySelector('.card-title').textContent;
      
      handleBookAction(action, bookId, bookTitle);
    }
  });

  // Book card clicks
  const bookCards = document.querySelectorAll('.book-card');
  bookCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('book-action-btn') && !e.target.classList.contains('book-status')) {
        const bookId = card.getAttribute('data-book-id');
        const bookTitle = card.querySelector('.card-title').textContent;
        showBookDetails(bookId, bookTitle);
      }
    });
  });
}

function handleBookAction(action, bookId, bookTitle) {
  switch(action) {
    case 'start':
      showNotification(`Starting to read "${bookTitle}"`, 'success');
      break;
    case 'continue':
      showNotification(`Continuing "${bookTitle}"`, 'success');
      break;
    default:
      showNotification(`Action for "${bookTitle}"`, 'info');
  }
}

function showBookDetails(bookId, bookTitle) {
  showNotification(`Opening details for "${bookTitle}"`, 'info');
}

function showNotification(message, type = 'info') {
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
  } else {
    // Bootstrap alert fallback
    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info';
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
}