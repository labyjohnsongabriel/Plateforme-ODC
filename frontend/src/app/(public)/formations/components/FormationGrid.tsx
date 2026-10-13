'use client';

import { useSearchParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { FormationCard } from './FormationCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useFormationsPublic } from '@/hooks/queries/useFormations';

export function FormationGrid() {
  const searchParams = useSearchParams();

  const filters = {
    q: searchParams.get('q') ?? undefined,
    domaine: searchParams.get('domaine') ?? undefined,
    niveau: searchParams.getAll('niveau').length
      ? searchParams.getAll('niveau')
      : undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  };

  const { data, isLoading, isError } = useFormationsPublic(filters);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Erreur de chargement"
        description="Impossible de charger les formations. Réessayez plus tard."
      />
    );
  }

  if (!data?.data?.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Aucune formation trouvée"
        description="Essayez de modifier vos filtres ou votre recherche."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-odc-muted">
          <span className="font-semibold text-odc-text-primary">
            {data.pagination.total}
          </span>{' '}
          formation{data.pagination.total > 1 ? 's' : ''} trouvée
          {data.pagination.total > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.data.map((formation, index) => (
          <FormationCard
            key={formation.id}
            formation={formation}
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div>

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