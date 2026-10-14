<<<<<<< HEAD
import { ID, Timestamp, PaginationParams } from './common.types';
import { Formation } from './formation.types';
import { User } from './user.types';

export enum StatutSession {
  OUVERTE = 'OUVERTE',
  FERMEE = 'FERMEE',
=======
import type { ID, Timestamp, PaginationParams } from './common.types';
import type { Formation } from './formation.types';
import type { User } from './user.types';

/* ============================================================================
   STATUTS
   ============================================================================ */

export enum StatutSession {
  PLANIFIEE = 'PLANIFIEE',
  OUVERTE = 'OUVERTE',
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

<<<<<<< HEAD
export interface Session {
  id: ID;
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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
<<<<<<< HEAD
=======
  presenceOuverte: boolean; // ⬅️ AJOUT (utilisé dans SessionsTable)
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  notes?: string;
  inscriptions?: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

<<<<<<< HEAD
=======
/* ============================================================================
   PAYLOADS CRÉATION / MISE À JOUR
   ============================================================================ */

/**
 * Payload de création d'une session.
 * (alias : SessionCreateInput pour compatibilité avec les hooks)
 */
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export interface CreateSessionPayload {
  formationId: ID;
  formateurId?: ID;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
<<<<<<< HEAD
  capacite: number;
}

export interface UpdateSessionPayload extends Partial<CreateSessionPayload> {
  statut?: StatutSession;
}

=======
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

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export interface SessionFilters extends PaginationParams {
  statut?: StatutSession;
  formationId?: ID;
  formateurId?: ID;
  dateDebut?: string;
  dateFin?: string;
}

<<<<<<< HEAD
export const STATUT_SESSION_CONFIG: Record<StatutSession, { label: string; variant: string; color: string }> = {
  [StatutSession.OUVERTE]: { label: 'Ouverte', variant: 'success', color: 'text-odc-success' },
  [StatutSession.FERMEE]: { label: 'Fermée', variant: 'neutral', color: 'text-odc-text-muted' },
  [StatutSession.EN_COURS]: { label: 'En cours', variant: 'warning', color: 'text-odc-warning' },
  [StatutSession.TERMINEE]: { label: 'Terminée', variant: 'info', color: 'text-odc-info' },
  [StatutSession.ANNULEE]: { label: 'Annulée', variant: 'error', color: 'text-odc-error' },
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
};