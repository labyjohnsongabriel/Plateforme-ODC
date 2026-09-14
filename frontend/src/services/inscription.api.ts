import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, ID } from '@/types/common.types';
import type {
  Inscription,
  InscriptionFilters,
  CreateInscriptionPayload,
} from '@/types/inscription.types';

export const inscriptionApi = {
  list: (filters?: InscriptionFilters) =>
    api.get<unknown, PaginatedResponse<Inscription>>('/inscriptions', {
      params: filters,
    }),

  getById: (id: ID) =>
    api.get<unknown, ApiResponse<Inscription>>(`/inscriptions/${id}`),

  create: (payload: CreateInscriptionPayload) =>
    api.post<unknown, ApiResponse<Inscription>>('/inscriptions', payload),

  delete: (id: ID) =>
    api.delete<unknown, ApiResponse<void>>(`/inscriptions/${id}`),

  updateStatut: (id: ID, statut: string, motifRefus?: string) =>
    api.patch<unknown, ApiResponse<Inscription>>(`/inscriptions/${id}/statut`, {
      statut,
      motifRefus,
    }),

  accepter: (id: ID) =>
    api.patch<unknown, ApiResponse<Inscription>>(`/inscriptions/${id}/accepter`),

  refuser: (id: ID, motif: string) =>
    api.patch<unknown, ApiResponse<Inscription>>(`/inscriptions/${id}/refuser`, {
      motif,
    }),

  getBySession: (sessionId: ID) =>
    api.get<unknown, ApiResponse<Inscription[]>>(
      `/inscriptions/session/${sessionId}`
    ),

  getMesInscriptions: () =>
    api.get<unknown, ApiResponse<Inscription[]>>('/inscriptions/mes-inscriptions'),
};