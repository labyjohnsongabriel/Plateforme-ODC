'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useDomainesPublic } from '@/hooks/queries/useDomaines';

const NIVEAUX = [
  { value: 'DEBUTANT', label: 'Débutant' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
  { value: 'AVANCE', label: 'Avancé' },
] as const;

export function FormationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: domaines = [], isLoading } = useDomainesPublic();

  const selectedDomaine = searchParams.get('domaine');
  const selectedNiveaux = searchParams.getAll('niveau');

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (value === null) params.delete(key);
    else params.set(key, value);
    router.push(`/formations?${params.toString()}`, { scroll: false });
  };

  const toggleNiveau = (niveau: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    const current = params.getAll('niveau');
    params.delete('niveau');

    if (current.includes(niveau)) {
      current.filter((n) => n !== niveau).forEach((n) => params.append('niveau', n));
    } else {
      [...current, niveau].forEach((n) => params.append('niveau', n));
    }
    router.push(`/formations?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => router.push('/formations');

  const hasFilters = !!selectedDomaine || selectedNiveaux.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
          </CardTitle>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-odc-muted hover:text-odc-error"
            >
              <X className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold mb-3">Domaine</h4>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 bg-odc-surface-alt rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => updateParams('domaine', null)}
                className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                  !selectedDomaine
                    ? 'bg-odc-primary-soft text-odc-primary font-medium'
                    : 'hover:bg-odc-surface-alt'
                }`}
              >
                Tous les domaines
              </button>

              {domaines.map((d) => (
                <button
                  key={d.id}
                  onClick={() => updateParams('domaine', d.slug)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors flex items-center justify-between gap-2 ${
                    selectedDomaine === d.slug
                      ? 'bg-odc-primary-soft text-odc-primary font-medium'
                      : 'hover:bg-odc-surface-alt'
                  }`}
                >
                  <span className="truncate">{d.nom}</span>
                  {d.couleur && (
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: d.couleur }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-semibold mb-3">Niveau</h4>
          <div className="space-y-2">
            {NIVEAUX.map((n) => (
              <div key={n.value} className="flex items-center gap-2">
                <Checkbox
                  id={`niveau-${n.value}`}
                  checked={selectedNiveaux.includes(n.value)}
                  onCheckedChange={() => toggleNiveau(n.value)}
                />
                <Label htmlFor={`niveau-${n.value}`} className="text-sm cursor-pointer">
                  {n.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {hasFilters && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-3">Filtres actifs</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDomaine && (
                  <Badge variant="secondary" className="text-xs">
                    {domaines.find((d) => d.slug === selectedDomaine)?.nom ??
                      selectedDomaine}
                  </Badge>
                )}
                {selectedNiveaux.map((n) => (
                  <Badge key={n} variant="secondary" className="text-xs">
                    {NIVEAUX.find((x) => x.value === n)?.label ?? n}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}