import { Request, Response, NextFunction } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError } from '../errors/AppError';
import { ApiError } from '../utils/ApiError';   // ⭐ AJOUT
import { logger } from '../config/logger';
import { env } from '../config/env';

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: unknown;
  stack?: string;
  requestId?: string;
}

/* ============================================================================
   ERROR MIDDLEWARE GLOBAL
   ============================================================================ */

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Erreur interne du serveur';
  let code: string | undefined;
  let errors: unknown = undefined;

  /* ═══════════════════════════════════════════════════════════════════════
     1. ApiError (utils/ApiError) — ⭐ AJOUT CRITIQUE
     ═══════════════════════════════════════════════════════════════════════ */
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    if (err.details) errors = err.details;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     2. AppError (errors/AppError)
     ═══════════════════════════════════════════════════════════════════════ */
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = (err as any).code;
    if ((err as any).errors) errors = (err as any).errors;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     3. Zod (validation)
     ═══════════════════════════════════════════════════════════════════════ */
  else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Erreur de validation';
    code = 'VALIDATION_ERROR';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  /* ═══════════════════════════════════════════════════════════════════════
     4. TypeORM : entité non trouvée
     ═══════════════════════════════════════════════════════════════════════ */
  else if (err instanceof EntityNotFoundError) {
    statusCode = 404;
    message = 'Ressource introuvable';
    code = 'NOT_FOUND';
  }

  /* ═══════════════════════════════════════════════════════════════════════
     5. TypeORM : erreur SQL
     ═══════════════════════════════════════════════════════════════════════ */
  else if (err instanceof QueryFailedError) {
    const driverError = (err as any).driverError;

    if (driverError?.code === '23505') {
      statusCode = 409;
      message = 'Conflit : cette ressource existe déjà';
      code = 'CONFLICT';
      errors = driverError.detail;
    } else if (driverError?.code === '23503') {
      statusCode = 409;
      message = 'Référence invalide';
      code = 'CONFLICT';
      errors = driverError.detail;
    } else if (driverError?.code === '23502') {
      statusCode = 400;
      message = `Champ requis manquant : ${driverError.column}`;
      code = 'VALIDATION_ERROR';
    } else if (driverError?.code === '23514') {
      statusCode = 400;
      message = 'Contrainte de validation violée';
      code = 'VALIDATION_ERROR';
    } else {
      statusCode = 500;
      message = 'Erreur de base de données';
      code = 'DATABASE_ERROR';
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     6. JSON malformé / payload
     ═══════════════════════════════════════════════════════════════════════ */
  else if ((err as any).type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'JSON malformé dans la requête';
    code = 'VALIDATION_ERROR';
  } else if ((err as any).type === 'entity.too.large') {
    statusCode = 413;
    message = 'Charge utile trop volumineuse';
    code = 'PAYLOAD_TOO_LARGE';
  }

  /* ═══════════════════════════════════════════════════════════════════════
     7. Multer
     ═══════════════════════════════════════════════════════════════════════ */
  else if (err instanceof multer.MulterError) {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Le fichier dépasse la taille maximale autorisée.'
        : 'Erreur lors du traitement du fichier envoyé';
    code = 'UPLOAD_ERROR';
  }

  /* ═══════════════════════════════════════════════════════════════════════
     8. ⭐ FALLBACK — Détecter tout objet avec statusCode valide
     (attrape les erreurs non-`instanceof` mais qui ont la bonne forme)
     ═══════════════════════════════════════════════════════════════════════ */
  else if (
    typeof (err as any).statusCode === 'number' &&
    (err as any).statusCode >= 400 &&
    (err as any).statusCode < 600
  ) {
    statusCode = (err as any).statusCode;
    message = err.message || 'Erreur';
    code = (err as any).code;
    if ((err as any).details) errors = (err as any).details;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     9. Fallback générique
     ═══════════════════════════════════════════════════════════════════════ */
  else {
    message = err.message || 'Erreur interne du serveur';
  }

  /* ═══════════════════════════════════════════════════════════════════════
     LOG
     ═══════════════════════════════════════════════════════════════════════ */
  const logMeta = {
    statusCode,
    code,
    method: req.method,
    path: req.originalUrl,
    userId: (req as any).userId,
    requestId: (req as any).requestId,
    ip: req.ip,
    name: err.name,
    stack: err.stack?.split('\n').slice(0, 5),
  };

  if (statusCode >= 500) {
    logger.error(`❌ [${req.method}] ${req.originalUrl} — ${message}`, logMeta);
  } else {
    logger.warn(
      `⚠️  [${req.method}] ${req.originalUrl} — ${message} (${statusCode})`,
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     RÉPONSE
     ═══════════════════════════════════════════════════════════════════════ */
  const response: ErrorResponse = {
    success: false,
    message,
    requestId: (req as any).requestId,
  };

  if (code) response.code = code;
  if (errors) response.errors = errors;
  if (env.isDev && err.stack) response.stack = err.stack;

  res.status(statusCode).json(response);
}

/* ============================================================================
   ASYNC HANDLER
   ============================================================================ */

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}