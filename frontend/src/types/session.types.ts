import type { ID, PaginationParams, Timestamp } from './common.types';
import type { Formation } from './formation.types';
import type { User } from './user.types';

export enum StatutSession {
  PLANIFIEE = 'PLANIFIEE',
  OUVERTE = 'OUVERTE',
  FERMEE = 'FERMEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export const STATUTS_INACTIFS: StatutSession[] = [
  StatutSession.TERMINEE,
  StatutSession.ANNULEE,
];

export interface Session {
  id: ID;
  codeSession: string;
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
  presenceOuverte: boolean;
  notes?: string;
  inscriptions?: unknown[];
  inscriptionsCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

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

export interface UpdateSessionPayload extends Partial<CreateSessionPayload> {
  statut?: StatutSession;
  presenceOuverte?: boolean;
}

export type SessionUpdateInput = UpdateSessionPayload;

export interface SessionFilters extends PaginationParams {
  statut?: StatutSession;
  formationId?: ID;
  formateurId?: ID;
  dateDebut?: string;
  dateFin?: string;
  q?: string;
  modalite?: string;
}

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
  [StatutSession.FERMEE]: {
    label: 'Fermée',
    variant: 'neutral',
    color: 'text-odc-text-muted',
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
