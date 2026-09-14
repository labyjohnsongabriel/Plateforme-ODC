import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { AuditLog, ActionAudit } from '../models/AuditLog.entity';
import { logger } from '../config/logger';

/**
 * Enregistre une action dans l'audit log
 */
export function auditMiddleware(
  action: ActionAudit,
  entite?: string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Sauvegarder la réponse
    res.on('finish', async () => {
      try {
        const repo = AppDataSource.getRepository(AuditLog);

        const log = repo.create({
          userId: req.userId || null,
          action,
          entite: entite || null,
          entiteId: req.params.id || req.body?.id || null,
          details: {
            method: req.method,
            path: req.originalUrl,
            body: sanitize(req.body),
            query: req.query,
            params: req.params,
          },
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']?.substring(0, 500),
          methode: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          dureeMs: Date.now() - start,
        });

        await repo.save(log);
      } catch (err) {
        logger.error('❌ Erreur audit log :', err);
      }
    });

    next();
  };
}

/**
 * Nettoie les champs sensibles
 */
function sanitize(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const sensitive = [
    'motDePasse',
    'password',
    'token',
    'refreshToken',
    'secret',
    'apiKey',
    'creditCard',
  ];

  if (Array.isArray(obj)) return obj.map(sanitize);

  const clone: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitive.includes(key)) {
      clone[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clone[key] = sanitize(value);
    } else {
      clone[key] = value;
    }
  }
  return clone;
}

/**
 * Audit automatique par méthode HTTP
 */
export function autoAuditMiddleware(entite: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    let action: ActionAudit;

    switch (req.method) {
      case 'POST':
        action = ActionAudit.CREATE;
        break;
      case 'PUT':
      case 'PATCH':
        action = ActionAudit.UPDATE;
        break;
      case 'DELETE':
        action = ActionAudit.DELETE;
        break;
      case 'GET':
        action = ActionAudit.SELECT;
        break;
      default:
        return next();
    }

    return auditMiddleware(action, entite)(req, res, next);
  };
}

/**
 * Log de connexion
 */
export function auditLoginMiddleware() {
  return auditMiddleware(ActionAudit.LOGIN, 'User');
}

/**
 * Log de génération (attestations, QR, PDF)
 */
export function auditGenerationMiddleware(entite: string) {
  return auditMiddleware(ActionAudit.GENERATE, entite);
}

/**
 * Log de téléchargement
 */
export function auditDownloadMiddleware(entite: string) {
  return auditMiddleware(ActionAudit.DOWNLOAD, entite);
}