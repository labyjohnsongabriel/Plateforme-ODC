import { AppError, ErrorCode } from './AppError';

/**
 * 403 Forbidden
 * L'utilisateur est authentifié mais n'a pas les droits nécessaires.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Accès refusé', details?: any) {
    super(message, {
      statusCode: 403,
      code: ErrorCode.FORBIDDEN,
      details,
    });
  }
}

/**
 * 403 — Rôle insuffisant
 */
export class InsufficientRoleError extends ForbiddenError {
  constructor(requiredRoles: string[] = [], userRole?: string) {
    super(
      `Accès refusé. Rôle${requiredRoles.length > 1 ? 's' : ''} requis : ${requiredRoles.join(', ')}`,
      { requiredRoles, userRole }
    );
  }
}

/**
 * 403 — Pas propriétaire de la ressource
 */
export class NotOwnerError extends ForbiddenError {
  constructor(message = 'Vous n\'êtes pas propriétaire de cette ressource') {
    super(message, { reason: 'NOT_OWNER' });
  }
}