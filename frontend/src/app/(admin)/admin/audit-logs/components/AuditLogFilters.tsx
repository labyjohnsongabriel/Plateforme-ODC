// src/app/(admin)/admin/audit-logs/components/AuditLogFilters.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Calendar } from 'lucide-react';
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

const SEVERITES = [
  { value: 'all', label: 'Toutes sévérités' },
  { value: 'INFO', label: 'Info' },
  { value: 'WARNING', label: 'Attention' },
  { value: 'CRITICAL', label: 'Critique' },
];

const ENTITES = [
  { value: 'all', label: 'Toutes entités' },
  { value: 'User', label: 'Utilisateur' },
  { value: 'Role', label: 'Rôle' },
  { value: 'Formation', label: 'Formation' },
  { value: 'Session', label: 'Session' },
  { value: 'Partenaire', label: 'Partenaire' },
  { value: 'Inscription', label: 'Inscription' },
  { value: 'Domaine', label: 'Domaine' },
  { value: 'Attestation', label: 'Attestation' },
];

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function AuditLogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(
    searchParams.get('action') ?? '',
  );
  const debouncedSearch = useDebounce(search, 400);

  /* -------------------- Recherche débouncée -------------------- */
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('action', debouncedSearch);
    else params.delete('action');
    params.delete('page');
    router.push(`/admin/audit-logs?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, router, searchParams]);

  /* -------------------- Mise à jour des filtres -------------------- */
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/admin/audit-logs?${params.toString()}`, { scroll: false });
  };

  /* -------------------- Reset -------------------- */
  const clearAll = () => {
    setSearch('');
    router.push('/admin/audit-logs');
  };

  const hasFilters =
    !!searchParams.get('action') ||
    !!searchParams.get('entite') ||
    !!searchParams.get('severite') ||
    !!searchParams.get('dateDebut') ||
    !!searchParams.get('dateFin');

  /* -------------------- Rendu -------------------- */
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Recherche action */}
          <div className="min-w-[220px] flex-1">
            <Label htmlFor="action" className="text-xs">
              Action
            </Label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-odc-text-muted" />
              <Input
                id="action"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex : USER_CREATE, DELETE_FORMATION…"
                className="pl-9"
              />
            </div>
          </div>

          {/* Entité */}
          <div className="w-[180px]">
            <Label htmlFor="entite" className="text-xs">
              Entité
            </Label>
            <Select
              value={searchParams.get('entite') ?? 'all'}
              onValueChange={(v) => updateParam('entite', v)}
            >
              <SelectTrigger id="entite" className="mt-1.5">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                {ENTITES.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sévérité */}
          <div className="w-[160px]">
            <Label htmlFor="severite" className="text-xs">
              Sévérité
            </Label>
            <Select
              value={searchParams.get('severite') ?? 'all'}
              onValueChange={(v) => updateParam('severite', v)}
            >
              <SelectTrigger id="severite" className="mt-1.5">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                {SEVERITES.map((s) => (
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
              Jusqu'à
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