// src/app/(public)/formations/components/FormationSearch.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(
    searchParams.get('q') ?? '',
  );
  const [isSearching, setIsSearching] = React.useState(false);
  const debouncedSearch = useDebounce(search, 500);

  /* -------------------- Effet de recherche -------------------- */
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentQ = params.get('q') ?? '';

    if (debouncedSearch === currentQ) return;

    setIsSearching(true);
    params.delete('page');

    if (debouncedSearch.trim()) {
      params.set('q', debouncedSearch.trim());
    } else {
      params.delete('q');
    }

    router.push(`/formations?${params.toString()}`, { scroll: false });

    const timeout = setTimeout(() => setIsSearching(false), 300);
    return () => clearTimeout(timeout);
  }, [debouncedSearch, router, searchParams]);

  /* -------------------- Reset -------------------- */
  const clearSearch = () => setSearch('');

  /* -------------------- Rendu -------------------- */
  return (
    <div className="relative w-full max-w-md">
      {isSearching ? (
        <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-odc-primary" />
      ) : (
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-odc-text-muted" />
      )}

      <Input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher une formation..."
        className={cn(
          'h-11 pl-9 pr-10 text-sm',
          'input-odc',
        )}
        aria-label="Rechercher une formation"
      />

      {search && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={clearSearch}
          className="absolute right-1.5 top-1/2 -translate-y-1/2"
          aria-label="Effacer la recherche"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}