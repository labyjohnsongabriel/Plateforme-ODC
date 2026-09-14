import { notificationApi } from '@/services/notification.api';
import type { Notification, NotificationFilters, TypeNotification } from '../types/notification.types';

export class NotificationService {
  static async list(filters?: NotificationFilters) {
    return notificationApi.list(filters);
  }

  static async countNonLues(): Promise<number> {
    const data = await notificationApi.countNonLues();
    return data.count;
  }

  static async marquerLue(id: string): Promise<void> {
    return notificationApi.marquerLue(id);
  }

  static async marquerToutesLues(): Promise<void> {
    return notificationApi.marquerToutesLues();
  }

  static async delete(id: string): Promise<void> {
    return notificationApi.delete(id);
  }

  static getTypeConfig(type: TypeNotification) {
    const configs = {
      INFO: { color: 'text-odc-info', bg: 'bg-odc-info-bg', label: 'Information' },
      SUCCESS: { color: 'text-odc-success', bg: 'bg-odc-success-bg', label: 'Succès' },
      WARNING: { color: 'text-odc-warning', bg: 'bg-odc-warning-bg', label: 'Avertissement' },
      ERROR: { color: 'text-odc-error', bg: 'bg-odc-error-bg', label: 'Erreur' },
    };
    return configs[type] || configs.INFO;
  }
}