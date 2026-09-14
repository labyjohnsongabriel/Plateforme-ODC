export enum TypeNotification {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface Notification {
  id: string;
  userId: string;
  titre: string;
  message: string;
  type: TypeNotification;
  lue: boolean;
  lien?: string;
  icone?: string;
  metadata?: Record<string, any>;
  dateLecture?: string;
  createdAt: string;
}

export interface NotificationFilters {
  lue?: boolean;
  type?: TypeNotification;
  page?: number;
  limit?: number;
}

export interface NotificationStats {
  total: number;
  nonLues: number;
  parType: Record<TypeNotification, number>;
}