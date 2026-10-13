// src/utils/ApiError.ts
import { HTTP_STATUS } from './http-status';
import { ERROR_CODES } from './error-codes';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface ApiErrorDetails {
  [key: string]: any;
}

/* ============================================================================
   CLASSE API ERROR
   ============================================================================ */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: ApiErrorDetails;

  constructor(
    statusCode: number,
    message: string,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    details?: ApiErrorDetails,
    isOperational = true,
  ) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, ApiError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /* -------------------- Factories 4xx -------------------- */

  static badRequest(
    message = 'Requête invalide',
    details?: ApiErrorDetails,
  ): ApiError {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      message,
      ERROR_CODES.VALIDATION_ERROR,
      details,
    );
  }

  static unauthorized(message = 'Non autorisé'): ApiError {
    return new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      message,
      ERROR_CODES.UNAUTHORIZED,
    );
  }

  static forbidden(message = 'Accès refusé'): ApiError {
    return new ApiError(
      HTTP_STATUS.FORBIDDEN,
      message,
      ERROR_CODES.FORBIDDEN,
    );
  }

  static notFound(message = 'Ressource introuvable'): ApiError {
    return new ApiError(
      HTTP_STATUS.NOT_FOUND,
      message,
      ERROR_CODES.NOT_FOUND,
    );
  }

  static conflict(
    message = 'Conflit',
    details?: ApiErrorDetails,
  ): ApiError {
    return new ApiError(
      HTTP_STATUS.CONFLICT,
      message,
      ERROR_CODES.CONFLICT,
      details,
    );
  }

  static validation(
    message = 'Données invalides',
    details?: ApiErrorDetails,
  ): ApiError {
    return new ApiError(
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message,
      ERROR_CODES.VALIDATION_ERROR,
      details,
    );
  }

  /* -------------------- Factories 5xx -------------------- */

  static internal(
    message = 'Erreur serveur',
    details?: ApiErrorDetails,
  ): ApiError {
    return new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message,
      ERROR_CODES.INTERNAL_ERROR,
      details,
      false,
    );
  }
}

export default ApiError;