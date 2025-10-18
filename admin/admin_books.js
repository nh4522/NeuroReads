// admin_books.js - BOOKS-SPECIFIC FUNCTIONALITY ONLY
document.addEventListener('DOMContentLoaded', () => {
  // Only books-specific functionality here
  // NO DROPDOWN CODE - that's in admin_common.js

  // Table row click functionality
  const tableRows = document.querySelectorAll('.nr-books-table tbody tr');
  tableRows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (!e.target.closest('.nr-action-buttons')) {
        const bookTitle = row.querySelector('.nr-book-title').textContent;
        console.log(`Viewing details for: ${bookTitle}`);
        // In real implementation, you would open a modal or navigate to details page
        alert(`Viewing details for: ${bookTitle}`);
      }
    });
  });

  // Add books management functionality
  const addBookBtn = document.querySelector('.nr-books-btn');
  if (addBookBtn) {
    addBookBtn.addEventListener('click', () => {
      console.log('Add new book clicked');
      // Add book creation logic here
    });
  }

  // Filter functionality
  const filterSelects = document.querySelectorAll('.nr-filter-select, .nr-filter-input');
  filterSelects.forEach(select => {
    select.addEventListener('change', () => {
      console.log('Filter changed:', select.name, select.value);
      // Add filter logic here
    });
  });

  // Action buttons functionality
  const editButtons = document.querySelectorAll('.nr-action-btn.edit');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookTitle = btn.closest('tr').querySelector('.nr-book-title').textContent;
      console.log(`Editing book: ${bookTitle}`);
      // Add edit logic here
    });
  });

  const deleteButtons = document.querySelectorAll('.nr-action-btn.delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookTitle = btn.closest('tr').querySelector('.nr-book-title').textContent;
      if (confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
        console.log(`Deleting book: ${bookTitle}`);
        // Add delete logic here
      }
    });
  });

  // Pagination functionality
  const paginationButtons = document.querySelectorAll('.nr-pagination-btn');
  paginationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('active')) {
        console.log('Changing page to:', btn.textContent);
        // Add pagination logic here
      }
    });
  });
});