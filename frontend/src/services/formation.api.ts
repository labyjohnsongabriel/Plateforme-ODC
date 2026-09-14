import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, ID } from '@/types/common.types';
import type {
  Formation,
  FormationFilters,
  CreateFormationPayload,
} from '@/types/formation.types';

export interface UpdateFormationPayload extends Partial<CreateFormationPayload> {
  actif?: boolean;
}

export const formationApi = {
  list: (filters?: FormationFilters) =>
    api.get<unknown, PaginatedResponse<Formation>>('/formations', {
      params: filters,
    }),

  getById: (id: ID) =>
    api.get<unknown, ApiResponse<Formation>>(`/formations/${id}`),

  create: (payload: CreateFormationPayload) =>
    api.post<unknown, ApiResponse<Formation>>('/formations', payload),

  update: (id: ID, payload: UpdateFormationPayload) =>
    api.put<unknown, ApiResponse<Formation>>(`/formations/${id}`, payload),

  delete: (id: ID) =>
    api.delete<unknown, ApiResponse<void>>(`/formations/${id}`),

  getStatsByDomaine: () =>
    api.get<unknown, ApiResponse<Array<{ domaine: string; count: string }>>>(
      '/formations/stats/domaine'
    ),
};