import { ReactNode } from 'react';

export interface DashboardStats {
  // KPIs généraux
  totalUsers?: number;
  totalFormations?: number;
  totalSessions?: number;
  sessionsEnCours?: number;
  totalInscriptions?: number;
  inscriptionsEnAttente?: number;
  totalAttestations?: number;

  // Participant
  users?: number;
  formations?: number;
  sessions?: number;
  inscriptions?: number;
  attestations?: number;
  formationsEnCours?: number;
  formationsTerminees?: number;
  attestationsObtenues?: number;

  // Staff
  inscriptionsDuJour?: number;
  sessionsActives?: number;
  tauxPresenceMoyen?: string;

  // Formateur
  totalParticipants?: number;

  // Graphiques
  usersByRole?: Array<{ role: string; count: string }>;
  topFormations?: Array<{ titre: string; inscriptions: string }>;
  inscriptionsParMois?: Array<{ mois: string; count: string }>;
  parDomaine?: Array<{ domaine: string; count: string }>;
  prochainesSessions?: any[];
}

export interface KPI {
  label: string;
  value: number | string;
  icon: ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'info' | 'error' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  link?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ActivityItem {
  id: string;
  type: 'user' | 'formation' | 'session' | 'inscription' | 'attestation';
  message: string;
  time: string;
  user?: {
    nom: string;
    prenom: string;
    photoUrl?: string;
  };
}

export type Period = 'today' | 'week' | 'month' | 'year' | 'all';

export interface DashboardFilters {
  period?: Period;
  dateFrom?: string;
  dateTo?: string;
}