import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserService } from '../services/user.service';
import type { User, UserFilters, RoleName } from '../types/user.types';

export function useUsers(initialFilters?: UserFilters) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  // ========================================================================
  // Charger
  // ========================================================================
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UserService.list(filters);
      setUsers(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
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
  const updateFilters = (newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const changePage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const toggleActif = async (id: string, actif: boolean) => {
    try {
      const updated = await UserService.toggleActif(id, actif);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success(actif ? 'Utilisateur activé' : 'Utilisateur désactivé');
    } catch {
      toast.error('Erreur');
    }
  };

  const changeRole = async (id: string, roleNom: RoleName) => {
    try {
      const updated = await UserService.changeRole(id, roleNom);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success('Rôle modifié');
    } catch {
      toast.error('Erreur');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await UserService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('Utilisateur supprimé');
    } catch {
      toast.error('Erreur');
    }
  };

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    refetch: load,
    toggleActif,
    changeRole,
    remove,
  };
}