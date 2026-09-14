import { api } from '@/lib/api';
import type { ApiResponse, DashboardStats } from '@/types/common.types';

export interface DashboardChartData {
  inscriptionsParMois: Array<{ mois: string; count: string }>;
  usersByRole: Array<{ role: string; count: string }>;
  topFormations: Array<{ titre: string; inscriptions: string }>;
  parDomaine: Array<{ domaine: string; count: string }>;
}

export const dashboardApi = {
  getStats: () =>
    api.get<unknown, ApiResponse<DashboardStats>>('/dashboard/stats'),

  getChartData: (period: 'week' | 'month' | 'year' = 'month') =>
    api.get<unknown, ApiResponse<DashboardChartData>>('/dashboard/charts', {
      params: { period },
    }),

  getRecentActivity: () =>
    api.get<unknown, ApiResponse<any[]>>('/dashboard/activity'),
};