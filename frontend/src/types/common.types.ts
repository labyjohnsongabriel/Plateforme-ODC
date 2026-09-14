// ============================================================================
//  TYPES COMMUNS
// ============================================================================

// ---------- API ----------
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

// ---------- Types utilitaires ----------
export type ID = string;
export type UUID = string;
export type Timestamp = string;
export type Email = string;
export type URL = string;

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ---------- Composants ----------
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';

export type Alignment = 'left' | 'center' | 'right';

// ---------- Formulaires ----------
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

// ---------- Fichiers ----------
export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

// ---------- Statistiques ----------
export interface StatItem {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

// ---------- Notifications ----------
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

// ---------- Modales ----------
export interface ModalState<T = any> {
  isOpen: boolean;
  data?: T;
}

// ---------- Thème ----------
export type Theme = 'light' | 'dark' | 'system';

// ---------- Langue ----------
export type Language = 'fr' | 'en' | 'mg';