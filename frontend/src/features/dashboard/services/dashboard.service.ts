import { dashboardApi } from '@/services/dashboard.api';
import type {
  AdminDashboardData,
  StaffDashboardData,
  FormateurDashboardData,
  ParticipantDashboardData,
  PartenaireDashboardData,
  ChartDataPoint,
  ActivityItem,
} from '../types/dashboard.types';
import type { RoleName } from '@/types/user.types';

// ============================================================================
//  DASHBOARD SERVICE
// ============================================================================

export class DashboardService {
  /**
   * Récupérer les stats selon le rôle
   */
  static async getStats(role: RoleName): Promise<any> {
    switch (role) {
      case 'ADMIN':
        return dashboardApi.adminStats();
      case 'STAFF':
        return dashboardApi.staffStats();
      case 'FORMATEUR':
        return dashboardApi.formateurStats();
      case 'PARTICIPANT':
        return dashboardApi.participantStats();
      case 'PARTENAIRE':
        return dashboardApi.partenaireStats();
      default:
        return dashboardApi.myStats();
    }
  }

  /**
   * Formatage données pour graphiques
   */
  static formatChartData(data: any[], labelKey: string = 'name', valueKey: string = 'count'): ChartDataPoint[] {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      name: item[labelKey] || item.role || item.mois || item.domaine || item.titre || '',
      value: Number(item[valueKey] || item.inscriptions || 0),
    }));
  }

  /**
   * Calcul du taux de croissance
   */
  static calculateTrend(current: number, previous: number): { value: number; isPositive: boolean } {
    if (previous === 0) return { value: 0, isPositive: true };
    const diff = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(diff)),
      isPositive: diff >= 0,
    };
  }

  /**
   * Palette de couleurs pour charts
   */
  static getChartColors(): string[] {
    return ['#FF7900', '#E65100', '#FFB74D', '#0277BD', '#2E7D32', '#7B1FA2', '#00838F'];
  }

  /**
   * Générer des activités récentes (mock)
   */
  static generateRecentActivities(): ActivityItem[] {
    return [
      { id: '1', type: 'user', message: 'Nouvel utilisateur inscrit', time: 'Il y a 5 min' },
      { id: '2', type: 'formation', message: 'Formation "React" créée', time: 'Il y a 1h' },
      { id: '3', type: 'attestation', message: '10 attestations générées', time: 'Il y a 2h' },
      { id: '4', type: 'session', message: 'Session terminée', time: 'Il y a 3h' },
      { id: '5', type: 'inscription', message: '15 nouvelles inscriptions', time: 'Il y a 5h' },
    ];
  }
}