import { z } from 'zod';

// ============================================================================
//  ENUMS
// ============================================================================

export enum TypeEvaluation {
  QUIZ = 'QUIZ',
  EXAMEN = 'EXAMEN',
  PROJET = 'PROJET',
  TP = 'TP',
  ORAL = 'ORAL',
}

export enum StatutEvaluation {
  BROUILLON = 'BROUILLON',
  PUBLIEE = 'PUBLIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
}

// ============================================================================
//  SCHÉMAS ZOD
// ============================================================================

export const createEvaluationSchema = z.object({
  sessionId: z.string().uuid('Session requise'),
  titre: z.string().min(3, 'Minimum 3 caractères').max(200),
  type: z.nativeEnum(TypeEvaluation),
  noteMax: z.number().int().min(1).max(100),
  coefficient: z.number().min(0.5).max(10).default(1),
  dateEvaluation: z.string().optional(),
  description: z.string().max(2000).optional(),
  consignes: z.string().max(5000).optional(),
});

export const saisirNoteSchema = z.object({
  participantId: z.string().uuid(),
  note: z.number().min(0).max(100),
  commentaire: z.string().max(500).optional(),
});

export const quizQuestionSchema = z.object({
  question: z.string().min(5),
  type: z.enum(['CHOIX_UNIQUE', 'CHOIX_MULTIPLE', 'VRAI_FAUX']),
  options: z.array(
    z.object({
      text: z.string().min(1),
      isCorrect: z.boolean(),
    })
  ).min(2),
  points: z.number().int().min(1).default(1),
});

// ============================================================================
//  TYPES
// ============================================================================

export interface Evaluation {
  id: string;
  sessionId: string;
  session?: {
    id: string;
    formation?: { titre: string };
  };
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
  statut?: StatutEvaluation;
  notes?: Note[];
  nbNotes?: number;
  moyenneClasse?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  evaluationId: string;
  participantId: string;
  participant?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    photoUrl?: string;
  };
  note: number;
  commentaire?: string;
  saisiePar?: string;
  dateSaisie?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvaluationPayload {
  sessionId: string;
  titre: string;
  type: TypeEvaluation;
  noteMax: number;
  coefficient?: number;
  dateEvaluation?: string;
  description?: string;
  consignes?: string;
}

export interface SaisirNotePayload {
  participantId: string;
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

export interface QuizQuestion {
  id?: string;
  question: string;
  type: 'CHOIX_UNIQUE' | 'CHOIX_MULTIPLE' | 'VRAI_FAUX';
  options: Array<{
    id?: string;
    text: string;
    isCorrect: boolean;
  }>;
  points: number;
  explication?: string;
}

export interface Quiz {
  id: string;
  evaluationId: string;
  questions: QuizQuestion[];
  dureeMinutes: number;
  melangerQuestions: boolean;
  afficherCorrection: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  participantId: string;
  reponses: Record<string, string | string[]>;
  score: number;
  totalPoints: number;
  pourcentage: number;
  dureeSecondes: number;
  termine: boolean;
  dateDebut: string;
  dateFin?: string;
}

export type CreateEvaluationFormData = z.infer<typeof createEvaluationSchema>;
export type SaisirNoteFormData = z.infer<typeof saisirNoteSchema>;
export type QuizQuestionFormData = z.infer<typeof quizQuestionSchema>;