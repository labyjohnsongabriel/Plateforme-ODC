import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { ReseautageService } from '../services/reseautage.service';
import type {
  MemberUser,
  Connection,
  MesConnectionsResponse,
  DirectoryFilters,
} from '../types/reseautage.types';

export function useReseautage(initialFilters?: DirectoryFilters) {
  const [members, setMembers] = useState<MemberUser[]>([]);
  const [suggestions, setSuggestions] = useState<MemberUser[]>([]);
  const [connections, setConnections] = useState<MesConnectionsResponse[]>([]);
  const [demandes, setDemandes] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<DirectoryFilters>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });

  // ========================================================================
  // Charger
  // ========================================================================
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [annuaireRes, suggestionsRes, connectionsRes, demandesRes] =
        await Promise.all([
          ReseautageService.getAnnuaire(filters),
          ReseautageService.getSuggestions(8),
          ReseautageService.getMesConnections(),
          ReseautageService.getDemandes(),
        ]);

      setMembers(annuaireRes.data);
      setPagination({
        page: annuaireRes.pagination.page,
        total: annuaireRes.pagination.total,
        totalPages: annuaireRes.pagination.totalPages,
      });
      setSuggestions(suggestionsRes);
      setConnections(connectionsRes);
      setDemandes(demandesRes);
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? (err.response?.data?.message ?? err.message)
        : err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du réseautage';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  // ========================================================================
  // Actions
  // ========================================================================
  const updateFilters = (newFilters: Partial<DirectoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const envoyerDemande = async (userId: string, message?: string) => {
    try {
      await ReseautageService.envoyerDemande(userId, message);
      toast.success('Demande de connexion envoyée');

      // Retirer des suggestions
      setSuggestions((prev) => prev.filter((u) => u.id !== userId));

      return true;
    } catch {
      toast.error("Impossible d'envoyer la demande de connexion");
      return false;
    }
  };

  const accepter = async (connectionId: string) => {
    try {
      await ReseautageService.accepter(connectionId);
      toast.success('Connexion acceptée');
      load();
    } catch {
      toast.error("Impossible d'accepter cette demande");
    }
  };

  const refuser = async (connectionId: string) => {
    try {
      await ReseautageService.refuser(connectionId);
      toast.success('Connexion refusée');
      load();
    } catch {
      toast.error('Impossible de refuser cette demande');
    }
  };

  const isConnected = (userId: string): boolean => {
    return connections.some((c) => c.user.id === userId);
  };

  return {
    members,
    suggestions,
    connections,
    demandes,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    refetch: load,
    envoyerDemande,
    accepter,
    refuser,
    isConnected,
  };
}
