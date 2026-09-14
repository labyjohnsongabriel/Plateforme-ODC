import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, ID } from '@/types/common.types';

export interface Evaluation {
  id: ID;
  sessionId: ID;
  titre: string;
  type: 'QUIZ' | 'PROJET' | 'EXAMEN';
  noteMax: number;
  dateEvaluation?: string;
  createdAt: string;
}

export interface Note {
  id: ID;
  evaluationId: ID;
  participantId: ID;
  note: number;
  commentaire?: string;
  createdAt: string;
}

export interface CreateEvaluationPayload {
  sessionId: ID;
  titre: string;
  type: 'QUIZ' | 'PROJET' | 'EXAMEN';
  noteMax: number;
  dateEvaluation?: string;
}

export interface CreateNotePayload {
  evaluationId: ID;
  participantId: ID;
  note: number;
  commentaire?: string;
}

export const evaluationApi = {
  list: (params?: { sessionId?: ID; page?: number; limit?: number }) =>
    api.get<unknown, PaginatedResponse<Evaluation>>('/evaluations', { params }),

  getById: (id: ID) =>
    api.get<unknown, ApiResponse<Evaluation>>(`/evaluations/${id}`),

  create: (payload: CreateEvaluationPayload) =>
    api.post<unknown, ApiResponse<Evaluation>>('/evaluations', payload),

  update: (id: ID, payload: Partial<CreateEvaluationPayload>) =>
    api.put<unknown, ApiResponse<Evaluation>>(`/evaluations/${id}`, payload),

  delete: (id: ID) =>
    api.delete<unknown, ApiResponse<void>>(`/evaluations/${id}`),

  getBySession: (sessionId: ID) =>
    api.get<unknown, ApiResponse<Evaluation[]>>(
      `/evaluations/session/${sessionId}`
    ),

  // Notes
  getNotes: (evaluationId: ID) =>
    api.get<unknown, ApiResponse<Note[]>>(`/notes/evaluation/${evaluationId}`),

  createNote: (payload: CreateNotePayload) =>
    api.post<unknown, ApiResponse<Note>>('/notes', payload),

  updateNote: (id: ID, payload: Partial<CreateNotePayload>) =>
    api.put<unknown, ApiResponse<Note>>(`/notes/${id}`, payload),
};