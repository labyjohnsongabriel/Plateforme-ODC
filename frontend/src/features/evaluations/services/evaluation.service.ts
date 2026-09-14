import { evaluationApi } from '@/services/evaluation.api';
import type {
  Evaluation,
  Note,
  CreateEvaluationPayload,
  CreateNotePayload,
} from '@/services/evaluation.api';
import type { ID } from '@/types/common.types';

export class EvaluationService {
  // ----- Évaluations -----
  static async list(params?: { sessionId?: ID; page?: number; limit?: number }) {
    const res = await evaluationApi.list(params);
    return res;
  }

  static async getById(id: ID): Promise<Evaluation> {
    const res = await evaluationApi.getById(id);
    return res.data;
  }

  static async create(payload: CreateEvaluationPayload): Promise<Evaluation> {
    const res = await evaluationApi.create(payload);
    return res.data;
  }

  static async update(
    id: ID,
    payload: Partial<CreateEvaluationPayload>
  ): Promise<Evaluation> {
    const res = await evaluationApi.update(id, payload);
    return res.data;
  }

  static async delete(id: ID): Promise<void> {
    await evaluationApi.delete(id);
  }

  static async getBySession(sessionId: ID): Promise<Evaluation[]> {
    const res = await evaluationApi.getBySession(sessionId);
    return res.data;
  }

  // ----- Notes -----
  static async getNotes(evaluationId: ID): Promise<Note[]> {
    const res = await evaluationApi.getNotes(evaluationId);
    return res.data;
  }

  static async createNote(payload: CreateNotePayload): Promise<Note> {
    const res = await evaluationApi.createNote(payload);
    return res.data;
  }

  static async updateNote(id: ID, payload: Partial<CreateNotePayload>): Promise<Note> {
    const res = await evaluationApi.updateNote(id, payload);
    return res.data;
  }

  // ----- Helpers -----
  static calculerMoyenne(notes: Note[]): number {
    if (notes.length === 0) return 0;
    const total = notes.reduce((sum, n) => sum + n.note, 0);
    return Math.round((total / notes.length) * 100) / 100;
  }

  static formaterNote(note: number, noteMax = 20): string {
    return `${note.toFixed(2)} / ${noteMax}`;
  }
}