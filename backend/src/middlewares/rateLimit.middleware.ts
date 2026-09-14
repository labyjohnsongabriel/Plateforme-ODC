import rateLimit, { Options } from 'express-rate-limit';
import { Request } from 'express';

/**
 * Clé personnalisée : IP + userId si connecté
 */
function keyGenerator(req: Request): string {
  return req.userId ? `${req.ip}-${req.userId}` : req.ip || 'unknown';
}

/**
 * Handler personnalisé
 */
function handler(_req: Request, res: any): void {
  res.status(429).json({
    success: false,
    message: 'Trop de requêtes. Veuillez réessayer plus tard.',
    retryAfter: res.getHeader('Retry-After'),
  });
}

const baseOptions: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
  skip: (req) => req.method === 'OPTIONS',
};

/**
 * Limiteur global (toutes les routes)
 */
export const globalLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
});

/**
 * Limiteur strict auth (login, register, reset)
 */
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Trop de tentatives d\'authentification. Réessayez dans 15 minutes.',
});

/**
 * Limiteur modéré (opérations standard)
 */
export const moderateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 100,
});

/**
 * Limiteur strict (opérations lourdes : PDF, exports)
 */
export const heavyLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 5,
  message: 'Trop de requêtes lourdes. Patientez une minute.',
});

/**
 * Limiteur uploads
 */
export const uploadLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 10,
  message: 'Trop d\'uploads. Patientez une minute.',
});

/**
 * Limiteur messagerie (anti-spam)
 */
export const messageLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 30,
  message: 'Trop de messages envoyés. Patientez une minute.',
});

/**
 * Limiteur génération QR / attestations
 */
export const generationLimiter = rateLimit({
  ...baseOptions,
  windowMs: 5 * 60 * 1000,
  max: 20,
});