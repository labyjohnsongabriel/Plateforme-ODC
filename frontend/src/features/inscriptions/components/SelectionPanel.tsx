import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  CheckCheck,
  Search,
  Users,
} from 'lucide-react';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Textarea } from '@/components/common/Textarea';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatutBadge } from './StatutBadge';
import { formatDate } from '@/utils/formatDate';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';

// ✅ VALEUR (enum) → import normal
import { StatutInscription } from '../types/inscription.types';

// ✅ TYPES purs → import type séparé
import type {
  Inscription,
  SelectionMassePayload,
} from '../types/inscription.types';

// ============================================================================
//  PROPS
// ============================================================================

interface SelectionPanelProps {
  inscriptions: Inscription[];
  loading?: boolean;
  onSelectionChange: (
    id: string,
    statut: StatutInscription,
    motif?: string
  ) => Promise<void>;
  onBulkSelection?: (payload: SelectionMassePayload) => Promise<void>;
  sessionId: string;
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function SelectionPanel({
  inscriptions,
  loading,
  onSelectionChange,
  onBulkSelection,
  sessionId: _sessionId,
}: SelectionPanelProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [refuseModal, setRefuseModal] = useState<{
    open: boolean;
    id?: string;
    bulk?: boolean;
  }>({ open: false });
  const [motifRefus, setMotifRefus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // ========================================================================
  //  FILTRES
  // ========================================================================

  const filtered = inscriptions.filter(
    (i) =>
      !debouncedSearch ||
      i.participant?.nom
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      i.participant?.prenom
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      i.participant?.email
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
  );

  const pendingInscriptions = filtered.filter(
    (i) => i.statut === StatutInscription.EN_ATTENTE
  );

  // ========================================================================
  //  ACTIONS
  // ========================================================================

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const pendingIds = pendingInscriptions.map((i) => i.id);
    setSelected(pendingIds.length === selected.length ? [] : pendingIds);
  };

  const handleBulkAccept = async () => {
    if (!onBulkSelection || selected.length === 0) return;
    setActionLoading(true);
    try {
      await onBulkSelection({
        inscriptionIds: selected,
        statut: StatutInscription.ACCEPTEE,
      });
      setSelected([]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkRefuse = () => {
    if (selected.length === 0) return;
    setRefuseModal({ open: true, bulk: true });
  };

  const confirmRefuse = async () => {
    setActionLoading(true);
    try {
      if (refuseModal.bulk && onBulkSelection) {
        await onBulkSelection({
          inscriptionIds: selected,
          statut: StatutInscription.REFUSEE,
          motifRefus,
        });
        setSelected([]);
      } else if (refuseModal.id) {
        await onSelectionChange(
          refuseModal.id,
          StatutInscription.REFUSEE,
          motifRefus
        );
      }
      setRefuseModal({ open: false });
      setMotifRefus('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSingle = async (id: string, statut: StatutInscription) => {
    setActionLoading(true);
    try {
      await onSelectionChange(id, statut);
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================================================
  //  RENDER
  // ========================================================================

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {selected.length > 0 && (
        <Card
          padding="md"
          className="bg-odc-primary-soft dark:bg-odc-primary-soft/20 border-odc-primary/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Badge variant="primary" size="md">
                {selected.length} sélectionné(s)
              </Badge>
              <button
                onClick={() => setSelected([])}
                className="text-xs text-odc-primary hover:underline font-medium"
              >
                Tout désélectionner
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="success"
                size="sm"
                icon={<CheckCheck size={14} />}
                onClick={handleBulkAccept}
                loading={actionLoading}
              >
                Accepter tout
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<XCircle size={14} />}
                onClick={handleBulkRefuse}
                disabled={actionLoading}
              >
                Refuser tout
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Header */}
      <Card padding="md">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-odc-primary" />
            <div>
              <h3 className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark">
                Candidats ({pendingInscriptions.length} en attente)
              </h3>
              <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                {filtered.length} au total
              </p>
            </div>
          </div>
          {pendingInscriptions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={selectAll}>
              {selected.length === pendingInscriptions.length
                ? 'Tout désélectionner'
                : 'Tout sélectionner'}
            </Button>
          )}
        </div>

        <Input
          placeholder="Rechercher un candidat..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Liste */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title="Aucun candidat"
          description="Aucune inscription pour cette session"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((inscription) => {
            const isSelected = selected.includes(inscription.id);
            const isPending =
              inscription.statut === StatutInscription.EN_ATTENTE;

            return (
              <Card
                key={inscription.id}
                padding="md"
                className={cn(
                  'transition-all',
                  isSelected
                    ? 'border-2 border-odc-primary bg-odc-primary-soft/30 dark:bg-odc-primary-soft/10'
                    : 'border border-odc-border-light dark:border-odc-border-dark'
                )}
              >
                <div className="flex items-center gap-4">
                  {isPending && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(inscription.id)}
                      className="w-4 h-4 rounded border-odc-border-light text-odc-primary focus:ring-odc-primary/20 cursor-pointer"
                    />
                  )}

                  <Avatar
                    src={inscription.participant?.photoUrl}
                    name={`${inscription.participant?.prenom} ${inscription.participant?.nom}`}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark truncate">
                      {inscription.participant?.prenom}{' '}
                      {inscription.participant?.nom}
                    </div>
                    <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark truncate">
                      {inscription.participant?.email}
                    </div>
                    {inscription.motivation && (
                      <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1 line-clamp-1">
                        💬 {inscription.motivation}
                      </div>
                    )}
                    <div className="text-[10px] text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1">
                      Inscrit le {formatDate(inscription.dateInscription)}
                    </div>
                  </div>

                  <StatutBadge statut={inscription.statut} size="sm" />

                  {isPending && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          handleSingle(
                            inscription.id,
                            StatutInscription.ACCEPTEE
                          )
                        }
                        disabled={actionLoading}
                        className="p-2 rounded-lg bg-odc-success-bg text-odc-success hover:bg-odc-success hover:text-white transition-colors disabled:opacity-50"
                        title="Accepter"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setRefuseModal({ open: true, id: inscription.id })
                        }
                        disabled={actionLoading}
                        className="p-2 rounded-lg bg-odc-error-bg text-odc-error hover:bg-odc-error hover:text-white transition-colors disabled:opacity-50"
                        title="Refuser"
                      >
                        <XCircle size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleSingle(
                            inscription.id,
                            StatutInscription.LISTE_ATTENTE
                          )
                        }
                        disabled={actionLoading}
                        className="p-2 rounded-lg bg-odc-info-bg text-odc-info hover:bg-odc-info hover:text-white transition-colors disabled:opacity-50"
                        title="Liste d'attente"
                      >
                        <Clock size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal refus */}
      <Modal
        isOpen={refuseModal.open}
        onClose={() => setRefuseModal({ open: false })}
        title={refuseModal.bulk ? 'Refuser les candidats' : 'Motif du refus'}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setRefuseModal({ open: false })}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={confirmRefuse}
              loading={actionLoading}
            >
              Confirmer le refus
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {refuseModal.bulk && (
            <div className="p-3 rounded-lg bg-odc-warning-bg border border-odc-warning/30">
              <p className="text-xs text-odc-warning">
                ⚠️ Vous êtes sur le point de refuser{' '}
                <strong>{selected.length}</strong> candidat(s).
              </p>
            </div>
          )}
          <Textarea
            label="Motif du refus (optionnel)"
            placeholder="Expliquez la raison du refus..."
            rows={3}
            maxLength={500}
            showCount
            value={motifRefus}
            onChange={(e) => setMotifRefus(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export default SelectionPanel;