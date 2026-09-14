import { useState } from 'react';
import { ClipboardList, Search, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInscriptions } from '../hooks/useInscriptions';
import { InscriptionCard } from './InscriptionCard';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { InscriptionService } from '../services/inscription.service';
import { StatutInscription } from '../types/inscription.types';

export function InscriptionList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('');
  const debouncedSearch = useDebounce(search, 400);

  const {
    inscriptions,
    loading,
    pagination,
    updateFilters,
    changePage,
    refetch,
  } = useInscriptions({
    search: debouncedSearch,
    statut: statutFilter ? (statutFilter as StatutInscription) : undefined,
  });

  const handleExport = () => {
    InscriptionService.exportToCsv(inscriptions);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
            Inscriptions
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {pagination.total} inscription(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Download size={14} />} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Rechercher un participant..."
              icon={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: StatutInscription.EN_ATTENTE, label: 'En attente' },
              { value: StatutInscription.ACCEPTEE, label: 'Acceptées' },
              { value: StatutInscription.REFUSEE, label: 'Refusées' },
              { value: StatutInscription.LISTE_ATTENTE, label: "Liste d'attente" },
            ]}
          />
        </div>
      </Card>

      {/* Liste */}
      {loading ? (
        <Loader text="Chargement des inscriptions..." />
      ) : inscriptions.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={48} />}
          title="Aucune inscription"
          description="Aucune inscription ne correspond à vos critères"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inscriptions.map((inscription) => (
              <InscriptionCard
                key={inscription.id}
                inscription={inscription}
                onClick={() => navigate(`/inscriptions/${inscription.id}`)}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={changePage}
            />
          )}
        </>
      )}
    </div>
  );
}