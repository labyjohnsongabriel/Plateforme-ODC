import { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';

/** Extrait le message d'erreur lisible depuis une erreur API. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    if (apiError?.error?.message) return apiError.error.message;
    if (error.response?.statusText) return error.response.statusText;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Une erreur est survenue';
}

/** Extrait les détails de validation. */
export function getValidationErrors(error: unknown): Array<{ path: string; message: string }> {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    const details = apiError?.error?.details;
    if (Array.isArray(details)) return details;
  }
  return [];
}

/** Vérifie si l'erreur est un 401. */
export function isUnauthorized(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401;
}

/** Vérifie si l'erreur est un 403. */
export function isForbidden(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 403;
}

/** Vérifie si l'erreur est un 404. */
export function isNotFound(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 404;
}

/** Vérifie si l'erreur est un 409 (conflit). */
export function isConflict(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 409;
}

/** Vérifie si l'erreur est un 422 (validation). */
export function isValidation(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 422;
}