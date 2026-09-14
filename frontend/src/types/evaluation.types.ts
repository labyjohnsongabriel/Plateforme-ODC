import { ID, Timestamp, PaginationParams } from './common.types';
import { User } from './user.types';
import { Session } from './session.types';

export enum TypeEvaluation {
  QUIZ = 'QUIZ',
  EXAMEN = 'EXAMEN',
  PROJET = 'PROJET',
  TP = 'TP',
  ORAL = 'ORAL',
}

export interface Evaluation {
  id: ID;
  session: Session;
  sessionId: ID;
  titre: string;
  type: TypeEvaluation;
  noteMax: number;
  noteMin: number;
  coefficient: number;
  dateEvaluation?: string;
  dureeMinutes?: number;
  description?: string;
  consignes?: string;
  publiee: boolean;
  notes?: Note[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Note {
  id: ID;
  evaluation: Evaluation;
  evaluationId: ID;
  participant: User;
  participantId: ID;
  note: number;
  commentaire?: string;
  saisiePar?: ID;
  dateSaisie?: Timestamp;
  createdAt: Timestamp;
}

export interface CreateEvaluationPayload {
  sessionId: ID;
  titre: string;
  type: TypeEvaluation;
  noteMax: number;
  coefficient?: number;
  dateEvaluation?: string;
  description?: string;
}

export interface SaisirNotePayload {
  participantId: ID;
  note: number;
  commentaire?: string;
}

export interface MoyenneResponse {
  moyenne: number;
  totalNotes: number;
  notes: Note[];
}

export interface EvaluationStats {
  moyenne: number;
  mediane: number;
  max: number;
  min: number;
  reussite: number;
  echec: number;
  distribution: Array<{ range: string; count: number }>;
}

export const TYPE_EVALUATION_CONFIG: Record<TypeEvaluation, { label: string; variant: string; icon: string }> = {
  [TypeEvaluation.QUIZ]: { label: 'Quiz', variant: 'info', icon: 'question-mark-circle' },
  [TypeEvaluation.EXAMEN]: { label: 'Examen', variant: 'error', icon: 'document-text' },
  [TypeEvaluation.PROJET]: { label: 'Projet', variant: 'purple', icon: 'folder' },
  [TypeEvaluation.TP]: { label: 'Travaux pratiques', variant: 'success', icon: 'wrench' },
  [TypeEvaluation.ORAL]: { label: 'Présentation orale', variant: 'warning', icon: 'microphone' },
};