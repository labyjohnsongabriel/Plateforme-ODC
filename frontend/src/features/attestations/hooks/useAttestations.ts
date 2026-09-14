import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AttestationService } from '../services/attestation.service';
import type { Attestation, AttestationFilters } from '../types/attestation.types';

// ============================================================================
//  MES ATTESTATIONS (Participant)
// ============================================================================

export function useMyAttestations() {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AttestationService.mesAttestations();
      setAttestations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const download = async (attestation: Attestation) => {
    try {
      await AttestationService.downloadPdf(attestation.id, attestation.numero);
      toast.success('Téléchargement démarré');
    } catch {
      toast.error('Erreur de téléchargement');
    }
  };

  const share = async (attestation: Attestation) => {
    const copied = await AttestationService.copyShareUrl(attestation.numero);
    if (copied) toast.success('Lien copié dans le presse-papiers');
    else toast.error('Impossible de copier');
  };

  return {
    attestations,
    loading,
    error,
    refetch: load,
    download,
    share,
  };
}

// ============================================================================
//  LISTE ATTESTATIONS (Admin/Staff)
// ============================================================================

export function useAttestationsList(initialFilters?: AttestationFilters) {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<AttestationFilters>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AttestationService.list(filters);
      setAttestations(response.data);
      setPagination({
        page: response.pagination.page,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFilters = (newFilters: Partial<AttestationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  return {
    attestations,
    loading,
    pagination,
    filters,
    updateFilters,
    refetch: load,
  };
}

// ============================================================================
//  GÉNÉRATION
// ============================================================================

export function useGenerateAttestation() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generer = async (sessionId: string, participantId: string) => {
    setGenerating(true);
    try {
      const result = await AttestationService.generer({ sessionId, participantId });
      toast.success('Attestation générée');
      return result;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const genererParSession = async (sessionId: string) => {
    setGenerating(true);
    setProgress(0);

    try {
      // Simuler la progression
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 300);

      const result = await AttestationService.genererParSession(sessionId);

      clearInterval(interval);
      setProgress(100);

      toast.success(`${result.succes} attestation(s) générée(s)`);
      return result;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
      return null;
    } finally {
      setGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return { generating, progress, generer, genererParSession };
}