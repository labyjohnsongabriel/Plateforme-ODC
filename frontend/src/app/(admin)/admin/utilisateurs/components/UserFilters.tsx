// src/app/(admin)/admin/utilisateurs/components/UserFilters.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { useRoles } from '@/hooks/useRoles';

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: roles = [] } = useRoles();
  const [search, setSearch] = React.useState(searchParams.get('q') ?? '');
  const debouncedSearch = useDebounce(search, 400);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('q', debouncedSearch);
    else params.delete('q');
    params.delete('page');
    router.push(`/admin/utilisateurs?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, router, searchParams]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === 'all') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/admin/utilisateurs?${params.toString()}`, { scroll: false });
  };

  const hasFilters =
    !!searchParams.get('q') ||
    !!searchParams.get('roleId') ||
    !!searchParams.get('actif');

  const clearAll = () => {
    setSearch('');
    router.push('/admin/utilisateurs');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-odc-text-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email…"
          className="pl-9"
          aria-label="Rechercher un utilisateur"
        />
      </div>

      <Select
        value={searchParams.get('roleId') ?? 'all'}
        onValueChange={(v) => updateParam('roleId', v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tous les rôles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les rôles</SelectItem>
          {roles.map((r: any) => (
            <SelectItem key={r.id} value={r.id}>
              {r.libelle}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('actif') ?? 'all'}
        onValueChange={(v) => updateParam('actif', v)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="true">Actifs</SelectItem>
          <SelectItem value="false">Inactifs</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="mr-1.5 h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}