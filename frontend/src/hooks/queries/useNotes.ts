// src/hooks/queries/useNotes.ts
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/error-handler';
import type {
  Note,
  NoteFilters,
  NoteCreateInput,
  PaginatedResponse,
} from '@/types/note.types';

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useNotes(filters?: NoteFilters) {
  return useQuery({
    queryKey: queryKeys.notes.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Note>;
      }>('/notes', { params: filters });
      return data.data;
    },
    staleTime: 2 * 60_000,
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: queryKeys.notes.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Note }>(`/notes/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useNotesByParticipant(participantId: string) {
  return useQuery({
    queryKey: queryKeys.notes.byParticipant(participantId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Note[] }>(
        `/notes/participant/${participantId}`,
      );
      return data.data;
    },
    enabled: !!participantId,
  });
}

export function useNotesBySession(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.notes.bySession(sessionId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Note[] }>(
        `/notes/session/${sessionId}`,
      );
      return data.data;
    },
    enabled: !!sessionId,
  });
}

export function useMyNotes() {
  return useQuery({
    queryKey: queryKeys.notes.mine,
    queryFn: async () => {
      const { data } = await api.get<{ data: Note[] }>('/notes/mes-notes');
      return data.data;
    },
  });
}

export function useNotesStats(sessionId?: string) {
  return useQuery({
    queryKey: queryKeys.notes.stats(sessionId),
    queryFn: async () => {
      const { data } = await api.get('/notes/stats', {
        params: sessionId ? { sessionId } : undefined,
      });
      return data.data;
    },
  });
}

export function useMyAverage() {
  return useQuery({
    queryKey: queryKeys.notes.myAverage,
    queryFn: async () => {
      const { data } = await api.get('/notes/ma-moyenne');
      return data.data;
    },
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: NoteCreateInput) => {
      const { data } = await api.post<{ data: Note }>('/notes', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Note enregistrée');
      qc.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkCreateNotes() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notes: NoteCreateInput[]) => {
      const { data } = await api.post('/notes/bulk', { notes });
      return data.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.count ?? 0} note(s) enregistrée(s)`);
      qc.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<NoteCreateInput>;
    }) => {
      const { data } = await api.put(`/notes/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Note mise à jour');
      qc.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notes/${id}`);
    },
    onSuccess: () => {
      toast.success('Note supprimée');
      qc.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function usePublishNotes() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      publier,
    }: {
      sessionId: string;
      publier: boolean;
    }) => {
      const { data } = await api.put(
        `/notes/session/${sessionId}/publication`,
        { publier },
      );
      return data.data;
    },
    onSuccess: (_, { publier }) => {
      toast.success(publier ? 'Notes publiées' : 'Notes dépubliées');
      qc.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useExportNotes() {
  return useMutation({
    mutationFn: async ({
      sessionId,
      format = 'csv',
    }: {
      sessionId: string;
      format?: 'csv' | 'xlsx' | 'pdf';
    }) => {
      const response = await api.get(`/notes/session/${sessionId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data as Blob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}