// src/types/dashboard.types.ts
import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   RÔLES & CONTEXTE
   ═══════════════════════════════════════════════════════════════════════════ */

export type RoleName =
  | 'ADMINISTRATEUR'
  | 'STAFF_ODC'
  | 'FORMATEUR'
  | 'PARTICIPANT'
  | 'PARTENAIRE';

export type Period = 'today' | 'week' | 'month' | 'year' | 'all';

export interface DashboardFilters {
  period?: Period;
  dateFrom?: string;
  dateTo?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATS PAR RÔLE — interfaces distinctes
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── ADMIN ──────────────────────────────────────────────────────────── */
export interface AdminKPIs {
  totalUsers: number;
  usersActifs: number;
  totalFormations: number;
  formationsPubliees: number;
  totalSessions: number;
  sessionsOuvertes: number;
  sessionsEnCours: number;
  totalInscriptions: number;
  inscriptionsEnAttente: number;
  inscriptionsAcceptees: number;
  inscriptionsRefusees: number;
  totalAttestations: number;
  totalPartenaires: number;
  totalPresences: number;
  tauxPresenceMoyen: number | null;
}

export interface AdminTrends {
  users: number;
  formations: number;
  sessions: number;
  inscriptions: number;
}

export interface AdminStats {
  kpis: AdminKPIs;
  trends: AdminTrends;
  usersByRole: Array<{ role: string; count: number }>;
  topFormations: Array<{
    id: string;
    titre: string;
    slug: string;
    domaine: string;
    inscriptions: number;
  }>;
  inscriptionsParMois: Array<{ mois: string; count: number }>;
  formationsByDomaine: Array<{ domaine: string; couleur: string; count: number }>;
  sessionsParStatut: Array<{ statut: string; count: number }>;
}

/* ─── STAFF ──────────────────────────────────────────────────────────── */
export interface StaffStats {
  inscriptionsEnAttente: number;
  sessionsActives: number;
  inscriptionsDuJour: number;
  tauxPresenceMoyen: number | null;
  totalSessions: number;
  sessionsOuvertes: number;
  formationsPubliees: number;
  totalPartenaires: number;
  totalInscriptions: number;
  totalUsers: number;
}

/* ─── FORMATEUR ──────────────────────────────────────────────────────── */
export interface FormateurStats {
  totalSessions: number;
  sessionsEnCours: number;
  sessionsTerminees: number;
  sessionsOuvertes: number;
  sessionsAVenir: number;
  totalParticipants: number;
  inscriptionsEnAttente: number;
  tauxPresenceMoyen: number | null;
  prochainesSessions: ProchaineSession[];
}

/* ─── PARTICIPANT ────────────────────────────────────────────────────── */
export interface ParticipantStats {
  totalInscriptions: number;
  inscriptionsAcceptees: number;
  inscriptionsEnAttente: number;
  inscriptionsRefusees: number;
  inscriptionsEnListeAttente: number;
  inscriptionsAnnulees: number;
  formationsEnCours: number;
  formationsTerminees: number;
  attestationsObtenues: number;
  totalPresences: number;
  tauxPresenceMoyen: number | null;
  prochainesSessions: ProchaineSessionParticipant[];
}

/* ─── PARTENAIRE ─────────────────────────────────────────────────────── */
export interface PartenaireStats {
  chiffres: {
    totalFormations: number;
    totalSessions: number;
    totalParticipants: number;
    totalAttestations: number;
  };
  formationsPubliees: number;
  sessionsPubliques: number;
  parDomaine: Array<{ domaine: string; count: number }>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOUS-TYPES COMMUNS
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ProchaineSession {
  id: string;
  code: string;
  formation: string;
  dateDebut: string;
  lieu: string;
}

export interface ProchaineSessionParticipant {
  inscriptionId: string;
  formation: string;
  dateDebut: string;
  statut: string;
  lieu?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   UNION DISCRIMINÉE
   ═══════════════════════════════════════════════════════════════════════════ */

export type DashboardStats =
  | AdminStats
  | StaffStats
  | FormateurStats
  | ParticipantStats
  | PartenaireStats;

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES UI — KPI, CHARTS, ACTIVITÉ
   ═══════════════════════════════════════════════════════════════════════════ */

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
  [key: string]: unknown;
}

export type ActivityType =
  | 'user'
  | 'formation'
  | 'session'
  | 'inscription'
  | 'attestation';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  time: string;
  user?: {
    nom: string;
    prenom: string;
    photoUrl?: string | null;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Vérifie qu'un objet ressemble à des `AdminStats`.
 */
export function isAdminStats(data: unknown): data is AdminStats {
  return !!data && typeof data === 'object' && 'kpis' in data;
}

/**
 * Vérifie qu'un objet ressemble à des `FormateurStats`.
 */
export function isFormateurStats(data: unknown): data is FormateurStats {
  return (
    !!data &&
    typeof data === 'object' &&
    'totalSessions' in data &&
    'prochainesSessions' in data
  );
}

/**
 * Vérifie qu'un objet ressemble à des `ParticipantStats`.
 */
export function isParticipantStats(data: unknown): data is ParticipantStats {
  return (
    !!data &&
    typeof data === 'object' &&
    'totalInscriptions' in data &&
    'formationsEnCours' in data
  );
}

/**
 * Vérifie qu'un objet ressemble à des `StaffStats`.
 */
export function isStaffStats(data: unknown): data is StaffStats {
  return (
    !!data &&
    typeof data === 'object' &&
    'sessionsActives' in data &&
    'inscriptionsDuJour' in data
  );
}

/**
 * Vérifie qu'un objet ressemble à des `PartenaireStats`.
 */
export function isPartenaireStats(data: unknown): data is PartenaireStats {
  return !!data && typeof data === 'object' && 'chiffres' in data;
}