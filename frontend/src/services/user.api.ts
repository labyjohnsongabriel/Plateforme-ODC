import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, ID } from '@/types/common.types';
import type {
  User,
  UserFilters,
  CreateUserPayload,
  UpdateUserPayload,
  ChangeRolePayload,
} from '@/types/user.types';

export const userApi = {
  list: (filters?: UserFilters) =>
    api.get<unknown, PaginatedResponse<User>>('/users', { params: filters }),

  getById: (id: ID) =>
    api.get<unknown, ApiResponse<User>>(`/users/${id}`),

  create: (payload: CreateUserPayload) =>
    api.post<unknown, ApiResponse<User>>('/users', payload),

  update: (id: ID, payload: UpdateUserPayload) =>
    api.put<unknown, ApiResponse<User>>(`/users/${id}`, payload),

  delete: (id: ID) =>
    api.delete<unknown, ApiResponse<void>>(`/users/${id}`),

  changeRole: (id: ID, payload: ChangeRolePayload) =>
    api.patch<unknown, ApiResponse<User>>(`/users/${id}/role`, payload),

  toggleActif: (id: ID) =>
    api.patch<unknown, ApiResponse<User>>(`/users/${id}/actif`),

  uploadAvatar: (id: ID, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<unknown, ApiResponse<{ photoUrl: string }>>(
      `/users/${id}/avatar`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};