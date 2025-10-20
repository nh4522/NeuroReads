// explore.js - ONLY EXPLORE SPECIFIC FUNCTIONALITY

document.addEventListener('DOMContentLoaded', () => {
  initializeExplore();
});

function initializeExplore() {
  loadBooks();
  setupEventListeners();
}

function loadBooks() {
  // Book data for different sections
  const bookData = {
    featuredSeason: [
      {
        title: "Circle of Days",
        author: "Ken Follet",
        image: "../images/bookCover/circle_of_days_ken_follet.jpg",
        category: "featured"
      },
      {
        title: "Dracula",
        author: "Bram Stroker",
        image: "../images/bookCover/dracula_bram_stroker.jpg",
        category: "featured"
      },
      {
        title: "Kite Runner",
        author: "Khaled Hosseini",
        image: "../images/bookCover/kite_runner_khaled_hosseini.jpg",
        category: "featured"
      },
      {
        title: "The Boy in the Striped Pajamas",
        author: "John Boyne",
        image: "../images/bookCover/the_boy_in_the_stripped_pajamas_john_boyne.jpg",
        category: "featured"
      }
    ],
    bestSellers: [
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        image: "../images/bookCover/the_midnight_library_matt_haig.jpg",
        category: "bestseller"
      },
      {
        title: "Project Hail Mary",
        author: "Andy Weir",
        image: "../images/bookCover/project_hail_mary_andy_weir.jpg",
        category: "bestseller"
      },
      {
        title: "The Four Winds",
        author: "Kristin Hannah",
        image: "../images/bookCover/the_four_winds_kristin_hannah.jpg",
        category: "bestseller"
      },
      {
        title: "The Last Thing He Told Me",
        author: "Laura Dave",
        image: "../images/bookCover/the_last_thing_he_told_me_laura_dave.jpg",
        category: "bestseller"
      }
    ],
    newReleases: [
      {
        title: "The Secret of Secrets",
        author: "Dan Brown",
        image: "../images/bookCover/the_secret_of_secrets_dan_brown.jpg",
        category: "new"
      },
      {
        title: "Onyx Storm",
        author: "Rebecca Yaros",
        image: "../images/bookCover/onyx_strom_rebecca_yaros.jpg",
        category: "new"
      },
      {
        title: "The Widow",
        author: "John Grisham",
        image: "../images/bookCover/the_widow_john_grisham.jpg",
        category: "new"
      },
      {
        title: "The Intruder",
        author: "Freida McFadden",
        image: "../images/bookCover/the_intruder_freida_mcfadden.jpg",
        category: "new"
      }
    ],
    classics: [
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        image: "../images/bookCover/to_kill_a_mockingbird.jpg",
        category: "classic"
      },
      {
        title: "1984",
        author: "George Orwell",
        image: "../images/bookCover/1984.jpg",
        category: "classic"
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        image: "../images/bookCover/pride_and_prejudice.jpg",
        category: "classic"
      },
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        image: "../images/bookCover/the_great_gatesby.jpg",
        category: "classic"
      }
    ],
    quickReads: [
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        image: "../images/bookCover/the_alchemist.jpg",
        category: "quick"
      },
      {
        title: "Animal Farm",
        author: "George Orwell",
        image: "../images/bookCover/animal_farm.jpg",
        category: "quick"
      },
      {
        title: "The Old Man and the Sea",
        author: "Ernest Hemingway",
        image: "../images/bookCover/arnest_hemingway_the_old.jpg",
        category: "quick"
      },
      {
        title: "Of Mice and Men",
        author: "John Steinbeck",
        image: "../images/bookCover/of_mice_and_men.jpg",
        category: "quick"
      }
    ],
    trending: [
      {
        title: "It Ends With Us",
        author: "Colleen Hoover",
        image: "../images/bookCover/it_ends_with_us_colleen_hoover.jpg",
        category: "trending"
      },
      {
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        image: "../images/bookCover/seven_husbands.jpg",
        category: "trending"
      },
      {
        title: "You Like It Darker",
        author: "Stephen King",
        image: "../images/bookCover/you_like_it_darker_stephen_king.jpg",
        category: "trending"
      },
      {
        title: "A Court of Thorns and Roses",
        author: "Sarah J. Maas",
        image: "../images/bookCover/a_court_of_thorns_and_roses_sarah_j_mass.jpg",
        category: "trending"
      }
    ]
  };

  // Function to create Bootstrap card for explore sections
  function createBookCard(book, section) {
    const categoryLabels = {
      featured: "Featured",
      bestseller: "Bestseller",
      new: "New Release",
      classic: "Classic",
      quick: "Quick Read",
      trending: "Trending"
    };

    return `
      <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
        <div class="card book-card" data-book-id="${book.title.toLowerCase().replace(/\s+/g, '-')}" data-category="${book.category}">
          <span class="book-category">${categoryLabels[book.category]}</span>
          <img src="${book.image}" class="card-img-top" alt="${book.title}" onerror="this.src='https://via.placeholder.com/300x400/CCCCCC/666666?text=No+Image'">
          <div class="card-body">
            <h5 class="card-title">${book.title}</h5>
            <p class="card-text">By ${book.author}</p>
            <button class="book-action-btn" data-action="add-to-books">
              Add to My Books
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Render books for all sections
  function renderAllBooks() {
    for (const section in bookData) {
      const container = document.getElementById(section);
      if (container) {
        container.innerHTML = bookData[section].map(book => createBookCard(book, section)).join("");
        
        // Add empty state if no books
        if (bookData[section].length === 0) {
          container.innerHTML = `
            <div class="col-12">
              <div class="empty-state">
                <h4>No books available</h4>
                <p>Check back later for new additions!</p>
              </div>
            </div>
          `;
        }
      }
    }
  }

  renderAllBooks();
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
      if (!e.target.classList.contains('book-action-btn') && !e.target.classList.contains('book-category')) {
        const bookId = card.getAttribute('data-book-id');
        const bookTitle = card.querySelector('.card-title').textContent;
        showBookDetails(bookId, bookTitle);
      }
    });
  });

  // Filter functionality (optional enhancement)
  setupFilters();
}

function setupFilters() {
  // You can add genre/category filters here later
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const filter = e.target.getAttribute('data-filter');
      filterBooks(filter);
      
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
}

function filterBooks(filter) {
  // This would filter books based on the selected filter
  showNotification(`Filtering by: ${filter}`, 'info');
}

function handleBookAction(action, bookId, bookTitle) {
  switch(action) {
    case 'add-to-books':
      showNotification(`"${bookTitle}" added to your books!`, 'success');
      // Add your add to books logic here
      break;
    default:
      showNotification(`Action for "${bookTitle}"`, 'info');
  }
}

function showBookDetails(bookId, bookTitle) {
  showNotification(`Opening details for "${bookTitle}"`, 'info');
  // Add your book details logic here
  // window.location.href = `book-details.html?id=${bookId}`;
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