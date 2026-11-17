// src/app/(admin)/admin/attestations/components/AttestationsFilters.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Calendar, Filter, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
] as const;

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function AttestationsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebounce(search, 400);

  const searchRef = React.useRef<string | null>(null);

  /* -------------------- Recherche débouncée -------------------- */
  React.useEffect(() => {
    // évite une navigation inutile au montage si rien n'a changé
    if (searchRef.current === debouncedSearch) return;
    searchRef.current = debouncedSearch;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');
    params.delete('page');
    router.push(`/staff/attestations?${params.toString()}`, {
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  /* -------------------- Synchronisation externe -------------------- */
  React.useEffect(() => {
    const current = searchParams.get('search') ?? '';
    if (current !== search) setSearch(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* -------------------- Mise à jour des filtres -------------------- */
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/staff/attestations?${params.toString()}`, {
      scroll: false,
    });
  };

  /* -------------------- Reset -------------------- */
  const clearAll = () => {
    setSearch('');
    router.push('/staff/attestations');
  };

  const hasFilters =
    !!searchParams.get('search') ||
    !!searchParams.get('valide') ||
    !!searchParams.get('dateDebut') ||
    !!searchParams.get('dateFin');

  const activeCount = [
    searchParams.get('valide'),
    searchParams.get('dateDebut'),
    searchParams.get('dateFin'),
    searchParams.get('search'),
  ].filter(Boolean).length;

  /* -------------------- Rendu -------------------- */
  return (
    <Card>
      <CardContent className="p-4">
        {/* En-tête */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-odc-text-muted h-4 w-4" aria-hidden />
            <span className="text-odc-text-primary text-sm font-semibold">Filtres</span>
            {activeCount > 0 && (
              <Badge
                variant="outline"
                className="text-odc-primary-active border-odc-primary/30 bg-odc-primary-soft"
              >
                {activeCount} actif{activeCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs">
              <X className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Champs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {/* Recherche */}
          <div className="lg:col-span-5">
            <Label htmlFor="search" className="text-xs">
              Rechercher
            </Label>
            <div className="relative mt-1.5">
              <Search
                className="text-odc-text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Numéro, participant, formation…"
                className="pl-9 pr-9"
                autoComplete="off"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-odc-text-muted hover:bg-odc-surface-hover hover:text-odc-text-primary absolute right-2 top-1/2 -translate-y-1/2 rounded p-1"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className="lg:col-span-3">
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
          <div className="lg:col-span-2">
            <Label htmlFor="dateDebut" className="text-xs">
              Depuis
            </Label>
            <div className="relative mt-1.5">
              <Calendar
                className="text-odc-text-muted pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                aria-hidden
              />
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
          <div className="lg:col-span-2">
            <Label htmlFor="dateFin" className="text-xs">
              Jusqu&apos;à
            </Label>
            <div className="relative mt-1.5">
              <Calendar
                className="text-odc-text-muted pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                aria-hidden
              />
              <Input
                id="dateFin"
                type="date"
                value={searchParams.get('dateFin') ?? ''}
                onChange={(e) => updateParam('dateFin', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Résumé des filtres actifs */}
        {hasFilters && (
          <div className="border-odc-border mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
            {searchParams.get('search') && (
              <FilterChip
                label={`Recherche : "${searchParams.get('search')}"`}
                onRemove={() => updateParam('search', '')}
              />
            )}
            {searchParams.get('valide') && (
              <FilterChip
                label={`Statut : ${
                  STATUTS.find((s) => s.value === searchParams.get('valide'))?.label ??
                  searchParams.get('valide')
                }`}
                onRemove={() => updateParam('valide', 'all')}
              />
            )}
            {searchParams.get('dateDebut') && (
              <FilterChip
                label={`Depuis : ${searchParams.get('dateDebut')}`}
                onRemove={() => updateParam('dateDebut', '')}
              />
            )}
            {searchParams.get('dateFin') && (
              <FilterChip
                label={`Jusqu'à : ${searchParams.get('dateFin')}`}
                onRemove={() => updateParam('dateFin', '')}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================================
   SOUS-COMPOSANT — chip de filtre
   ============================================================================ */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="border-odc-border bg-odc-surface text-odc-text-primary inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs">
      <Filter className="text-odc-text-muted h-3 w-3" aria-hidden />
      <span className="max-w-[220px] truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-odc-text-muted hover:bg-odc-surface-hover ml-0.5 rounded-full p-0.5 hover:text-odc-error"
        aria-label={`Retirer le filtre ${label}`}
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}
