import { AppError, ErrorCode } from './AppError';

/**
 * 404 Not Found
 * La ressource demandée n'existe pas.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Ressource introuvable', details?: any) {
    super(message, {
      statusCode: 404,
      code: ErrorCode.NOT_FOUND,
      details,
    });
  }
}

/**
 * 404 — Helper pour une entité spécifique
 */
export class EntityNotFoundError extends NotFoundError {
  constructor(entity: string, id?: string) {
    const message = id
      ? `${entity} introuvable (id: ${id})`
      : `${entity} introuvable`;
    super(message, { entity, id });
  }
}