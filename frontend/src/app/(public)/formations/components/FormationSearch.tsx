// src/app/(public)/formations/components/FormationSearch.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';

export function FormationSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Valeur "source de vérité" lue depuis l'URL
  const qFromUrl = searchParams.get('q') ?? '';

  // Input contrôlé
  const [search, setSearch] = React.useState(qFromUrl);
  const debouncedSearch = useDebounce(search, 400);

  // Indique si la valeur tapée diffère de celle validée dans l'URL
  const isPending = search.trim() !== qFromUrl;

  /* ─── 1. URL → Input (sync externe : Retour, filtres, liens) ────────── */
  React.useEffect(() => {
    // Ne resynchronise que si l'URL a changé "pour de vrai"
    setSearch((prev) => (prev.trim() === qFromUrl ? prev : qFromUrl));
  }, [qFromUrl]);

  /* ─── 2. Input (debounced) → URL ────────────────────────────────────── */
  React.useEffect(() => {
    const nextQ = debouncedSearch.trim();
    if (nextQ === qFromUrl) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (nextQ) params.set('q', nextQ);
    else params.delete('q');

    // replace : évite de polluer l'historique à chaque frappe
    router.replace(`/formations?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, qFromUrl, router, searchParams]);

  const clearSearch = () => setSearch('');

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-odc-primary" />
        ) : (
          <Search className="h-4 w-4 text-odc-text-muted" />
        )}
      </div>

      <Input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher une formation..."
        className="input-odc h-11 pl-9 pr-10 text-sm"
        aria-label="Rechercher une formation"
      />

      {search && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          aria-label="Effacer la recherche"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}