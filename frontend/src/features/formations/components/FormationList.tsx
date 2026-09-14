import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';

import { useFormations } from '../hooks/useFormations';
import { FormationCard } from './FormationCard';
import { FormationFilters } from './FormationFilters';

import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/common/Button';
import { useDebounce } from '@/hooks/useDebounce';

// ✅ Valeur runtime (enum)
import { NiveauFormation } from '../types/formation.types';

// ============================================================================
//  COMPONENT
// ============================================================================

export function FormationList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [domaine, setDomaine] = useState<string>();
  const [niveau, setNiveau] = useState<NiveauFormation>();
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const debouncedSearch = useDebounce(search, 400);

  const { formations, loading, pagination, updateFilters } = useFormations({
    search: debouncedSearch,
    domaine,
    niveau,
  });

  // ========================================================================
  //  HANDLERS
  // ========================================================================

  const handleReset = () => {
    setSearch('');
    setDomaine(undefined);
    setNiveau(undefined);
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========================================================================
  //  RENDER
  // ========================================================================

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
            Formations
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {pagination.total} formation{pagination.total > 1 ? 's' : ''}{' '}
            disponible{pagination.total > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/formations/create')}
        >
          Nouvelle formation
        </Button>
      </div>

      {/* Filtres */}
      <FormationFilters
        search={search}
        onSearchChange={setSearch}
        domaine={domaine}
        onDomaineChange={setDomaine}
        niveau={niveau}
        onNiveauChange={setNiveau}
        view={view}
        onViewChange={setView}
        onReset={handleReset}
      />

      {/* Liste */}
      {loading ? (
        <Loader text="Chargement des formations..." />
      ) : formations.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="Aucune formation trouvée"
          description="Essayez de modifier vos filtres ou créez une nouvelle formation"
          action={
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => navigate('/formations/create')}
            >
              Créer une formation
            </Button>
          }
        />
      ) : (
        <>
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {formations.map((formation) => (
              <FormationCard
                key={formation.id}
                formation={formation}
                compact={view === 'list'}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}