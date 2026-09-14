import { useState } from 'react';
import { UserCheck, UserX, Download, Search, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Table } from '@/components/common/Table';
import { usePresences } from '../hooks/usePresences';
import { PresenceService } from '../services/presence.service';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/formatDate';

interface PresenceTableProps {
  sessionId: string;
  sessionName?: string;
}

export function PresenceTable({ sessionId, sessionName }: PresenceTableProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  const { presences, loading, marquerManuel } = usePresences(sessionId);

  const filtered = presences.filter(
    (p) =>
      !debouncedSearch ||
      p.participant?.nom.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.participant?.prenom.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.id));
  };

  const bulkMarquer = async (present: boolean) => {
    if (selected.length === 0) return;

    const promises = selected.map((id) => {
      const presence = presences.find((p) => p.id === id);
      if (!presence) return null;
      return marquerManuel({
        sessionId,
        participantId: presence.participantId,
        present,
      });
    });

    await Promise.all(promises.filter(Boolean));
    setSelected([]);
    toast.success(`${selected.length} présence(s) mise(s) à jour`);
  };

  const columns = [
    {
      key: 'select',
      label: '',
      width: '40px',
      render: (row: any) => (
        <button onClick={() => toggleSelect(row.id)}>
          {selected.includes(row.id) ? (
            <CheckSquare size={18} className="text-odc-primary" />
          ) : (
            <Square size={18} className="text-odc-text-muted-light" />
          )}
        </button>
      ),
    },
    {
      key: 'participant',
      label: 'Participant',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.participant?.photoUrl}
            name={`${row.participant?.prenom} ${row.participant?.nom}`}
            size="sm"
          />
          <div>
            <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark">
              {row.participant?.prenom} {row.participant?.nom}
            </div>
            <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              {row.participant?.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row: any) => formatDate(row.datePresence),
    },
    {
      key: 'heure',
      label: 'Heure',
      render: (row: any) => row.heureScan || '-',
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row: any) => (
        <Badge variant={row.present ? 'success' : 'error'} size="sm">
          {row.present ? 'Présent' : 'Absent'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-heading font-bold text-lg text-odc-text-light dark:text-odc-text-dark">
          Tableau des présences
        </h3>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download size={14} />}
          onClick={() =>
            PresenceService.exportToCsv(presences, `presences-${sessionName || sessionId}`)
          }
        >
          Export CSV
        </Button>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-odc-primary-soft dark:bg-odc-primary-soft/20 border border-odc-primary/30">
          <span className="text-sm font-medium text-odc-primary-dark dark:text-odc-primary-light">
            {selected.length} sélectionné(s)
          </span>
          <div className="flex gap-2">
            <Button
              variant="success"
              size="sm"
              icon={<UserCheck size={14} />}
              onClick={() => bulkMarquer(true)}
            >
              Présents
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<UserX size={14} />}
              onClick={() => bulkMarquer(false)}
            >
              Absents
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <Input
        placeholder="Rechercher..."
        icon={<Search size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucune présence" />
      ) : (
        <div className="border border-odc-border-light dark:border-odc-border-dark rounded-xl overflow-hidden">
          <Table columns={columns} data={filtered} />
        </div>
      )}
    </div>
  );
}