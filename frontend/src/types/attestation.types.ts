import type { User } from './user.types';
import type { Session } from './session.types';

export interface Attestation {
  id: string;
  numero: string;
  hash: string;
  fichierUrl?: string;
  qrCodeUrl?: string;
  noteFinale?: number;
  tauxPresence?: number;
  telechargee: boolean;
  dateTelechargement?: string;
  dateEmission: string;
  signatureNumerique?: string;
  valide: boolean;
  participant: User;
  participantId: string;
  session: Session;
  sessionId: string;
  createdAt: string;
}