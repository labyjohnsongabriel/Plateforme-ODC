import api from './api';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

/* ============================================================================
   CLIENT API GÉNÉRIQUE
   ============================================================================ */
class ApiClient {
  /* --------------------- GET --------------------- */
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const { data } = await api.get(url, { params });
    return data;
  }

  async getPaginated<T = any>(url: string, params?: any): Promise<PaginatedResponse<T>> {
    const { data } = await api.get(url, { params });
    return data;
  }

  /* --------------------- POST --------------------- */
  async post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    const { data } = await api.post(url, body);
    return data;
  }

  /* --------------------- PUT --------------------- */
  async put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    const { data } = await api.put(url, body);
    return data;
  }

  async patch<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    const { data } = await api.patch(url, body);
    return data;
  }

  /* --------------------- DELETE --------------------- */
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const { data } = await api.delete(url);
    return data;
  }

  /* --------------------- UPLOAD --------------------- */
  async upload<T = any>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const { data } = await api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
}

export const apiClient = new ApiClient();