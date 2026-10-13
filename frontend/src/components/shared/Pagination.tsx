// src/components/shared/Pagination.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Optionnel : callback custom (par défaut : navigation via URL) */
  onPageChange?: (page: number) => void;
  className?: string;
  /** Nom du paramètre URL (par défaut `page`) */
  paramName?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  paramName = 'page',
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goTo = (page: number) => {
    if (onPageChange) return onPageChange(page);

    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete(paramName);
    else params.set(paramName, String(page));

    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => goTo(currentPage - 1)}
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) => {
        if (p === '...') {
          return (
            <span
              key={`e-${i}`}
              className="px-3 text-sm text-odc-muted select-none"
            >
              …
            </span>
          );
        }
        const active = p === currentPage;
        return (
          <Button
            key={p}
            variant={active ? 'odc' : 'ghost'}
            size="icon"
            onClick={() => goTo(p as number)}
            aria-current={active ? 'page' : undefined}
            className="min-w-9"
          >
            {p}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => goTo(currentPage + 1)}
        aria-label="Page suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

function getVisiblePages(
  current: number,
  total: number,
): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];
  if (current > 4) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 3) pages.push('...');
  pages.push(total);

  return pages;
}