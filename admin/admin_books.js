// admin_books.js - ENHANCED WITH FRAMEWORK FUNCTIONALITY
document.addEventListener('DOMContentLoaded', () => {
  console.log('Books Management initialized with frameworks');

  // Initialize frameworks
  initCharts();

  // Add Book Button - ENHANCED WITH BOOTSTRAP MODAL
  const addBookBtn = document.getElementById('addBookBtn');
  if (addBookBtn) {
    addBookBtn.addEventListener('click', () => {
      console.log('Add Book clicked');
      showBootstrapAddBookModal();
    });
  }

  // Import Books Button - ENHANCED
  const importBooksBtn = document.getElementById('importBooksBtn');
  if (importBooksBtn) {
    importBooksBtn.addEventListener('click', () => {
      console.log('Import Books clicked');
      showBootstrapAlert('Book import functionality would open here', 'info');
    });
  }

  // Export Books Button - ENHANCED
  const exportBooksBtn = document.getElementById('exportBooksBtn');
  if (exportBooksBtn) {
    exportBooksBtn.addEventListener('click', () => {
      console.log('Export Books clicked');
      const exportBtn = event.target.closest('.nr-table-action-btn');
      const originalHTML = exportBtn.innerHTML;
      
      // Show loading state
      exportBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Exporting...';
      exportBtn.disabled = true;
      
      setTimeout(() => {
        showBootstrapAlert('Book data exported successfully!', 'success');
        exportBtn.innerHTML = originalHTML;
        exportBtn.disabled = false;
      }, 2000);
    });
  }

  // Print Books Button
  const printBooksBtn = document.getElementById('printBooksBtn');
  if (printBooksBtn) {
    printBooksBtn.addEventListener('click', () => {
      console.log('Print Books clicked');
      window.print();
    });
  }

  // Refresh Books Button - ENHANCED
  const refreshBooksBtn = document.getElementById('refreshBooksBtn');
  if (refreshBooksBtn) {
    refreshBooksBtn.addEventListener('click', () => {
      console.log('Refreshing books list...');
      const refreshBtn = event.target.closest('.nr-table-action-btn');
      const originalHTML = refreshBtn.innerHTML;
      
      refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Refreshing...';
      refreshBtn.disabled = true;
      
      setTimeout(() => {
        showBootstrapAlert('Books list refreshed successfully!', 'success');
        refreshBtn.innerHTML = originalHTML;
        refreshBtn.disabled = false;
        // In real implementation, reload data from server
      }, 1500);
    });
  }

  // Reset Filters - ENHANCED
  const resetFilters = document.getElementById('resetFilters');
  if (resetFilters) {
    resetFilters.addEventListener('click', () => {
      document.getElementById('categoryFilter').value = '';
      document.getElementById('statusFilter').value = '';
      document.getElementById('searchBooks').value = '';
      document.getElementById('sortBooks').value = 'newest';
      console.log('Filters reset');
      applyFilters();
      showBootstrapAlert('All filters have been reset', 'info');
    });
  }

  // Filter functionality
  const filters = ['categoryFilter', 'statusFilter', 'searchBooks', 'sortBooks'];
  filters.forEach(filterId => {
    const filter = document.getElementById(filterId);
    if (filter) {
      filter.addEventListener('change', applyFilters);
      if (filterId === 'searchBooks') {
        filter.addEventListener('input', applyFilters);
      }
    }
  });

  function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    const search = document.getElementById('searchBooks').value.toLowerCase();
    const sort = document.getElementById('sortBooks').value;
    
    console.log('Applying filters:', { category, status, search, sort });
    // Add actual filter and sort logic here
  }

  // Table row click functionality
  const tableRows = document.querySelectorAll('.nr-books-table tbody tr');
  tableRows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (!e.target.closest('.nr-action-buttons')) {
        const bookTitle = row.querySelector('.nr-book-title').textContent;
        const bookAuthor = row.querySelector('.nr-book-author').textContent;
        console.log(`Viewing details for: ${bookTitle} by ${bookAuthor}`);
        showBootstrapBookDetailsModal(bookTitle, bookAuthor);
      }
    });
  });

  // Action buttons functionality - ENHANCED
  const viewButtons = document.querySelectorAll('.nr-action-btn.view');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookTitle = btn.closest('tr').querySelector('.nr-book-title').textContent;
      const bookAuthor = btn.closest('tr').querySelector('.nr-book-author').textContent;
      console.log(`Viewing details for: ${bookTitle}`);
      showBootstrapBookDetailsModal(bookTitle, bookAuthor);
    });
  });

  const editButtons = document.querySelectorAll('.nr-action-btn.edit');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookTitle = btn.closest('tr').querySelector('.nr-book-title').textContent;
      console.log(`Editing book: ${bookTitle}`);
      showBootstrapEditBookModal(bookTitle);
    });
  });

  const deleteButtons = document.querySelectorAll('.nr-action-btn.delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookTitle = btn.closest('tr').querySelector('.nr-book-title').textContent;
      showBootstrapDeleteConfirmation(bookTitle, btn.closest('tr'));
    });
  });

  // Pagination functionality - ENHANCED
  const paginationButtons = document.querySelectorAll('.nr-pagination-btn:not(:disabled)');
  paginationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('active')) {
        console.log('Changing page to:', btn.textContent);
        showBootstrapAlert(`Loading page ${btn.textContent}...`, 'info');
        // Add pagination logic here
      }
    });
  });

  // Modal confirmation for Add Book
  const confirmAddBook = document.getElementById('confirmAddBook');
  if (confirmAddBook) {
    confirmAddBook.addEventListener('click', () => {
      addBookWithFramework();
    });
  }

  // FRAMEWORK FUNCTIONS

  function initCharts() {
    // Books by Category Chart
    const categoryCtx = document.getElementById('booksCategoryChart');
    if (categoryCtx) {
      new Chart(categoryCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Fiction', 'Science', 'Technology', 'History', 'Literature', 'Psychology'],
          datasets: [{
            label: 'Number of Books',
            data: [450, 198, 156, 189, 175, 79],
            backgroundColor: [
              '#297a79',
              '#34b4a9',
              '#5cd6cd',
              '#8ae3dc',
              '#b8f0eb',
              '#e0f2f1'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Monthly Additions Chart
    const monthlyCtx = document.getElementById('monthlyAdditionsChart');
    if (monthlyCtx) {
      new Chart(monthlyCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [{
            label: 'Books Added',
            data: [23, 18, 32, 28, 45, 38, 42],
            borderColor: '#297a79',
            backgroundColor: 'rgba(41, 122, 121, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  function showBootstrapAddBookModal() {
    const modal = new bootstrap.Modal(document.getElementById('addBookModal'));
    modal.show();
  }

  function showBootstrapBookDetailsModal(title, author) {
    // Create dynamic modal for book details
    const modalHTML = `
      <div class="modal fade" id="bookDetailsModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Book Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <h6>${title}</h6>
              <p class="text-muted">by ${author}</p>
              <div class="mt-3">
                <p><strong>ISBN:</strong> 978-0-123-45678-9</p>
                <p><strong>Category:</strong> Fiction</p>
                <p><strong>Status:</strong> <span class="badge bg-success">Available</span></p>
                <p><strong>Added Date:</strong> 2024-01-15</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary">Edit Details</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));
    modal.show();
    
    // Clean up modal after it's hidden
    document.getElementById('bookDetailsModal').addEventListener('hidden.bs.modal', function() {
      this.remove();
    });
  }

  function showBootstrapEditBookModal(title) {
    showBootstrapAlert(`Edit Book: ${title}\n\nEdit form would open here.`, 'info');
  }

  function showBootstrapDeleteConfirmation(title, rowElement) {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      console.log(`Deleting book: ${title}`);
      // Show loading state
      rowElement.style.opacity = '0.5';
      
      setTimeout(() => {
        rowElement.remove();
        showBootstrapAlert(`Book "${title}" has been deleted successfully.`, 'success');
        // Update book count
        updateBookCount(-1);
      }, 1000);
    }
  }

  function addBookWithFramework() {
    const addBtn = document.getElementById('confirmAddBook');
    const originalText = addBtn.innerHTML;
    
    // Show loading state
    addBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Adding...';
    addBtn.disabled = true;

    setTimeout(() => {
      // Hide modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'));
      modal.hide();
      
      // Reset button
      addBtn.innerHTML = originalText;
      addBtn.disabled = false;
      
      // Show success message
      showBootstrapAlert('New book added successfully!', 'success');
      
      // Update book count
      updateBookCount(1);
      
      // Reset form
      document.getElementById('addBookForm').reset();
      
    }, 2000);
  }

  function updateBookCount(change) {
    const countElement = document.querySelector('.nr-table-title');
    if (countElement) {
      const currentText = countElement.textContent;
      const match = currentText.match(/\((\d+)/);
      if (match) {
        const currentCount = parseInt(match[1]);
        const newCount = currentCount + change;
        countElement.textContent = currentText.replace(/\(\d+/, `(${newCount}`);
      }
    }
  }

  function showBootstrapAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.nr-main').insertAdjacentHTML('afterbegin', alertDiv);
    
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }

  // Initialize filters
  applyFilters();

  // Image error handling for book covers
  const bookCoverImages = document.querySelectorAll('.nr-book-cover img');
  bookCoverImages.forEach(img => {
    img.addEventListener('error', function() {
      this.src = '../icons/book-placeholder.png';
      this.alt = 'Book cover not available';
    });
  });
});