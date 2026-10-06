import type { User } from './user.types';
import type { Session } from './session.types';

export type StatutPresence = 'PRESENT' | 'ABSENT' | 'RETARD' | 'EXCUSE';
export type MethodePresence = 'QR_CODE' | 'MANUEL';

export interface Presence {
  id: string;
  statut: StatutPresence;
  methode: MethodePresence;
  datePresence: string;
  heureScan?: string;
  scanneLe: string;
  qrToken?: string;
  ipAddress?: string;
  commentaire?: string;
  present: boolean;
  participant: User;
  participantId: string;
  session: Session;
  sessionId: string;
  createdAt: string;
}