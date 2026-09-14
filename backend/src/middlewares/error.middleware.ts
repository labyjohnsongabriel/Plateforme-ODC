import { Request, Response, NextFunction } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { logger } from '../config/logger';
import { env } from '../config/env';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
  stack?: string;
  requestId?: string;
}

/**
 * Gestion globale des erreurs
 */
export function errorMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Erreur interne du serveur';
  let errors: any = undefined;

  // AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    if ((err as any).errors) errors = (err as any).errors;
  }
  // Zod (déjà géré normalement mais ceinture + bretelles)
  else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Erreur de validation';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  // TypeORM : entité non trouvée
  else if (err instanceof EntityNotFoundError) {
    statusCode = 404;
    message = 'Ressource introuvable';
  }
  // TypeORM : erreur SQL
  else if (err instanceof QueryFailedError) {
    const driverError: any = (err as any).driverError;
    // Contrainte unique
    if (driverError?.code === '23505') {
      statusCode = 409;
      message = 'Conflit : cette ressource existe déjà';
      errors = driverError.detail;
    }
    // Contrainte FK
    else if (driverError?.code === '23503') {
      statusCode = 409;
      message = 'Référence invalide';
      errors = driverError.detail;
    }
    // Not null
    else if (driverError?.code === '23502') {
      statusCode = 400;
      message = `Champ requis manquant : ${driverError.column}`;
    }
    // Check constraint
    else if (driverError?.code === '23514') {
      statusCode = 400;
      message = 'Contrainte de validation violée';
    }
    // Autres
    else {
      statusCode = 500;
      message = 'Erreur de base de données';
    }
  }
  // JSON malformé
  else if ((err as any).type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'JSON malformé dans la requête';
  }
  // Payload trop volumineux
  else if ((err as any).type === 'entity.too.large') {
    statusCode = 413;
    message = 'Charge utile trop volumineuse';
  }
  // Erreur générique
  else {
    message = err.message || 'Erreur interne du serveur';
  }

  // Log de l'erreur
  const logMeta = {
    statusCode,
    method: req.method,
    path: req.originalUrl,
    userId: req.userId,
    requestId: req.requestId,
    ip: req.ip,
    stack: err.stack,
  };

  if (statusCode >= 500) {
    logger.error(`❌ [${req.method}] ${req.originalUrl} — ${message}`, logMeta);
  } else {
    logger.warn(`⚠️  [${req.method}] ${req.originalUrl} — ${message}`);
  }

  // Réponse
  const response: ErrorResponse = {
    success: false,
    message,
    requestId: req.requestId,
  };

  if (errors) response.errors = errors;
  if (env.isDev && err.stack) response.stack = err.stack;

  res.status(statusCode).json(response);
}

/**
 * Wrapper pour les contrôleurs async (catch automatique)
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}