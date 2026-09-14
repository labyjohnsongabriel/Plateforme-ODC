// ============================================================================
//  TYPES COMMUNS
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  requestId?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: FieldError[] | any;
  stack?: string;
  requestId?: string;
}

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
  timestamp?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export type ID = string;

export type UUID = string;

export type Timestamp = string;

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';