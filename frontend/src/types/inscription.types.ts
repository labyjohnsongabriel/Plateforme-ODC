<<<<<<< HEAD
import { ID, Timestamp, PaginationParams } from './common.types';
import { User } from './user.types';
import { Session } from './session.types';

export enum StatutInscription {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  LISTE_ATTENTE = 'LISTE_ATTENTE',
  ANNULEE = 'ANNULEE',
}

export interface Inscription {
  id: ID;
  participant: User;
  participantId: ID;
  session: Session;
  sessionId: ID;
  statut: StatutInscription;
  motifRefus?: string;
  motivation?: string;
  dateInscription: Timestamp;
  dateSelection?: Timestamp;
  selectionnePar?: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateInscriptionPayload {
  sessionId: ID;
  motivation?: string;
}

export interface SelectionnerPayload {
  statut: StatutInscription;
  motifRefus?: string;
}

export interface SelectionMassePayload {
  inscriptionIds: ID[];
  statut: StatutInscription;
  motifRefus?: string;
}

export interface InscriptionFilters extends PaginationParams {
  statut?: StatutInscription;
  sessionId?: ID;
  participantId?: ID;
}

export interface SelectionStats {
  total: number;
  enAttente: number;
  acceptees: number;
  refusees: number;
  listeAttente: number;
  capacite: number;
  placesRestantes: number;
  tauxRemplissage: number;
}

export const STATUT_INSCRIPTION_CONFIG: Record<StatutInscription, { label: string; variant: string; icon: string }> = {
  [StatutInscription.EN_ATTENTE]: { label: 'En attente', variant: 'warning', icon: 'clock' },
  [StatutInscription.ACCEPTEE]: { label: 'Acceptée', variant: 'success', icon: 'check-circle' },
  [StatutInscription.REFUSEE]: { label: 'Refusée', variant: 'error', icon: 'x-circle' },
  [StatutInscription.LISTE_ATTENTE]: { label: 'Liste d\'attente', variant: 'info', icon: 'queue' },
  [StatutInscription.ANNULEE]: { label: 'Annulée', variant: 'neutral', icon: 'ban' },
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
};