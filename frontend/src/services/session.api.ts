import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, ID } from '@/types/common.types';
import type {
  Session,
  SessionFilters,
  CreateSessionPayload,
} from '@/types/session.types';

export interface UpdateSessionPayload extends Partial<CreateSessionPayload> {
  statut?: string;
}

export const sessionApi = {
  list: (filters?: SessionFilters) =>
    api.get<unknown, PaginatedResponse<Session>>('/sessions', { params: filters }),

  getById: (id: ID) =>
    api.get<unknown, ApiResponse<Session>>(`/sessions/${id}`),

  create: (payload: CreateSessionPayload) =>
    api.post<unknown, ApiResponse<Session>>('/sessions', payload),

  update: (id: ID, payload: UpdateSessionPayload) =>
    api.put<unknown, ApiResponse<Session>>(`/sessions/${id}`, payload),

  delete: (id: ID) =>
    api.delete<unknown, ApiResponse<void>>(`/sessions/${id}`),

  getParticipants: (id: ID) =>
    api.get<unknown, ApiResponse<any[]>>(`/sessions/${id}/participants`),

  genererQrCode: (id: ID) =>
    api.get<unknown, ApiResponse<{ qrCode: string; token: string }>>(
      `/sessions/${id}/qrcode`
    ),
};