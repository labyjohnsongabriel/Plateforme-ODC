import { useCallback, useEffect, useState } from 'react';
import { FormationService } from '../services/formation.service';
import type { Formation, FormationFilters } from '../types/formation.types';

export function useFormations(initialFilters?: FormationFilters) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<FormationFilters>({
    page: 1,
    limit: 12,
    ...initialFilters,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await FormationService.list(filters);
      setFormations(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFilters = (newFilters: Partial<FormationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  return {
    formations,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    refetch: load,
  };
}