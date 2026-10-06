import type { User } from './user.types';
import type { Session } from './session.types';

export type StatutInscription =
  | 'EN_ATTENTE'
  | 'ACCEPTEE'
  | 'REFUSEE'
  | 'LISTE_ATTENTE'
  | 'ANNULEE';

export interface Inscription {
  id: string;
  statut: StatutInscription;
  motifRefus?: string;
  motivation?: string;
  scoreSelection?: number;
  dateInscription: string;
  dateSelection?: string;
  selectionnePar?: string;
  participant: User;
  participantId: string;
  session: Session;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUT_INSCRIPTION_LABELS: Record<StatutInscription, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
  LISTE_ATTENTE: "Liste d'attente",
  ANNULEE: 'Annulée',
};

export const STATUT_INSCRIPTION_COLORS: Record<StatutInscription, string> = {
  EN_ATTENTE: 'warning',
  ACCEPTEE: 'success',
  REFUSEE: 'error',
  LISTE_ATTENTE: 'info',
  ANNULEE: 'muted',
};