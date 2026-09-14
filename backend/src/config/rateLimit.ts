import rateLimit from 'express-rate-limit';
import { APP_CONFIG } from './app.config';

/**
 * Limiteur global
 */
export const globalLimiter = rateLimit({
  windowMs: APP_CONFIG.security.rateLimitWindow,
  max: APP_CONFIG.security.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
  },
});

/**
 * Limiteur strict pour authentification
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: APP_CONFIG.security.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de tentatives. Réessayez dans 15 minutes',
  },
});

/**
 * Limiteur très strict pour génération PDF
 */
export const heavyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Trop de requêtes lourdes. Patientez 1 minute',
  },
});