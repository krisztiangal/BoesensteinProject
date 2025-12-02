import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxVisible = 5;

  // ------------------- Calculate which pages to show ------------------
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  //----------------------- Adjust startPage if we're near the end -------
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const showLeftEllipsis = startPage > 1;
  const showRightEllipsis = endPage < totalPages;

  return (
    <nav className={styles.pagination} aria-label="Page navigation">
      {/* ------------------------- First Page ----------- */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={styles.pageItem}
        aria-label="Go to first page"
      >
        &laquo;
      </button>

      {/* ------------ Previous Page --------------------- */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.pageItem}
        aria-label="Go to previous page"
      >
        &lsaquo;
      </button>

      {/* -------------------------- Left ellipsis ------------ */}
      {showLeftEllipsis && (
        <span className={`${styles.pageItem} ${styles.ellipsis}`}>
          ...
        </span>
      )}

      {/* ---------------- Page numbers ------------------- */}
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`${styles.pageItem} ${currentPage === number ? styles.active : ''}`}
          aria-label={`Go to page ${number}`}
          aria-current={currentPage === number ? 'page' : undefined}
        >
          {number}
        </button>
      ))}

      {/* ----------------- Right ellipsis ------------------- */}
      {showRightEllipsis && (
        <span className={`${styles.pageItem} ${styles.ellipsis}`}>
          ...
        </span>
      )}

      {/* ----------------- Next Page ------------------- */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.pageItem}
        aria-label="Go to next page"
      >
        &rsaquo;
      </button>

      {/* ----------------- Last Page ------------------- */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={styles.pageItem}
        aria-label="Go to last page"
      >
        &raquo;
      </button>
    </nav>
  );
};

export default Pagination;
