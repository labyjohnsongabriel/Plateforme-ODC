import { useState } from 'react';
import { Award, Search, Download, Filter } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { AttestationCard } from './AttestationCard';
import { AttestationPreview } from './AttestationPreview';
import { useMyAttestations, useAttestationsList } from '../hooks/useAttestations';
import { useDebounce } from '@/hooks/useDebounce';

interface AttestationListProps {
  mode?: 'mine' | 'all';
}

export function AttestationList({ mode = 'mine' }: AttestationListProps) {
  const [search, setSearch] = useState('');
  const [previewAttestation, setPreviewAttestation] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  // Hooks selon le mode
  const myHook = useMyAttestations();
  const adminHook = useAttestationsList({ search: debouncedSearch });

  const { attestations, loading, download, share } = mode === 'mine' ? myHook : adminHook;

  const handleView = (attestation: any) => {
    setPreviewAttestation(attestation);
    setPreviewOpen(true);
  };

  // Filtrer pour le mode "mine"
  const filtered =
    mode === 'mine'
      ? attestations.filter(
          (a) =>
            !debouncedSearch ||
            a.numero.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            a.session?.formation?.titre.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      : attestations;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl text-odc-text-light dark:text-odc-text-dark">
            {mode === 'mine' ? 'Mes attestations' : 'Toutes les attestations'}
          </h2>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {filtered.length} attestation(s)
          </p>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Rechercher par numéro ou formation..."
        icon={<Search size={18} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Liste */}
      {loading ? (
        <Loader text="Chargement des attestations..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Award size={48} />}
          title="Aucune attestation"
          description={
            mode === 'mine'
              ? 'Vous n\'avez pas encore d\'attestation. Terminez une formation pour en obtenir !'
              : 'Aucune attestation trouvée'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((attestation) => (
              <AttestationCard
                key={attestation.id}
                attestation={attestation}
                onView={handleView}
                onDownload={download}
                onShare={share}
              />
            ))}
          </div>

          {mode === 'all' && (adminHook.pagination?.totalPages || 0) > 1 && (
            <Pagination
              currentPage={adminHook.pagination.page}
              totalPages={adminHook.pagination.totalPages}
              onPageChange={(page) => adminHook.updateFilters({ page })}
            />
          )}
        </>
      )}

      {/* Preview Modal */}
      <AttestationPreview
        attestation={previewAttestation}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onDownload={download}
      />
    </div>
  );
}