'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const displayPages = pages.slice(
    Math.max(0, Math.min(currentPage - 3, totalPages - 5)),
    Math.min(totalPages, Math.max(5, currentPage + 2))
  );

  return (
    <nav className="flex items-center justify-between" aria-label="Pagination">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border-2 border-retro-navy text-sm font-medium rounded-md text-retro-navy bg-white hover:bg-retro-cream disabled:opacity-50 disabled:cursor-not-allowed shadow-retro"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 border-2 border-retro-navy text-sm font-medium rounded-md text-retro-navy bg-white hover:bg-retro-cream disabled:opacity-50 disabled:cursor-not-allowed shadow-retro"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-retro-navy font-medium">
            Page <span className="font-bold">{currentPage}</span> of{' '}
            <span className="font-bold">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 rounded-l-md border-2 border-retro-navy bg-white text-sm font-medium text-retro-navy hover:bg-retro-cream disabled:opacity-50 disabled:cursor-not-allowed shadow-retro"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            {currentPage > 3 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="relative inline-flex items-center px-4 py-2 border-t-2 border-b-2 border-l-2 border-retro-navy bg-white text-sm font-medium text-retro-navy hover:bg-retro-cream shadow-retro"
                >
                  1
                </button>
                {currentPage > 4 && (
                  <span className="relative inline-flex items-center px-4 py-2 border-t-2 border-b-2 border-l-2 border-retro-navy bg-white text-sm font-medium text-retro-navy">
                    ...
                  </span>
                )}
              </>
            )}

            {displayPages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border-t-2 border-b-2 border-l-2 border-retro-navy text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-retro-mint text-retro-navy font-bold hover:bg-retro-mint/90'
                    : 'bg-white text-retro-navy hover:bg-retro-cream'
                } shadow-retro`}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span className="relative inline-flex items-center px-4 py-2 border-t-2 border-b-2 border-l-2 border-retro-navy bg-white text-sm font-medium text-retro-navy">
                    ...
                  </span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="relative inline-flex items-center px-4 py-2 border-t-2 border-b-2 border-l-2 border-retro-navy bg-white text-sm font-medium text-retro-navy hover:bg-retro-cream shadow-retro"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 rounded-r-md border-2 border-retro-navy bg-white text-sm font-medium text-retro-navy hover:bg-retro-cream disabled:opacity-50 disabled:cursor-not-allowed shadow-retro"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </nav>
  );
} 