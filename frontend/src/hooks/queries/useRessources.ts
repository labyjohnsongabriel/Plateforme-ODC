// src/hooks/queries/useRessources.ts
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
  Ressource,
  RessourceFilters,
  RessourceCreateInput,
  PaginatedResponse,
} from '@/types/ressource.types';

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useRessources(filters?: RessourceFilters) {
  return useQuery({
    queryKey: queryKeys.ressources.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Ressource>;
      }>('/ressources', { params: filters });
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useRessource(id: string) {
  return useQuery({
    queryKey: queryKeys.ressources.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Ressource }>(
        `/ressources/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useRessourcesByFormation(formationId: string) {
  return useQuery({
    queryKey: queryKeys.ressources.byFormation(formationId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Ressource[] }>(
        `/ressources/formation/${formationId}`,
      );
      return data.data;
    },
    enabled: !!formationId,
  });
}

export function useRessourcesBySession(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.ressources.bySession(sessionId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Ressource[] }>(
        `/ressources/session/${sessionId}`,
      );
      return data.data;
    },
    enabled: !!sessionId,
  });
}

export function useRessourcesStats() {
  return useQuery({
    queryKey: queryKeys.ressources.stats,
    queryFn: async () => {
      const { data } = await api.get('/ressources/stats');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateRessource() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: RessourceCreateInput) => {
      const { data } = await api.post<{ data: Ressource }>(
        '/ressources',
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Ressource ajoutée');
      qc.invalidateQueries({ queryKey: queryKeys.ressources.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateRessource() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<RessourceCreateInput>;
    }) => {
      const { data } = await api.put(`/ressources/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Ressource mise à jour');
      qc.invalidateQueries({ queryKey: queryKeys.ressources.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteRessource() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ressources/${id}`);
    },
    onSuccess: () => {
      toast.success('Ressource supprimée');
      qc.invalidateQueries({ queryKey: queryKeys.ressources.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUploadRessource() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formationId,
      file,
      titre,
      description,
      type,
    }: {
      formationId: string;
      file: File;
      titre?: string;
      description?: string;
      type?: string;
    }) => {
      const fd = new FormData();
      fd.append('fichier', file);
      if (titre) fd.append('titre', titre);
      if (description) fd.append('description', description);
      if (type) fd.append('type', type);
      fd.append('formationId', formationId);

      const { data } = await api.post('/ressources/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Fichier téléversé');
      qc.invalidateQueries({ queryKey: queryKeys.ressources.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDownloadRessource() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(`/ressources/${id}/telecharger`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function usePublishRessource() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      publier,
    }: {
      id: string;
      publier: boolean;
    }) => {
      const { data } = await api.put(`/ressources/${id}/publication`, {
        publier,
      });
      return data.data;
    },
    onSuccess: (_, { publier }) => {
      toast.success(publier ? 'Ressource publiée' : 'Ressource dépubliée');
      qc.invalidateQueries({ queryKey: queryKeys.ressources.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useIncrementRessourceDownload() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/ressources/${id}/telechargement`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ressources.all });
    },
  });
}