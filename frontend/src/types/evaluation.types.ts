// src/types/evaluation.types.ts
import type { ID, PaginationParams, Timestamp } from './common.types';
import type { User } from './user.types';
import type { Session } from './session.types';
import type { Note } from './note.types';

export enum TypeEvaluation {
  PRE_TEST = 'PRE_TEST',
  POST_TEST = 'POST_TEST',
  QUIZ = 'QUIZ',
  EXAMEN = 'EXAMEN',
  PROJET = 'PROJET',
  TP = 'TP',
  ORAL = 'ORAL',
}

// ✅ IMPORTANT : Doit être "export enum" (valeur runtime) et non "export type"
export enum EvaluationStatus {
  DISPONIBLE = 'DISPONIBLE',
  EN_COURS = 'EN_COURS',
  SOUMISE = 'SOUMISE',
  A_VENIR = 'A_VENIR',
  EXPIREE = 'EXPIREE',
}

export interface ParticipantEvaluation {
  id: ID;
  titre?: string;
  description?: string | null;
  type?: string;
  noteMax: number;
  noteObtenue?: number | null;
  dateEvaluation?: Timestamp | null;
  dateDebut?: Timestamp | null;
  dateFin?: Timestamp | null;
  dureeMinutes?: number | null;
  estPubliee: boolean;
  soumise: boolean;
  demarree: boolean;
  dateSoumission?: Timestamp | null;
  dateDebutReponse?: Timestamp | null;
}

export interface Evaluation {
  id: ID;
  session?: Session;
  sessionId: ID;
  titre: string;
  type: TypeEvaluation;
  noteMax: number;
  noteMinPassage?: number;
  coefficient: number;
  dateEvaluation?: Timestamp;
  dateDebut?: Timestamp;
  dateFin?: Timestamp;
  dureeMinutes?: number;
  description?: string;
  consignes?: string;
  publiee: boolean;
  createurId?: ID;
  notes?: Note[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dejaSoumise?: boolean;
  demarree?: boolean;
  maSoumission?: {
    reponses: Record<string, unknown>;
    soumisAt: Timestamp;
    noteObtenue?: number | null;
  } | null;
}
// ... (le reste de vos types)