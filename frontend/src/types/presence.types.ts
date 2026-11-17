import type { ID, PaginationParams, Timestamp } from './common.types';
import type { User } from './user.types';
import type { Session } from './session.types';

export enum StatutPresence {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  RETARD = 'RETARD',
  EXCUSE = 'EXCUSE',
}

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
  datePresence: Timestamp;
  heureScan?: string;
  scanneLe?: Timestamp;
  present: boolean;
  statut?: StatutPresence;
  justifiee?: boolean;
  methode: MethodePresence;
  qrToken?: string;
  commentaire?: string;
  ipAddress?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
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
  expiresAt: Timestamp;
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
  statut?: StatutPresence;
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
}
