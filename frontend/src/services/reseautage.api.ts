import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, ID } from '@/types/common.types';
import type { Connection, DirectoryFilters } from '@/types/reseautage.types';

export interface EnvoyerDemandePayload {
  destinataireId: ID;
  message?: string;
}

export const reseautageApi = {
  getDirectory: (filters?: DirectoryFilters) =>
    api.get<unknown, PaginatedResponse<any>>('/reseautage/directory', {
      params: filters,
    }),

  searchUsers: (q: string) =>
    api.get<unknown, ApiResponse<any[]>>('/reseautage/search', { params: { q } }),

  envoyerDemande: (payload: EnvoyerDemandePayload) =>
    api.post<unknown, ApiResponse<Connection>>('/reseautage/connections', payload),

  repondreDemande: (id: ID, statut: 'ACCEPTEE' | 'REFUSEE') =>
    api.patch<unknown, ApiResponse<Connection>>(
      `/reseautage/connections/${id}`,
      { statut }
    ),

  getMesConnections: () =>
    api.get<unknown, ApiResponse<Connection[]>>('/reseautage/connections'),

  removeConnection: (id: ID) =>
    api.delete<unknown, ApiResponse<void>>(`/reseautage/connections/${id}`),
};