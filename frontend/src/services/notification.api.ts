import { api } from '@/lib/api';
import { ENDPOINTS } from '@/services/endpoints';
import type { ApiResponse, PaginatedResponse, ID } from '@/types/common.types';
import type {
  Notification,
  NotificationFilters,
} from '@/types/notification.types';

export const notificationApi = {
  list: (filters?: NotificationFilters) =>
    api.get<unknown, PaginatedResponse<Notification>>(
      ENDPOINTS.NOTIFICATIONS.BASE,
      { params: filters }
    ),

  countNonLues: () =>
    api.get<unknown, ApiResponse<{ count: number }>>(
      ENDPOINTS.NOTIFICATIONS.COUNT
    ),

  marquerLue: (id: ID) =>
    api.patch<unknown, ApiResponse<void>>(
      ENDPOINTS.NOTIFICATIONS.MARQUER_LUE(id)
    ),

  marquerToutesLues: () =>
    api.patch<unknown, ApiResponse<void>>(
      ENDPOINTS.NOTIFICATIONS.MARQUER_TOUTES_LUES
    ),

  delete: (id: ID) =>
    api.delete<unknown, ApiResponse<void>>(
      `${ENDPOINTS.NOTIFICATIONS.BASE}/${id}`
    ),
};