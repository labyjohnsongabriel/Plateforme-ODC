import type { Session } from './session.types';
import type { Note } from './note.types';

export type TypeEvaluation =
  | 'PRE_TEST'
  | 'POST_TEST'
  | 'QUIZ'
  | 'PROJET'
  | 'EXAMEN'
  | 'TP'
  | 'ORAL';

export interface Evaluation {
  id: string;
  titre: string;
  type: TypeEvaluation;
  noteMax: number;
  noteMinPassage: number;
  coefficient: number;
  dateEvaluation?: string;
  dureeMinutes?: number;
  description?: string;
  consignes?: string;
  publiee: boolean;
  session: Session;
  sessionId: string;
  createurId?: string;
  notes?: Note[];
  createdAt: string;
  updatedAt: string;
}