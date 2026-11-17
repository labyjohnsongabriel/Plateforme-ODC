// src/app/(public)/formations/components/FormationFilters.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X, SlidersHorizontal, Check, ChevronDown, Award, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useDomainesPublic } from '@/hooks/queries/useDomaines';

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const NIVEAUX = [
  { value: 'DEBUTANT', label: 'Débutant', dot: 'bg-emerald-500' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire', dot: 'bg-amber-500' },
  { value: 'AVANCE', label: 'Avancé', dot: 'bg-rose-500' },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormationFiltersProps {
  isMobile?: boolean;
  onFilterChange?: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

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

  const activeCount =
    (selectedDomaine ? 1 : 0) +
    selectedNiveaux.length +
    (certifianteFilter ? 1 : 0);
  const hasFilters = activeCount > 0;

  /* ═══════ Navigation ═══════ */
  const navigate = React.useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      mutate(params);
      router.push(`/formations?${params.toString()}`, { scroll: false });
      onFilterChange?.();
    },
    [router, searchParams, onFilterChange],
  );

  const setDomaine = (slug: string | null) =>
    navigate((p) => (slug ? p.set('domaine', slug) : p.delete('domaine')));

  const toggleNiveau = (niveau: string) =>
    navigate((p) => {
      const current = p.getAll('niveau');
      p.delete('niveau');
      const next = current.includes(niveau)
        ? current.filter((n) => n !== niveau)
        : [...current, niveau];
      next.forEach((n) => p.append('niveau', n));
    });

  const toggleCertifiante = () =>
    navigate((p) =>
      certifianteFilter ? p.delete('certifiante') : p.set('certifiante', 'true'),
    );

  const clearAll = () => {
    router.push('/formations', { scroll: false });
    onFilterChange?.();
  };

  return (
    <Card
      className={cn(
        'overflow-hidden border-border/60',
        isMobile && 'border-0 shadow-none',
      )}
    >
      <CardHeader className="border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm">
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
            </div>
            Filtres
            {activeCount > 0 && (
              <Badge className="ml-1 bg-orange-500 text-white hover:bg-orange-600">
                {activeCount}
              </Badge>
            )}
          </CardTitle>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="mr-1 h-3 w-3" aria-hidden /> Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5">
        {/* ═══════ Domaines ═══════ */}
        <div>
          <button
            type="button"
            onClick={() => setDomainesOpen(!domainesOpen)}
            aria-expanded={domainesOpen}
            className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-foreground"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" aria-hidden />
              Domaine
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                domainesOpen && 'rotate-180',
              )}
              aria-hidden
            />
          </button>

          {domainesOpen &&
            (isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9" />
                ))}
              </div>
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto pr-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setDomaine(null)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    !selectedDomaine
                      ? 'bg-orange-50 font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
                      : 'hover:bg-muted',
                  )}
                >
                  <span>Tous les domaines</span>
                  {!selectedDomaine && (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  )}
                </button>

                {domaines.map((d) => {
                  const isSelected = selectedDomaine === d.slug;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDomaine(d.slug)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        isSelected
                          ? 'bg-orange-50 font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
                          : 'hover:bg-muted',
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {d.couleur && (
                          <span
                            className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
                            style={{ backgroundColor: d.couleur }}
                            aria-hidden
                          />
                        )}
                        <span className="truncate">{d.nom}</span>
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
        </div>

        <Separator />

        {/* ═══════ Niveaux ═══════ */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Award className="h-4 w-4 text-orange-500" aria-hidden />
            Niveau
          </h4>
          <div className="space-y-1">
            {NIVEAUX.map((n) => {
              const isChecked = selectedNiveaux.includes(n.value);
              return (
                <label
                  key={n.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors',
                    isChecked
                      ? 'bg-orange-50 dark:bg-orange-950/40'
                      : 'hover:bg-muted',
                  )}
                >
                  <Checkbox
                    id={`niveau-${n.value}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleNiveau(n.value)}
                    className="border-border data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
                  />
                  <Label
                    htmlFor={`niveau-${n.value}`}
                    className={cn(
                      'flex-1 cursor-pointer text-sm',
                      isChecked && 'font-semibold',
                    )}
                  >
                    {n.label}
                  </Label>
                  <span
                    className={cn('h-2 w-2 rounded-full', n.dot)}
                    aria-hidden
                  />
                </label>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* ═══════ Certifiante ═══════ */}
        <label
          className={cn(
            'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors',
            certifianteFilter
              ? 'bg-amber-50 dark:bg-amber-950/40'
              : 'hover:bg-muted',
          )}
        >
          <Checkbox
            id="certifiante"
            checked={certifianteFilter}
            onCheckedChange={toggleCertifiante}
            className="border-border data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500"
          />
          <Label
            htmlFor="certifiante"
            className="flex flex-1 cursor-pointer items-center gap-1.5 text-sm"
          >
            <Award className="h-4 w-4 text-amber-500" aria-hidden />
            Formation certifiante
          </Label>
        </label>

        {/* ═══════ Filtres actifs ═══════ */}
        {hasFilters && (
          <>
            <Separator />
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                Filtres actifs ({activeCount})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedDomaine && (
                  <FilterChip
                    label={
                      domaines.find((d) => d.slug === selectedDomaine)?.nom ??
                      selectedDomaine
                    }
                    onRemove={() => setDomaine(null)}
                  />
                )}
                {selectedNiveaux.map((n) => (
                  <FilterChip
                    key={n}
                    label={NIVEAUX.find((x) => x.value === n)?.label ?? n}
                    onRemove={() => toggleNiveau(n)}
                  />
                ))}
                {certifianteFilter && (
                  <FilterChip
                    label="Certifiante"
                    onRemove={toggleCertifiante}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHIP DE FILTRE
   ═══════════════════════════════════════════════════════════════════════════ */

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      className="cursor-pointer gap-1 border-orange-200 bg-orange-50 text-xs text-orange-700 transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
      role="button"
      tabIndex={0}
      onClick={onRemove}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRemove();
        }
      }}
      aria-label={`Retirer le filtre ${label}`}
    >
      {label}
      <X className="h-3 w-3" aria-hidden />
    </Badge>
  );
}