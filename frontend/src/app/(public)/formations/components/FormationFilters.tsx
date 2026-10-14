// src/app/(public)/formations/components/FormationFilters.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  SlidersHorizontal,
  Search,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useDomainesPublic } from '@/hooks/queries/useDomaines';

/* ============================================================================
   CONSTANTES
   ============================================================================ */

const NIVEAUX = [
  { value: 'DEBUTANT', label: 'Débutant', color: 'text-emerald-600' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire', color: 'text-amber-600' },
  { value: 'AVANCE', label: 'Avancé', color: 'text-rose-600' },
] as const;

/* ============================================================================
   TYPES
   ============================================================================ */

interface FormationFiltersProps {
  /** Mode mobile (collapse) */
  isMobile?: boolean;
  /** Callback quand un filtre change (mobile) */
  onFilterChange?: () => void;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationFilters({
  isMobile = false,
  onFilterChange,
}: FormationFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: domaines = [], isLoading } = useDomainesPublic();
  const [domainesOpen, setDomainesOpen] = React.useState(true);

  const selectedDomaine = searchParams.get('domaine');
  const selectedNiveaux = searchParams.getAll('niveau');
  const certifianteFilter = searchParams.get('certifiante') === 'true';

  const hasFilters =
    !!selectedDomaine ||
    selectedNiveaux.length > 0 ||
    certifianteFilter;

  /* -------------------- Helpers -------------------- */
  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (value === null) params.delete(key);
    else params.set(key, value);
    router.push(`/formations?${params.toString()}`, { scroll: false });
    onFilterChange?.();
  };

  const toggleNiveau = (niveau: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    const current = params.getAll('niveau');
    params.delete('niveau');

    if (current.includes(niveau)) {
      current
        .filter((n) => n !== niveau)
        .forEach((n) => params.append('niveau', n));
    } else {
      [...current, niveau].forEach((n) => params.append('niveau', n));
    }
    router.push(`/formations?${params.toString()}`, { scroll: false });
    onFilterChange?.();
  };

  const toggleCertifiante = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (certifianteFilter) params.delete('certifiante');
    else params.set('certifiante', 'true');
    router.push(`/formations?${params.toString()}`, { scroll: false });
    onFilterChange?.();
  };

  const clearAll = () => {
    router.push('/formations');
    onFilterChange?.();
  };

  /* -------------------- Rendu -------------------- */
  return (
    <Card className={cn(isMobile && 'border-0 shadow-none')}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="h-4 w-4 text-odc-primary" />
            Filtres
            {hasFilters && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {selectedNiveaux.length + (selectedDomaine ? 1 : 0) + (certifianteFilter ? 1 : 0)}
              </Badge>
            )}
          </CardTitle>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-odc-text-muted hover:text-odc-error"
            >
              <X className="mr-1 h-3 w-3" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ================================================================
            DOMAINES
            ================================================================ */}
        <div>
          <button
            type="button"
            onClick={() => setDomainesOpen(!domainesOpen)}
            className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-odc-text-primary"
          >
            Domaine
            <ChevronDown
              className={cn(
                'h-4 w-4 text-odc-text-muted transition-transform',
                domainesOpen && 'rotate-180',
              )}
            />
          </button>

          {domainesOpen && (
            <>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
                </div>
              ) : (
                <div className="max-h-64 space-y-1 overflow-y-auto scrollbar-thin pr-2">
                  {/* "Tous" */}
                  <button
                    type="button"
                    onClick={() => updateParams('domaine', null)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                      !selectedDomaine
                        ? 'bg-odc-primary-soft font-medium text-odc-primary-active'
                        : 'hover:bg-odc-surface-hover',
                    )}
                  >
                    <span>Tous les domaines</span>
                    {!selectedDomaine && (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {domaines.map((d) => {
                    const isSelected = selectedDomaine === d.slug;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => updateParams('domaine', d.slug)}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                          isSelected
                            ? 'bg-odc-primary-soft font-medium text-odc-primary-active'
                            : 'hover:bg-odc-surface-hover',
                        )}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {d.couleur && (
                            <span
                              className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
                              style={{ backgroundColor: d.couleur }}
                            />
                          )}
                          <span className="truncate">{d.nom}</span>
                        </span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <Separator />

        {/* ================================================================
            NIVEAUX
            ================================================================ */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-odc-text-primary">
            Niveau
          </h4>
          <div className="space-y-2">
            {NIVEAUX.map((n) => {
              const isChecked = selectedNiveaux.includes(n.value);
              return (
                <label
                  key={n.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors',
                    isChecked
                      ? 'bg-odc-primary-soft/50'
                      : 'hover:bg-odc-surface-hover',
                  )}
                >
                  <Checkbox
                    id={`niveau-${n.value}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleNiveau(n.value)}
                  />
                  <Label
                    htmlFor={`niveau-${n.value}`}
                    className={cn(
                      'flex-1 cursor-pointer text-sm',
                      isChecked && 'font-medium',
                    )}
                  >
                    {n.label}
                  </Label>
                  <span
                    className={cn('h-2 w-2 rounded-full', n.color)}
                    style={{ backgroundColor: 'currentColor' }}
                  />
                </label>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* ================================================================
            FORMATION CERTIFIANTE
            ================================================================ */}
        <div>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-odc-surface-hover">
            <Checkbox
              id="certifiante"
              checked={certifianteFilter}
              onCheckedChange={toggleCertifiante}
            />
            <Label htmlFor="certifiante" className="cursor-pointer text-sm">
              Formation certifiante uniquement
            </Label>
          </label>
        </div>

        {/* ================================================================
            FILTRES ACTIFS
            ================================================================ */}
        {hasFilters && (
          <>
            <Separator />
            <div>
              <h4 className="mb-3 text-sm font-semibold text-odc-text-primary">
                Filtres actifs
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedDomaine && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer gap-1 text-xs hover:bg-odc-surface-alt"
                    onClick={() => updateParams('domaine', null)}
                  >
                    {domaines.find((d) => d.slug === selectedDomaine)?.nom ??
                      selectedDomaine}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {selectedNiveaux.map((n) => (
                  <Badge
                    key={n}
                    variant="secondary"
                    className="cursor-pointer gap-1 text-xs hover:bg-odc-surface-alt"
                    onClick={() => toggleNiveau(n)}
                  >
                    {NIVEAUX.find((x) => x.value === n)?.label ?? n}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                {certifianteFilter && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer gap-1 text-xs hover:bg-odc-surface-alt"
                    onClick={toggleCertifiante}
                  >
                    Certifiante
                    <X className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}