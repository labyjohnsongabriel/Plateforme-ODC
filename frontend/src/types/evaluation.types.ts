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

export interface Evaluation {
  id: ID;
  session: Session;
  sessionId: ID;
  titre: string;
  type: TypeEvaluation;
  noteMax: number;
  noteMinPassage?: number;
  coefficient: number;
  dateEvaluation?: Timestamp;
  dureeMinutes?: number;
  description?: string;
  consignes?: string;
  publiee: boolean;
  createurId?: ID;
  notes?: Note[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dejaSoumise?: boolean;
  maSoumission?: {
    reponses: Record<string, unknown>;
    soumisAt: Timestamp;
  } | null;
}

export interface CreateEvaluationPayload {
  sessionId: ID;
  titre: string;
  type: TypeEvaluation;
  noteMax: number;
  noteMinPassage?: number;
  coefficient?: number;
  dateEvaluation?: Timestamp;
  dureeMinutes?: number;
  description?: string;
  consignes?: string;
  publiee?: boolean;
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

export interface EvaluationFilters extends PaginationParams {
  sessionId?: ID;
  type?: TypeEvaluation;
  publiee?: boolean;
}

export interface EvaluationNote {
  evaluation: Evaluation;
  participant: User;
  note: Note;
}

export const TYPE_EVALUATION_CONFIG: Record<
  TypeEvaluation,
  { label: string; variant: string; icon: string }
> = {
  [TypeEvaluation.PRE_TEST]: {
    label: 'Pré-test',
    variant: 'info',
    icon: 'clipboard',
  },
  [TypeEvaluation.POST_TEST]: {
    label: 'Post-test',
    variant: 'success',
    icon: 'clipboard-check',
  },
  [TypeEvaluation.QUIZ]: {
    label: 'Quiz',
    variant: 'info',
    icon: 'question-mark-circle',
  },
  [TypeEvaluation.EXAMEN]: {
    label: 'Examen',
    variant: 'error',
    icon: 'document-text',
  },
  [TypeEvaluation.PROJET]: {
    label: 'Projet',
    variant: 'purple',
    icon: 'folder',
  },
  [TypeEvaluation.TP]: {
    label: 'Travaux pratiques',
    variant: 'success',
    icon: 'wrench',
  },
  [TypeEvaluation.ORAL]: {
    label: 'Présentation orale',
    variant: 'warning',
    icon: 'microphone',
  },
};
