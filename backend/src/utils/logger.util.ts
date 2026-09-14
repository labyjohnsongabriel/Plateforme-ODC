import { Request } from 'express';
import { logger } from '../config/logger';

/**
 * Extrait le contexte de la requête
 */
export function getRequestContext(req: Request): Record<string, any> {
  return {
    requestId: req.requestId,
    userId: req.userId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent']?.substring(0, 100),
  };
}

/**
 * Log une action utilisateur
 */
export function logUserAction(
  req: Request,
  action: string,
  details?: Record<string, any>
): void {
  logger.info(`📌 UserAction: ${action}`, {
    ...getRequestContext(req),
    action,
    ...details,
  });
}

/**
 * Log une action système
 */
export function logSystemEvent(
  event: string,
  details?: Record<string, any>
): void {
  logger.info(`⚙️  SystemEvent: ${event}`, details);
}

/**
 * Log une erreur métier
 */
export function logBusinessError(
  req: Request,
  error: Error,
  context?: Record<string, any>
): void {
  logger.error(`💥 BusinessError: ${error.message}`, {
    ...getRequestContext(req),
    error: error.message,
    stack: error.stack,
    ...context,
  });
}

/**
 * Log une action d'authentification
 */
export function logAuth(
  action: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'FAILED_LOGIN' | 'TOKEN_REFRESH',
  email: string,
  details?: Record<string, any>
): void {
  const emoji = {
    LOGIN: '🔐',
    LOGOUT: '🚪',
    REGISTER: '📝',
    FAILED_LOGIN: '❌',
    TOKEN_REFRESH: '🔄',
  }[action];

  logger.info(`${emoji} Auth: ${action} — ${email}`, details);
}

/**
 * Log une action CRUD
 */
export function logCrud(
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
  entity: string,
  entityId?: string,
  userId?: string
): void {
  logger.info(`📝 ${action} ${entity}`, { entity, entityId, userId });
}

/**
 * Log une action de génération (PDF, QR, etc.)
 */
export function logGeneration(
  type: 'PDF' | 'QRCODE' | 'ATTESTATION' | 'EXPORT',
  details: Record<string, any>
): void {
  logger.info(`🎨 Génération ${type}`, details);
}

/**
 * Log d'une performance
 */
export function logPerformance(
  operation: string,
  durationMs: number,
  threshold = 1000
): void {
  if (durationMs > threshold) {
    logger.warn(`🐢 Performance lente: ${operation} — ${durationMs}ms`);
  } else {
    logger.debug(`⚡ ${operation} — ${durationMs}ms`);
  }
}

/**
 * Log d'une action d'audit
 */
export function logAudit(
  action: string,
  entity: string,
  entityId: string,
  userId?: string,
  details?: Record<string, any>
): void {
  logger.info(`🔍 Audit: ${action} on ${entity}`, {
    action,
    entity,
    entityId,
    userId,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log d'une transaction BDD
 */
export function logDatabase(
  operation: string,
  table: string,
  durationMs?: number
): void {
  logger.debug(`🗄️  DB ${operation} ${table}${durationMs ? ` (${durationMs}ms)` : ''}`);
}

/**
 * Log d'un job CRON
 */
export function logCron(
  jobName: string,
  status: 'START' | 'SUCCESS' | 'ERROR',
  details?: Record<string, any>
): void {
  const emoji = {
    START: '⏰',
    SUCCESS: '✅',
    ERROR: '❌',
  }[status];

  const level = status === 'ERROR' ? 'error' : 'info';
  logger[level](`${emoji} CRON ${jobName}: ${status}`, details);
}

/**
 * Log d'un événement Socket.io
 */
export function logSocket(
  event: string,
  userId?: string,
  details?: Record<string, any>
): void {
  logger.debug(`🔌 Socket: ${event}`, { userId, ...details });
}

/**
 * Log d'un accès non autorisé
 */
export function logUnauthorized(
  req: Request,
  reason: string,
  details?: Record<string, any>
): void {
  logger.warn(`🚫 Accès refusé: ${reason}`, {
    ...getRequestContext(req),
    reason,
    ...details,
  });
}

/**
 * Log d'une validation échouée
 */
export function logValidationError(
  req: Request,
  errors: any[]
): void {
  logger.warn(`⚠️  Validation échouée`, {
    ...getRequestContext(req),
    errorCount: errors.length,
    errors: errors.slice(0, 5), // max 5 pour éviter le spam
  });
}

/**
 * Log d'un téléchargement
 */
export function logDownload(
  req: Request,
  filename: string,
  size?: number
): void {
  logger.info(`📥 Téléchargement: ${filename}`, {
    ...getRequestContext(req),
    filename,
    size,
  });
}

/**
 * Log d'un upload
 */
export function logUpload(
  req: Request,
  filename: string,
  size: number
): void {
  logger.info(`📤 Upload: ${filename}`, {
    ...getRequestContext(req),
    filename,
    size,
    sizeReadable: `${(size / 1024).toFixed(2)} KB`,
  });
}

/**
 * Log d'une notification envoyée
 */
export function logNotification(
  type: 'EMAIL' | 'SOCKET' | 'PUSH',
  destinataire: string,
  sujet: string
): void {
  logger.info(`🔔 Notification ${type} → ${destinataire}`, { sujet });
}

/**
 * Log d'une erreur critique (avec alerte)
 */
export function logCritical(
  message: string,
  error: Error,
  context?: Record<string, any>
): void {
  logger.error(`🚨 CRITIQUE: ${message}`, {
    error: error.message,
    stack: error.stack,
    ...context,
  });
  // TODO: envoyer une alerte (Slack, Sentry, etc.)
}