import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { InscriptionService } from '../services/inscription.service';
import type {
  Inscription,
  InscriptionFilters,
  SelectionnerPayload,
  SelectionMassePayload,
  StatutInscription,
} from '../types/inscription.types';

export function useInscriptions(initialFilters?: InscriptionFilters) {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InscriptionFilters>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await InscriptionService.list(filters);
      setInscriptions(response.data);
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

  const selectionner = async (id: string, payload: SelectionnerPayload) => {
    try {
      const updated = await InscriptionService.selectionner(id, payload);
      setInscriptions((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast.success(
        payload.statut === 'ACCEPTEE'
          ? 'Inscription acceptée'
          : payload.statut === 'REFUSEE'
          ? 'Inscription refusée'
          : 'Statut mis à jour'
      );
    } catch {
      toast.error('Erreur');
    }
  };

  const selectionnerMasse = async (
    sessionId: string,
    payload: SelectionMassePayload
  ) => {
    try {
      const result = await InscriptionService.selectionnerMasse(sessionId, payload);
      toast.success(`${result.traites} candidat(s) traité(s)`);
      load();
      return result;
    } catch {
      toast.error('Erreur');
      return null;
    }
  };

  const annuler = async (id: string) => {
    if (!confirm('Annuler cette inscription ?')) return;
    try {
      await InscriptionService.annuler(id);
      setInscriptions((prev) => prev.filter((i) => i.id !== id));
      toast.success('Inscription annulée');
    } catch {
      toast.error('Erreur');
    }
  };

  return {
    inscriptions,
    loading,
    pagination,
    filters,
    updateFilters: (f: Partial<InscriptionFilters>) =>
      setFilters((p) => ({ ...p, ...f, page: 1 })),
    changePage: (page: number) => setFilters((p) => ({ ...p, page })),
    refetch: load,
    selectionner,
    selectionnerMasse,
    annuler,
  };
}