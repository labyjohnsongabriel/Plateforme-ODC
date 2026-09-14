import { ID, Timestamp, PaginationParams } from './common.types';
import { Formation } from './formation.types';
import { User } from './user.types';

export enum StatutSession {
  OUVERTE = 'OUVERTE',
  FERMEE = 'FERMEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export interface Session {
  id: ID;
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
  notes?: string;
  inscriptions?: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateSessionPayload {
  formationId: ID;
  formateurId?: ID;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  capacite: number;
}

export interface UpdateSessionPayload extends Partial<CreateSessionPayload> {
  statut?: StatutSession;
}

export interface SessionFilters extends PaginationParams {
  statut?: StatutSession;
  formationId?: ID;
  formateurId?: ID;
  dateDebut?: string;
  dateFin?: string;
}

export const STATUT_SESSION_CONFIG: Record<StatutSession, { label: string; variant: string; color: string }> = {
  [StatutSession.OUVERTE]: { label: 'Ouverte', variant: 'success', color: 'text-odc-success' },
  [StatutSession.FERMEE]: { label: 'Fermée', variant: 'neutral', color: 'text-odc-text-muted' },
  [StatutSession.EN_COURS]: { label: 'En cours', variant: 'warning', color: 'text-odc-warning' },
  [StatutSession.TERMINEE]: { label: 'Terminée', variant: 'info', color: 'text-odc-info' },
  [StatutSession.ANNULEE]: { label: 'Annulée', variant: 'error', color: 'text-odc-error' },
};