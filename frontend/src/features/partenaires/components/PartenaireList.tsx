import { useState } from 'react';
import { Building2, Search, Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useDebounce } from '@/hooks/useDebounce';
import { PartenaireService } from '../services/partenaire.service';
import { PartenaireCard } from './PartenaireCard';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import toast from 'react-hot-toast';

export function PartenaireList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [secteurFilter, setSecteurFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, refetch } = useFetch(
    () =>
      PartenaireService.list({
        search: debouncedSearch || undefined,
        secteur: secteurFilter || undefined,
        page,
        limit: 12,
      }),
    [debouncedSearch, secteurFilter, page]
  );

  const partenaires = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = async (id: string, nom: string) => {
    if (!confirm(`Supprimer "${nom}" ?`)) return;
    try {
      await PartenaireService.delete(id);
      toast.success('Partenaire supprimé');
      refetch();
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
            Partenaires
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {pagination?.total || 0} partenaire(s)
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/partenaires/create')}
        >
          Nouveau partenaire
        </Button>
      </div>

      {/* Filtres */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Rechercher un partenaire..."
              icon={<Search size={16} />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={secteurFilter}
            onChange={(e) => {
              setSecteurFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Tous les secteurs' },
              ...PartenaireService.getSecteursPredefinis(),
            ]}
          />
        </div>
      </Card>

      {/* Liste */}
      {loading ? (
        <Loader text="Chargement des partenaires..." />
      ) : partenaires.length === 0 ? (
        <EmptyState
          icon={<Building2 size={48} />}
          title="Aucun partenaire trouvé"
          description="Essayez de modifier vos filtres ou créez un nouveau partenaire"
          action={
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => navigate('/partenaires/create')}
            >
              Créer un partenaire
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partenaires.map((partenaire) => (
              <PartenaireCard
                key={partenaire.id}
                partenaire={partenaire}
                onClick={() => navigate(`/partenaires/${partenaire.id}`)}
                onEdit={() => navigate(`/partenaires/${partenaire.id}/edit`)}
                onDelete={() => handleDelete(partenaire.id, partenaire.nom)}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}