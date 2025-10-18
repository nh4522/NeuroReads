// admin_books.js - BOOKS MANAGEMENT SPECIFIC FUNCTIONALITY ONLY
document.addEventListener('DOMContentLoaded', () => {
  // Only books-specific functionality here
  // NO DROPDOWN CODE - that's in admin_common.js

  console.log('Books Management initialized');

  // Add Book Button
  const addBookBtn = document.getElementById('addBookBtn');
  if (addBookBtn) {
    addBookBtn.addEventListener('click', () => {
      console.log('Add Book clicked');
      alert('Add Book form would open here');
      // In real implementation, open a modal or navigate to add book page
    });
  }

  // Import Books Button
  const importBooksBtn = document.getElementById('importBooksBtn');
  if (importBooksBtn) {
    importBooksBtn.addEventListener('click', () => {
      console.log('Import Books clicked');
      alert('Book import functionality would open here');
      // Add import logic here
    });
  }

  // Export Books Button
  const exportBooksBtn = document.getElementById('exportBooksBtn');
  if (exportBooksBtn) {
    exportBooksBtn.addEventListener('click', () => {
      console.log('Export Books clicked');
      alert('Exporting book data...');
      // Add export logic here
    });
  }

  // Print Books Button
  const printBooksBtn = document.getElementById('printBooksBtn');
  if (printBooksBtn) {
    printBooksBtn.addEventListener('click', () => {
      console.log('Print Books clicked');
      window.print();
      // Add print logic here
    });
  }

  // Refresh Books Button
  const refreshBooksBtn = document.getElementById('refreshBooksBtn');
  if (refreshBooksBtn) {
    refreshBooksBtn.addEventListener('click', () => {
      console.log('Refreshing books list...');
      location.reload(); // Simple refresh for demo
      // Add refresh logic here
    });
  }

  // Reset Filters
  const resetFilters = document.getElementById('resetFilters');
  if (resetFilters) {
    resetFilters.addEventListener('click', () => {
      document.getElementById('categoryFilter').value = '';
      document.getElementById('statusFilter').value = '';
      document.getElementById('searchBooks').value = '';
      document.getElementById('sortBooks').value = 'newest';
      console.log('Filters reset');
      applyFilters();
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
    // This would typically involve API calls or client-side filtering
  }

  // Table row click functionality
  const tableRows = document.querySelectorAll('.nr-books-table tbody tr');
  tableRows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (!e.target.closest('.nr-action-buttons')) {
        const bookTitle = row.querySelector('.nr-book-title').textContent;
        const bookAuthor = row.querySelector('.nr-book-author').textContent;
        console.log(`Viewing details for: ${bookTitle} by ${bookAuthor}`);
        alert(`Book Details:\n${bookTitle}\nby ${bookAuthor}\n\nFull book details would open here.`);
      }
    });
  });

  // Action buttons functionality
  const viewButtons = document.querySelectorAll('.nr-action-btn.view');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookTitle = btn.closest('tr').querySelector('.nr-book-title').textContent;
      const bookAuthor = btn.closest('tr').querySelector('.nr-book-author').textContent;
      console.log(`Viewing details for: ${bookTitle}`);
      alert(`Viewing full details for:\n${bookTitle}\nby ${bookAuthor}`);
    });
  });

  const editButtons = document.querySelectorAll('.nr-action-btn.edit');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookTitle = btn.closest('tr').querySelector('.nr-book-title').textContent;
      console.log(`Editing book: ${bookTitle}`);
      alert(`Edit Book: ${bookTitle}\n\nEdit form would open here.`);
    });
  });

  const deleteButtons = document.querySelectorAll('.nr-action-btn.delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookTitle = btn.closest('tr').querySelector('.nr-book-title').textContent;
      if (confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`)) {
        console.log(`Deleting book: ${bookTitle}`);
        // Add delete logic here
        alert(`Book "${bookTitle}" has been deleted.`);
      }
    });
  });

  // Pagination functionality
  const paginationButtons = document.querySelectorAll('.nr-pagination-btn:not(:disabled)');
  paginationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('active')) {
        console.log('Changing page to:', btn.textContent);
        // Add pagination logic here
        // This would typically involve API calls for the next page
      }
    });
  });

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