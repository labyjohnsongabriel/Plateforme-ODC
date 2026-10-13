'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';

export function FormationSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) params.set('q', debouncedQuery);
    else params.delete('q');
    params.delete('page');

    router.push(`/formations?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router, searchParams]);

  const clear = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/formations?${params.toString()}`);
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-odc-muted pointer-events-none" />
      <Input
        type="text"
        placeholder="Rechercher une formation, un domaine, une compétence..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input-odc pl-10 pr-10 h-12"
        aria-label="Rechercher une formation"
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clear}
          aria-label="Effacer la recherche"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}