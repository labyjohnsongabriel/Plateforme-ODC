import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Log toutes les requêtes HTTP
 */
export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  // Log à la fin de la réponse
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const level =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    const message = `[${method}] ${originalUrl} → ${statusCode} (${duration}ms)`;

    const meta = {
      requestId: req.requestId,
      userId: req.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 100),
      duration,
      statusCode,
    };

    logger[level](message, meta);
  });

  next();
}

/**
 * Log d'une action spécifique (dans un controller)
 */
export function logAction(
  action: string,
  req: Request,
  details?: any
): void {
  logger.info(`📌 ${action}`, {
    requestId: req.requestId,
    userId: req.userId,
    action,
    details,
  });
}