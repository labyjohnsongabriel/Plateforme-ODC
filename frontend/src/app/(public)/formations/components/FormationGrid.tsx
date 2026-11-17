// src/app/(public)/formations/components/FormationGrid.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Search, RefreshCw, Sparkles } from 'lucide-react';
import { FormationCard } from './FormationCard';
import { FormationGridSkeleton } from './FormationGridSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useFormationsPublic } from '@/hooks/queries/useFormations';

export function FormationGrid() {
  const searchParams = useSearchParams();

  const filters = {
    q: searchParams.get('q') ?? undefined,
    domaine: searchParams.get('domaine') ?? undefined,
    niveau: searchParams.getAll('niveau').length
      ? searchParams.getAll('niveau')
      : undefined,
    certifiante: searchParams.get('certifiante') === 'true' ? true : undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  };

  const { data, isLoading, isError, refetch, isFetching } =
    useFormationsPublic(filters);

  /* ═══════ Loading ═══════ */
  if (isLoading) return <FormationGridSkeleton />;

  /* ═══════ Erreur ═══════ */
  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6">
          <EmptyState
            icon={BookOpen}
            title="Erreur de chargement"
            description="Impossible de charger les formations. Vérifiez votre connexion et réessayez."
            action={
              <Button
                variant="outline"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                {isFetching ? (
                  <RefreshCw
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden
                  />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                )}
                Réessayer
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  /* ═══════ Vide ═══════ */
  if (!data?.data?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={Search}
            title="Aucune formation trouvée"
            description="Essayez d'élargir vos critères ou de modifier votre recherche."
            action={
              <Button variant="outline" asChild>
                <Link href="/formations">Réinitialiser les filtres</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  /* ═══════ Rendu ═══════ */
  return (
    <div className="space-y-6">
      {/* ═══════ Compteur ═══════ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
          >
            <Sparkles className="mr-1 h-3 w-3" aria-hidden />
            Résultats
          </Badge>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">
              {data.pagination.total}
            </span>{' '}
            formation{data.pagination.total > 1 ? 's' : ''} trouvée
            {data.pagination.total > 1 ? 's' : ''}
          </p>
        </div>

        {isFetching && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin" aria-hidden />
            Mise à jour…
          </span>
        )}
      </div>

      {/* ═══════ Grille ═══════ */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {data.data.map((formation, index) => (
          <FormationCard
            key={formation.id}
            formation={formation}
            style={{ animationDelay: `${index * 40}ms` }}
          />
        ))}
      </div>

      {/* ═══════ Pagination ═══════ */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
          />
        </div>
      )}
    </div>
  );
}