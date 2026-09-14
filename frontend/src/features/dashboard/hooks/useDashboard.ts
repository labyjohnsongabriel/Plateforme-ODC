import { useCallback, useEffect, useState } from 'react';
import { DashboardService } from '../services/dashboard.service';
import { useAuth } from '@/context/AuthContext';

export function useDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.role?.nom) return;

    try {
      setLoading(true);
      setError(null);
      const stats = await DashboardService.getStats(user.role.nom);
      setData(stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [user?.role?.nom]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}