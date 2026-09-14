import { useState } from 'react';
import { Calendar, Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { sessionApi } from '@/services/session.api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { Pagination } from '@/components/common/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/formatDate';

const statutVariant = {
  OUVERTE: 'success',
  FERMEE: 'neutral',
  EN_COURS: 'warning',
  TERMINEE: 'info',
  ANNULEE: 'error',
} as const;

export default function SessionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading } = useFetch(
    () => sessionApi.list({ search: debouncedSearch, statut: statut || undefined, page, limit: 12 }),
    [debouncedSearch, statut, page]
  );

  const sessions = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
            Sessions de formation
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {pagination?.total || 0} session(s)
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => navigate('/sessions/create')}>
          Nouvelle session
        </Button>
      </div>

      {/* Filtres */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Rechercher une session..."
              icon={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'OUVERTE', label: 'Ouvertes' },
              { value: 'EN_COURS', label: 'En cours' },
              { value: 'TERMINEE', label: 'Terminées' },
            ]}
          />
        </div>
      </Card>

      {/* Liste */}
      {loading ? (
        <Loader text="Chargement..." />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} />}
          title="Aucune session"
          action={
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => navigate('/sessions/create')}>
              Créer une session
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session: any) => (
              <Card
                key={session.id}
                hover
                onClick={() => navigate(`/sessions/${session.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white">
                    <Calendar size={22} />
                  </div>
                  <Badge variant={statutVariant[session.statut as keyof typeof statutVariant]}>
                    {session.statut}
                  </Badge>
                </div>

                <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2 text-odc-text-light dark:text-odc-text-dark">
                  {session.formation?.titre || 'Formation'}
                </h3>

                <div className="space-y-1.5 text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                  <div>📅 {formatDate(session.dateDebut)} → {formatDate(session.dateFin)}</div>
                  {session.lieu && <div>📍 {session.lieu}</div>}
                  <div>👥 {session.capacite} places</div>
                </div>
              </Card>
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