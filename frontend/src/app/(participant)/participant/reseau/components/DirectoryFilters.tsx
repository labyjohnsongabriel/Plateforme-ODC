'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';

const ROLES = [
  { value: 'PARTICIPANT', label: 'Participants' },
  { value: 'FORMATEUR', label: 'Formateurs' },
  { value: 'STAFF_ODC', label: 'Staff ODC' },
  { value: 'PARTENAIRE', label: 'Partenaires' },
];

export function DirectoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('q', debouncedSearch);
    else params.delete('q');
    params.delete('page');
    router.push(`/participant/reseau/annuaire?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, router, searchParams]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/participant/reseau/annuaire?${params.toString()}`, { scroll: false });
  };

  const hasFilters = !!searchParams.get('q') || !!searchParams.get('role');

  const clearAll = () => {
    setSearch('');
    router.push('/participant/reseau/annuaire');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-odc-muted pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, entreprise, compétence…"
          className="pl-9 input-odc"
        />
      </div>

      <Select
        value={searchParams.get('role') ?? 'all'}
        onValueChange={(v) => updateParam('role', v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tous les rôles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les rôles</SelectItem>
          {ROLES.map((r) => (
            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="h-4 w-4 mr-1.5" /> Réinitialiser
        </Button>
      )}
    </div>
  );
}