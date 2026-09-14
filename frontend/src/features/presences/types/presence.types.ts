import { z } from 'zod';

// ============================================================================
//  ENUMS
// ============================================================================

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

// ============================================================================
//  SCHÉMAS ZOD
// ============================================================================

export const scanQrSchema = z.object({
  sessionId: z.string().uuid('Session invalide'),
  qrToken: z.string().min(1, 'QR Code requis'),
});

export const marquerManuelSchema = z.object({
  sessionId: z.string().uuid(),
  participantId: z.string().uuid(),
  present: z.boolean(),
  commentaire: z.string().max(500).optional(),
});

export const generateQrSchema = z.object({
  sessionId: z.string().uuid(),
  dureeValidite: z.number().int().min(1).max(60).default(5),
});

// ============================================================================
//  TYPES
// ============================================================================

export interface Presence {
  id: string;
  sessionId: string;
  session?: {
    id: string;
    formation?: { titre: string };
    dateDebut: string;
  };
  participantId: string;
  participant?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    photoUrl?: string;
  };
  datePresence: string;
  heureScan?: string;
  present: boolean;
  justifiee: boolean;
  methode: MethodePresence;
  qrToken?: string;
  commentaire?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
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

export interface GenerateQrPayload {
  sessionId: string;
  dureeValidite?: number;
}

export interface GeneratedQrCode {
  token: string;
  dataUrl: string;
  expiresAt: string;
}

export interface ScanQrPayload {
  sessionId: string;
  qrToken: string;
}

export interface MarquerManuelPayload {
  sessionId: string;
  participantId: string;
  present: boolean;
  commentaire?: string;
}

export interface TauxPresence {
  tauxPresence: number;
  totalSeances: number;
  presences: number;
  absences: number;
}

export interface PresenceFilters {
  sessionId?: string;
  participantId?: string;
  date?: string;
  present?: boolean;
  page?: number;
  limit?: number;
}

export interface ParticipantAttendance {
  participantId: string;
  participantName: string;
  email: string;
  photoUrl?: string;
  totalSessions: number;
  presences: number;
  absences: number;
  tauxPresence: number;
}

export type ScanQrFormData = z.infer<typeof scanQrSchema>;
export type MarquerManuelFormData = z.infer<typeof marquerManuelSchema>;
export type GenerateQrFormData = z.infer<typeof generateQrSchema>;