import { UserCheck, UserX, Clock, Search, Download, Filter, Calendar } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { usePresences } from '../hooks/usePresences';
import { PresenceService } from '../services/presence.service';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/formatDate';

interface PresenceListProps {
  sessionId: string;
  sessionName?: string;
}

export function PresenceList({ sessionId, sessionName }: PresenceListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const debouncedSearch = useDebounce(search, 300);

  const { presences, loading, marquerManuel, refetch } = usePresences(sessionId);

  // Filtrer
  const filtered = presences.filter((p) => {
    const matchSearch =
      !debouncedSearch ||
      p.participant?.nom.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.participant?.prenom.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.participant?.email.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchFilter =
      filter === 'all' ||
      (filter === 'present' && p.present) ||
      (filter === 'absent' && !p.present);

    return matchSearch && matchFilter;
  });

  const handleExport = () => {
    PresenceService.exportToCsv(filtered, `presences-${sessionName || sessionId}`);
    toast.success('Export CSV téléchargé');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-heading font-bold text-lg text-odc-text-light dark:text-odc-text-dark">
            Liste des présences
          </h3>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {filtered.length} enregistrement(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un participant..."
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'present', label: 'Présents' },
              { value: 'absent', label: 'Absents' },
            ]}
          />
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} />}
          title="Aucune présence"
          description="Aucun enregistrement trouvé pour cette session"
        />
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map((presence) => (
            <div
              key={presence.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-odc-border-light dark:border-odc-border-dark bg-white dark:bg-odc-surface-dark hover:border-odc-primary/40 transition-colors"
            >
              <Avatar
                src={presence.participant?.photoUrl}
                name={`${presence.participant?.prenom} ${presence.participant?.nom}`}
                size="md"
              />

              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark truncate">
                  {presence.participant?.prenom} {presence.participant?.nom}
                </div>
                <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark truncate">
                  {presence.participant?.email}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-odc-text-muted-light dark:text-odc-text-muted-dark">
                  <span>{formatDate(presence.datePresence)}</span>
                  {presence.heureScan && (
                    <span className="flex items-center gap-0.5">
                      <Clock size={9} />
                      {presence.heureScan}
                    </span>
                  )}
                </div>
              </div>

              <Badge variant={presence.present ? 'success' : 'error'} size="sm">
                {presence.present ? (
                  <>
                    <UserCheck size={10} />
                    Présent
                  </>
                ) : (
                  <>
                    <UserX size={10} />
                    Absent
                  </>
                )}
              </Badge>

              {/* Toggle */}
              <button
                onClick={() =>
                  marquerManuel({
                    sessionId,
                    participantId: presence.participantId,
                    present: !presence.present,
                  })
                }
                className="p-2 rounded-lg hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 transition-colors"
                title={presence.present ? 'Marquer absent' : 'Marquer présent'}
              >
                {presence.present ? (
                  <UserX size={16} className="text-odc-error" />
                ) : (
                  <UserCheck size={16} className="text-odc-success" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}