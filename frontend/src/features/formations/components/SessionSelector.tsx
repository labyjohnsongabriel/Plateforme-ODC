import { useState } from 'react';
import { Calendar, MapPin, Users, Check, Search } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { useFetch } from '@/hooks/useFetch';
import { sessionApi } from '@/services/session.api';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

interface SessionSelectorProps {
  formationId?: string;
  value?: string;
  onChange: (sessionId: string) => void;
}

export function SessionSelector({ formationId, value, onChange }: SessionSelectorProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, loading } = useFetch(
    () =>
      sessionApi.list({
        formationId,
        statut: 'OUVERTE',
        search: debouncedSearch,
        limit: 20,
      }),
    [formationId, debouncedSearch]
  );

  const sessions = data?.data || [];

  return (
    <div className="space-y-4">
      <Input
        placeholder="Rechercher une session..."
        icon={<Search size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <Loader />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<Calendar size={40} />}
          title="Aucune session disponible"
          description="Aucune session ouverte pour cette formation"
        />
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sessions.map((session: any) => {
            const selected = value === session.id;
            const placesRestantes = session.capacite - (session.inscriptions?.length || 0);

            return (
              <button
                key={session.id}
                onClick={() => onChange(session.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all',
                  'border-2',
                  selected
                    ? 'border-odc-primary bg-odc-primary-soft dark:bg-odc-primary-soft/20'
                    : 'border-odc-border-light dark:border-odc-border-dark hover:border-odc-primary/50'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    selected
                      ? 'bg-odc-primary text-white'
                      : 'bg-odc-primary-soft dark:bg-odc-primary-soft/20 text-odc-primary-dark dark:text-odc-primary-light'
                  )}
                >
                  <Calendar size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark">
                    {formatDate(session.dateDebut)} → {formatDate(session.dateFin)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1">
                    {session.lieu && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={11} />
                        {session.lieu}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {placesRestantes} places
                    </span>
                  </div>
                </div>

                {selected && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-odc-primary flex items-center justify-center">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}