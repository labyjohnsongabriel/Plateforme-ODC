<<<<<<< HEAD
// ============================================================================
//  API TYPES — Export centralisé
// ============================================================================

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

// Notification
export interface Notification {
  id: string;
  userId: string;
  titre: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  lue: boolean;
  lien?: string;
  icone?: string;
  metadata?: Record<string, any>;
  dateLecture?: string;
  createdAt: string;
=======
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T = any> {
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
    details?: any;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
}