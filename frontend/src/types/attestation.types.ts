import { ID, Timestamp, PaginationParams } from './common.types';
import { User } from './user.types';
import { Session } from './session.types';

export interface Attestation {
  id: ID;
  numero: string;
  hash: string;
  session: Session;
  sessionId: ID;
  participant: User;
  participantId: ID;
  fichierUrl?: string;
  noteFinale?: number;
  tauxPresence?: number;
  telechargee: boolean;
  dateTelechargement?: Timestamp;
  signatureNumerique?: string;
  valide: boolean;
  dateEmission: Timestamp;
  createdAt: Timestamp;
}

export interface AttestationVerification {
  numero: string;
  participant: string;
  formation: string;
  dateEmission: Timestamp;
  noteFinale?: number;
}

export interface EligibleVerification {
  eligible: boolean;
  raisons: string[];
  details: {
    tauxPresence: number;
    noteMoyenne: number;
    nombreEvaluations: number;
  };
}

export interface GenerateAttestationPayload {
  sessionId: ID;
  participantId: ID;
}

export interface GenerateBatchResult {
  succes: number;
  echecs: number;
  details: Array<{
    participant: string;
    statut: 'OK' | 'ECHEC';
    raison?: string;
  }>;
}

export interface AttestationFilters extends PaginationParams {
  search?: string;
  sessionId?: ID;
  participantId?: ID;
  valide?: boolean;
}

export interface AttestationStats {
  total: number;
  valides: number;
  telechargees: number;
  enAttente: number;
  noteMoyenne: number;
  presenceMoyenne: number;
}

export const ATTESTATION_NUMBER_REGEX = /^ODC-\d{4}-[A-Z]{3}-[A-F0-9]{6}$/;