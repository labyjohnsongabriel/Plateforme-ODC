/* ============================================================================
   CONSTANTES GLOBALES
   ============================================================================ */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ODC Platform';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const DEBOUNCE_DELAY = 300;
export const TOAST_DURATION = 4000;