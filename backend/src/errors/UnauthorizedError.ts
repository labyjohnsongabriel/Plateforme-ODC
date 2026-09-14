import { AppError, ErrorCode } from './AppError';

/**
 * 401 Unauthorized
 * L'utilisateur n'est pas authentifié ou son token est invalide.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentification requise', details?: any) {
    super(message, {
      statusCode: 401,
      code: ErrorCode.UNAUTHORIZED,
      details,
    });
  }
}

/**
 * 401 — Token expiré
 */
export class TokenExpiredError extends UnauthorizedError {
  constructor(message = 'Session expirée. Veuillez vous reconnecter.') {
    super(message, { reason: 'TOKEN_EXPIRED' });
  }
}

/**
 * 401 — Token invalide
 */
export class InvalidTokenError extends UnauthorizedError {
  constructor(message = 'Token invalide ou corrompu') {
    super(message, { reason: 'TOKEN_INVALID' });
  }
}