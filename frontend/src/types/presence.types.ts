<<<<<<< HEAD
import { ID, Timestamp, PaginationParams } from './common.types';
import { User } from './user.types';
import { Session } from './session.types';

export enum MethodePresence {
  QR_CODE = 'QR_CODE',
  MANUEL = 'MANUEL',
  IMPORT = 'IMPORT',
}

export interface Presence {
  id: ID;
  session: Session;
  sessionId: ID;
  participant: User;
  participantId: ID;
  datePresence: string;
  heureScan?: string;
  present: boolean;
  justifiee: boolean;
  methode: MethodePresence;
  qrToken?: string;
  commentaire?: string;
  ipAddress?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PresenceStats {
  total: number;
  presents: number;
  absents: number;
  retards: number;
  excuses: number;
  tauxPresence: number;
  tauxAbsence: number;
}

export interface ScanQrPayload {
  sessionId: ID;
  qrToken: string;
}

export interface MarquerManuelPayload {
  sessionId: ID;
  participantId: ID;
  present: boolean;
  commentaire?: string;
}

export interface GenerateQrPayload {
  sessionId: ID;
  dureeValidite?: number;
}

export interface GeneratedQrCode {
  token: string;
  dataUrl: string;
  expiresAt: string;
}

export interface TauxPresence {
  tauxPresence: number;
  totalSeances: number;
  presences: number;
  absences: number;
}

export interface PresenceFilters extends PaginationParams {
  sessionId?: ID;
  participantId?: ID;
  date?: string;
  present?: boolean;
}

export interface ParticipantAttendance {
  participantId: ID;
  participantName: string;
  email: string;
  photoUrl?: string;
  totalSessions: number;
  presences: number;
  absences: number;
  tauxPresence: number;
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
}