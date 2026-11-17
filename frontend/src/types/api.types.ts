export * from './common.types';
export * from './user.types';
export * from './role.types';
export * from './formation.types';
export * from './session.types';
export * from './inscription.types';
export * from './presence.types';
export * from './evaluation.types';
export * from './attestation.types';
export * from './messagerie.types';
export * from './dashboard.types';
export * from './note.types';
export * from './ressource.types';
export * from './partenaire.types';
export * from './notification.types';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    name: string;
    message: string;
    code: string | null;
    statusCode: number;
    timestamp: string;
    details?: unknown;
  };
}

export interface Notification {
  id: string;
  userId: string;
  titre: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  lue: boolean;
  lien?: string;
  icone?: string;
  metadata?: Record<string, unknown>;
  dateLecture?: string;
  createdAt: string;
}
