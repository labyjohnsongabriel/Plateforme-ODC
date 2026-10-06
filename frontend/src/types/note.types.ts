import type { User } from './user.types';
import type { Evaluation } from './evaluation.types';

export interface Note {
  id: string;
  note: number;
  commentaire?: string;
  validee: boolean;
  saisiePar?: string;
  dateSaisie?: string;
  participant: User;
  participantId: string;
  evaluation: Evaluation;
  evaluationId: string;
  createdAt: string;
}