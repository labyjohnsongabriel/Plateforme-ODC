import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, ID } from '@/types/common.types';
import type {
  Connection,
  DirectoryFilters,
  MemberUser,
  MesConnectionsResponse,
  RepondrePayload,
} from '@/features/reseautage/types/reseautage.types';

export interface EnvoyerDemandePayload {
  destinataireId: ID;
  message?: string;
}

export const reseautageApi = {
  annuaire: async (
    filters?: DirectoryFilters,
  ): Promise<PaginatedResponse<MemberUser>> => {
    const response = await api.get<PaginatedResponse<MemberUser>>('/reseau/annuaire', {
      params: {
        page: filters?.page,
        limit: filters?.limit,
        q: filters?.search,
        role: filters?.role,
        ville: filters?.ville,
        competence: filters?.competences?.[0],
      },
    });
    return response.data;
  },

  suggestions: async (limit = 10): Promise<MemberUser[]> => {
    const response = await api.get<ApiResponse<MemberUser[]>>('/reseau/suggestions', {
      params: { limit },
    });
    return response.data.data;
  },

  mesConnections: async (): Promise<MesConnectionsResponse[]> => {
    const response =
      await api.get<ApiResponse<MesConnectionsResponse[]>>('/reseau/connections');
    return response.data.data;
  },

  demandeEnAttente: async (): Promise<Connection[]> => {
    const response = await api.get<ApiResponse<Connection[]>>(
      '/reseau/demandes/en-attente',
    );
    return response.data.data;
  },

  envoyerDemande: async ({
    destinataireId,
    message,
  }: EnvoyerDemandePayload): Promise<Connection> => {
    const response = await api.post<ApiResponse<Connection>>(
      `/reseau/demandes/${destinataireId}`,
      { message },
    );
    return response.data.data;
  },

  repondre: async (id: ID, payload: RepondrePayload): Promise<Connection> => {
    const response = await api.patch<ApiResponse<Connection>>(
      `/reseau/demandes/${id}/repondre`,
      payload,
    );
    return response.data.data;
  },

  removeConnection: async (id: ID): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/reseau/connections/${id}`);
  },
};
