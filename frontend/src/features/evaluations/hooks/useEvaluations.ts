import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EvaluationService } from '../services/evaluation.service';
import type { Evaluation, Note, SaisirNotePayload } from '../types/evaluation.types';

export function useEvaluations(sessionId?: string) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionId) {
      setEvaluations([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await EvaluationService.listBySession(sessionId);
      setEvaluations(data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur de chargement';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (payload: any): Promise<Evaluation | null> => {
    try {
      const created = await EvaluationService.create(payload);
      setEvaluations((prev) => [created, ...prev]);
      toast.success('Évaluation créée');
      return created;
    } catch {
      return null;
    }
  };

  const update = async (id: string, payload: any): Promise<boolean> => {
    try {
      const updated = await EvaluationService.update(id, payload);
      setEvaluations((prev) => prev.map((e) => (e.id === id ? updated : e)));
      toast.success('Évaluation mise à jour');
      return true;
    } catch {
      return false;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    if (!confirm('Supprimer cette évaluation ?')) return false;
    try {
      await EvaluationService.delete(id);
      setEvaluations((prev) => prev.filter((e) => e.id !== id));
      toast.success('Évaluation supprimée');
      return true;
    } catch {
      return false;
    }
  };

  const saisirNote = async (
    evaluationId: string,
    payload: SaisirNotePayload
  ): Promise<Note | null> => {
    try {
      const note = await EvaluationService.saisirNote(evaluationId, payload);
      toast.success('Note enregistrée');
      return note;
    } catch {
      return null;
    }
  };

  return {
    evaluations,
    loading,
    error,
    refetch: load,
    create,
    update,
    remove,
    saisirNote,
  };
}