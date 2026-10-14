// src/app/(participant)/participant/presences/components/PresenceFilters.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Calendar, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const STATUTS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'PRESENT', label: 'Présent' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'RETARD', label: 'Retard' },
  { value: 'EXCUSE', label: 'Excusé' },
] as const;

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function PresenceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* -------------------- Mise à jour URL -------------------- */
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.push(`/participant/presences?${params.toString()}`, {
      scroll: false,
    });
  };

  /* -------------------- Reset -------------------- */
  const clearAll = () => {
    router.push('/participant/presences');
  };

  const hasFilters =
    !!searchParams.get('statut') ||
    !!searchParams.get('dateDebut') ||
    !!searchParams.get('dateFin');

  /* -------------------- Rendu -------------------- */
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Label */}
          <div className="flex items-center gap-2 pb-2">
            <Filter className="h-4 w-4 text-odc-primary" />
            <span className="text-sm font-semibold text-odc-text-primary">
              Filtres
            </span>
          </div>

          {/* Statut */}
          <div className="w-[180px]">
            <Label htmlFor="statut" className="text-xs">
              Statut
            </Label>
            <Select
              value={searchParams.get('statut') ?? 'all'}
              onValueChange={(v) => updateParam('statut', v)}
            >
              <SelectTrigger id="statut" className="mt-1.5">
                <SelectValue />
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
          <div className="w-[160px]">
            <Label htmlFor="dateDebut" className="text-xs">
              Depuis
            </Label>
            <div className="relative mt-1.5">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-odc-text-muted" />
              <Input
                id="dateDebut"
                type="date"
                value={searchParams.get('dateDebut') ?? ''}
                onChange={(e) =>
                  updateParam('dateDebut', e.target.value)
                }
                className="pl-9"
              />
            </div>
          </div>

          {/* Date fin */}
          <div className="w-[160px]">
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