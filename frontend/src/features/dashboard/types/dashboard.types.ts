import type { ReactNode } from 'react';

// ============================================================================
//  KPI
// ============================================================================

export type KPIVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple'
  | 'neutral';

export interface KPI {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: KPIVariant;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export interface AdminDashboardData {
  kpis: {
    totalUsers?: number;
    totalFormations?: number;
    totalSessions?: number;
    sessionsEnCours?: number;
    totalInscriptions?: number;
    inscriptionsEnAttente?: number;
    totalAttestations?: number;
  };
  usersByRole?: Array<{ role: string; count: string }>;
  inscriptionsParMois?: Array<{ mois: string; count: string }>;
  topFormations?: Array<{ titre: string; inscriptions: string }>;
}