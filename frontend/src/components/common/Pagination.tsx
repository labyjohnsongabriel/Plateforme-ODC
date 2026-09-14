import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showEdges?: boolean;
  maxVisible?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showEdges = true,
  maxVisible = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('ellipsis');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  const btnBase =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center justify-center gap-1">
      {showEdges && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={cn(btnBase, 'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20')}
        >
          <ChevronsLeft size={16} />
        </button>
      )}

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(btnBase, 'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20')}
      >
        <ChevronLeft size={16} />
      </button>

      {getPages().map((page, i) =>
        page === 'ellipsis' ? (
          <span
            key={`e-${i}`}
            className="px-2 text-odc-text-muted-light dark:text-odc-text-muted-dark"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              btnBase,
              currentPage === page
                ? 'bg-odc-primary text-white shadow-odc-sm'
                : 'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 text-odc-text-light dark:text-odc-text-dark'
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(btnBase, 'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20')}
      >
        <ChevronRight size={16} />
      </button>

      {showEdges && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(btnBase, 'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20')}
        >
          <ChevronsRight size={16} />
        </button>
      )}
    </div>
  );
}