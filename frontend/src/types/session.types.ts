import type { ID, Timestamp, PaginationParams } from './common.types';
import type { Formation } from './formation.types';
import type { User } from './user.types';

/* ============================================================================
   STATUTS
   ============================================================================ */

export enum StatutSession {
  PLANIFIEE = 'PLANIFIEE',
  OUVERTE = 'OUVERTE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

/**
 * Statuts considérés "inactifs" (plus d'inscription possible).
 */
export const STATUTS_INACTIFS: StatutSession[] = [
  StatutSession.TERMINEE,
  StatutSession.ANNULEE,
];

/* ============================================================================
   ENTITÉ SESSION
   ============================================================================ */

export interface Session {
  id: ID;
  codeSession: string; // ⬅️ AJOUT (utilisé dans SessionsTable)
  formation: Formation;
  formationId: ID;
  formateur?: User;
  formateurId?: ID;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  lienVisio?: string;
  capacite: number;
  statut: StatutSession;
  presenceOuverte: boolean; // ⬅️ AJOUT (utilisé dans SessionsTable)
  notes?: string;
  inscriptions?: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/* ============================================================================
   PAYLOADS CRÉATION / MISE À JOUR
   ============================================================================ */

/**
 * Payload de création d'une session.
 * (alias : SessionCreateInput pour compatibilité avec les hooks)
 */
export interface CreateSessionPayload {
  formationId: ID;
  formateurId?: ID;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  lienVisio?: string;
  capacite: number;
  notes?: string;
}

export type SessionCreateInput = CreateSessionPayload;

/**
 * Payload de mise à jour d'une session.
 * (alias : SessionUpdateInput pour compatibilité avec les hooks)
 */
export interface UpdateSessionPayload extends Partial<CreateSessionPayload> {
  statut?: StatutSession;
  presenceOuverte?: boolean;
}

export type SessionUpdateInput = UpdateSessionPayload;

/* ============================================================================
   FILTRES
   ============================================================================ */

export interface SessionFilters extends PaginationParams {
  statut?: StatutSession;
  formationId?: ID;
  formateurId?: ID;
  dateDebut?: string;
  dateFin?: string;
}

/* ============================================================================
   CONFIG AFFICHAGE
   ============================================================================ */

export const STATUT_SESSION_CONFIG: Record<
  StatutSession,
  { label: string; variant: string; color: string }
> = {
  [StatutSession.PLANIFIEE]: {
    label: 'Planifiée',
    variant: 'info',
    color: 'text-odc-info',
  },
  [StatutSession.OUVERTE]: {
    label: 'Ouverte',
    variant: 'success',
    color: 'text-odc-success',
  },
  [StatutSession.EN_COURS]: {
    label: 'En cours',
    variant: 'warning',
    color: 'text-odc-warning',
  },
  [StatutSession.TERMINEE]: {
    label: 'Terminée',
    variant: 'neutral',
    color: 'text-odc-text-muted',
  },
  [StatutSession.ANNULEE]: {
    label: 'Annulée',
    variant: 'error',
    color: 'text-odc-error',
  },
};