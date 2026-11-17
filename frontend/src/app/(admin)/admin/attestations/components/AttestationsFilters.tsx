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

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUTS = [
  { value: 'all', label: 'Tous' },
  { value: 'true', label: 'Valides' },
  { value: 'false', label: 'Invalidées' },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function AttestationsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(
    searchParams.get('search') ?? '',
  );
  const debouncedSearch = useDebounce(search, 400);

  // ⭐ Évite la navigation inutile au montage / doublons
  const lastPushed = React.useRef<string | null>(null);

  /* -------------------- Recherche débouncée -------------------- */
  React.useEffect(() => {
    const current = searchParams.get('search') ?? '';
    if (debouncedSearch === current) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');
    params.delete('page');

    const nextUrl = `/admin/attestations?${params.toString()}`;
    if (lastPushed.current === nextUrl) return;
    lastPushed.current = nextUrl;

    router.push(nextUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  /* -------------------- Synchronisation URL → state -------------------- */
  React.useEffect(() => {
    const urlSearch = searchParams.get('search') ?? '';
    if (urlSearch !== search) setSearch(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* -------------------- Mise à jour des filtres -------------------- */
  const updateParam = React.useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === 'all') params.delete(key);
      else params.set(key, value);
      params.delete('page');
      router.push(`/admin/attestations?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  /* -------------------- Reset -------------------- */
  const clearAll = () => {
    setSearch('');
    lastPushed.current = null;
    router.push('/admin/attestations');
  };

  /* -------------------- Filtres actifs -------------------- */
  const activeFilters = React.useMemo(() => {
    const filters: Array<{ key: string; label: string; value: string }> = [];

    const s = searchParams.get('search');
    if (s) filters.push({ key: 'search', label: `« ${s} »`, value: s });

    const v = searchParams.get('valide');
    if (v) {
      const label = STATUTS.find((x) => x.value === v)?.label ?? v;
      filters.push({ key: 'valide', label, value: v });
    }

    const dd = searchParams.get('dateDebut');
    if (dd) filters.push({ key: 'dateDebut', label: `Depuis ${dd}`, value: dd });

    const df = searchParams.get('dateFin');
    if (df) filters.push({ key: 'dateFin', label: `Jusqu'à ${df}`, value: df });

    return filters;
  }, [searchParams]);

  const hasFilters = activeFilters.length > 0;

  /* -------------------- Rendu -------------------- */
  return (
    <Card>
      <CardContent className="p-4">
        {/* En-tête */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className="h-4 w-4 text-odc-text-muted"
              aria-hidden
            />
            <span className="text-sm font-semibold text-odc-text-primary">
              Filtres
            </span>
            {activeFilters.length > 0 && (
              <Badge
                variant="outline"
                className="border-odc-primary/30 bg-odc-primary-soft text-odc-primary-active"
              >
                {activeFilters.length} actif
                {activeFilters.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 text-xs"
            >
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
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-odc-text-muted"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-odc-text-muted hover:bg-odc-surface-hover hover:text-odc-text-primary"
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
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-odc-text-muted"
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
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-odc-text-muted"
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

        {/* Chips de filtres actifs */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-odc-border pt-3">
            {activeFilters.map((f) => (
              <FilterChip
                key={f.key}
                label={f.label}
                onRemove={() => {
                  if (f.key === 'search') setSearch('');
                  else updateParam(f.key, '');
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOUS-COMPOSANT — chip
   ═══════════════════════════════════════════════════════════════════════════ */

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-odc-border bg-odc-surface px-2.5 py-1 text-xs text-odc-text-primary">
      <Filter className="h-3 w-3 text-odc-text-muted" aria-hidden />
      <span className="max-w-[220px] truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 text-odc-text-muted hover:bg-odc-surface-hover hover:text-odc-error"
        aria-label={`Retirer le filtre ${label}`}
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}