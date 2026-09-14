import { AppError, ErrorCode } from './AppError';

/**
 * 409 Conflict
 * Conflit avec l'état actuel de la ressource (doublon, contrainte, etc.)
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflit de données', details?: any) {
    super(message, {
      statusCode: 409,
      code: ErrorCode.CONFLICT,
      details,
    });
  }
}

/**
 * 409 — Doublon (email déjà pris, titre déjà utilisé, etc.)
 */
export class DuplicateError extends ConflictError {
  constructor(field: string, value?: string) {
    const message = value
      ? `La valeur « ${value} » existe déjà pour le champ « ${field} »`
      : `Le champ « ${field} » est déjà utilisé`;
    super(message, { field, value });
  }
}

/**
 * 409 — Capacité atteinte
 */
export class CapacityExceededError extends ConflictError {
  constructor(resource: string, max: number) {
    super(`Capacité maximale atteinte pour ${resource} (max: ${max})`, {
      resource,
      max,
    });
  }
}

/**
 * 409 — État invalide (transition impossible)
 */
export class InvalidStateError extends ConflictError {
  constructor(currentState: string, expectedState: string, action: string) {
    super(
      `Action « ${action} » impossible : état actuel « ${currentState} », état attendu « ${expectedState} »`,
      { currentState, expectedState, action }
    );
  }
}