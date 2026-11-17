'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AdminDashboardData {
  kpis: {
    totalUsers: number;
    usersActifs: number;
    totalFormations: number;
    formationsPubliees: number;
    totalSessions: number;
    sessionsOuvertes: number;
    sessionsEnCours: number;
    totalInscriptions: number;
    inscriptionsEnAttente: number;
    totalAttestations: number;
    totalPartenaires: number;
    tauxPresenceMoyen: number | null;
  };
  trends: {
    users: number;
    formations: number;
    sessions: number;
    inscriptions: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  formationsByDomaine: Array<{ domaine: string; couleur?: string | null; count: number }>;
  topFormations: Array<{ titre: string; inscriptions: number }>;
  inscriptionsParMois: Array<{ mois: string; count: number }>;
  sessionsParStatut: Array<{ statut: string; count: number }>;
}

export const ADMIN_DASHBOARD_QUERY_KEY = ['admin', 'dashboard'] as const;

/**
 * Source unique des données du dashboard.
 * StatsOverview et ChartsSection partagent cette requête : un seul appel
 * à /admin/dashboard au lieu de deux.
 */
export function useAdminDashboard() {
  return useQuery<AdminDashboardData>({
    queryKey: ADMIN_DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data;
    },
    staleTime: 60_000,
  });
}