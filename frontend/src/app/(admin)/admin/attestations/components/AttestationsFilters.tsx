// src/app/(admin)/admin/attestations/components/AttestationsFilters.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Calendar, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';

/* ============================================================================
   CONSTANTES
   ============================================================================ */

const STATUTS = [
  { value: 'all', label: 'Tous' },
  { value: 'true', label: 'Valides' },
  { value: 'false', label: 'Invalidées' },
];

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function AttestationsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(
    searchParams.get('search') ?? '',
  );
  const debouncedSearch = useDebounce(search, 400);

  /* -------------------- Recherche débouncée -------------------- */
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');
    params.delete('page');
    router.push(`/admin/attestations?${params.toString()}`, {
      scroll: false,
    });
  }, [debouncedSearch, router, searchParams]);

  /* -------------------- Mise à jour des filtres -------------------- */
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/admin/attestations?${params.toString()}`, {
      scroll: false,
    });
  };

  /* -------------------- Reset -------------------- */
  const clearAll = () => {
    setSearch('');
    router.push('/admin/attestations');
  };

  const hasFilters =
    !!searchParams.get('search') ||
    !!searchParams.get('valide') ||
    !!searchParams.get('dateDebut') ||
    !!searchParams.get('dateFin');

  /* -------------------- Rendu -------------------- */
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Recherche */}
          <div className="min-w-[220px] flex-1">
            <Label htmlFor="search" className="text-xs">
              Rechercher
            </Label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-odc-text-muted" />
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Numéro, participant, formation…"
                className="pl-9"
              />
            </div>
          </div>

          {/* Statut */}
          <div className="w-[160px]">
            <Label htmlFor="valide" className="text-xs">
              Statut
            </Label>
            <Select
              value={searchParams.get('valide') ?? 'all'}
              onValueChange={(v) => updateParam('valide', v)}
            >
              <SelectTrigger id="valide" className="mt-1.5">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                {STATUTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date début */}
          <div className="w-[150px]">
            <Label htmlFor="dateDebut" className="text-xs">
              Depuis
            </Label>
            <div className="relative mt-1.5">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-odc-text-muted" />
              <Input
                id="dateDebut"
                type="date"
                value={searchParams.get('dateDebut') ?? ''}
                onChange={(e) => updateParam('dateDebut', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Date fin */}
          <div className="w-[150px]">
            <Label htmlFor="dateFin" className="text-xs">
              Jusqu&apos;à
            </Label>
            <div className="relative mt-1.5">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-odc-text-muted" />
              <Input
                id="dateFin"
                type="date"
                value={searchParams.get('dateFin') ?? ''}
                onChange={(e) => updateParam('dateFin', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Reset */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="mr-1.5 h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}