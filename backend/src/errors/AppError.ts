// src/errors/AppError.ts

// =============================================================================
// 📦 TYPES
// =============================================================================

export interface AppErrorOptions {
  /** Code d'erreur métier (ex: 'USER_NOT_FOUND') pour le front / i18n */
  code?: string;
  /** Détails additionnels (champs invalides, contexte, etc.) */
  details?: unknown;
  /** Erreur d'origine (chaînage ES2022) */
  cause?: unknown;
  /** `true` = erreur métier prévisible ; `false` = bug serveur */
  isOperational?: boolean;
}

export interface AppErrorJSON {
  name: string;
  message: string;
  code: string | null;
  statusCode: number;
  details?: unknown;
  timestamp: string;
  /** Stack uniquement hors production */
  stack?: string;
}

// =============================================================================
// 🧱 CLASSE DE BASE
// =============================================================================

/**
 * Erreur applicative de base.
 * Toutes les erreurs métier doivent hériter de cette classe.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string | null;
  public readonly details?: unknown;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode = 500,
    options: AppErrorOptions = {},
  ) {
    super(message, { cause: options.cause });

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = options.code ?? null;
    this.details = options.details;
    this.isOperational = options.isOperational ?? statusCode < 500;
    this.timestamp = new Date().toISOString();

    // Guard V8 (Node.js) — n'existe pas sur tous les moteurs JS
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }

    // Nécessaire pour `instanceof` après transpilation TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Sérialisation sûre pour les réponses HTTP.
   * Inclut le stack UNIQUEMENT hors production.
   */
  toJSON(): AppErrorJSON {
    const payload: AppErrorJSON = {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };

    if (this.details !== undefined) payload.details = this.details;
    if (process.env.NODE_ENV !== 'production' && this.stack) {
      payload.stack = this.stack;
    }

    return payload;
  }

  /** Pour le logging interne (toujours avec stack) */
  toLogObject(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      details: this.details,
      stack: this.stack,
      cause: this.cause,
      timestamp: this.timestamp,
    };
  }
}

// =============================================================================
// 4xx — ERREURS CLIENT
// =============================================================================

/** 400 — Requête mal formée (validation simple, ID invalide, etc.) */
export class BadRequestError extends AppError {
  constructor(message = 'Requête invalide', details?: unknown) {
    super(message, 400, { code: 'BAD_REQUEST', details });
  }
}

/** 401 — Non authentifié (token manquant/invalide/expiré) */
export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorisé') {
    super(message, 401, { code: 'UNAUTHORIZED' });
  }
}

/** 403 — Authentifié mais pas les droits */
export class ForbiddenError extends AppError {
  constructor(message = 'Accès refusé') {
    super(message, 403, { code: 'FORBIDDEN' });
  }
}

/** 404 — Ressource introuvable */
export class NotFoundError extends AppError {
  constructor(message = 'Ressource introuvable', code = 'NOT_FOUND') {
    super(message, 404, { code });
  }
}

/** 409 — Conflit (doublon, contrainte unique, état incohérent) */
export class ConflictError extends AppError {
  constructor(message = 'Conflit', details?: unknown) {
    super(message, 409, { code: 'CONFLICT', details });
  }
}

/**
 * 422 — Erreur de validation détaillée (liste de champs invalides).
 * ⚠️ Utilisé par le middleware de validation Zod.
 */
export class ValidationError extends AppError {
  public readonly errors: Array<{
    path: string;
    message: string;
    code?: string;
  }>;

  constructor(
    message = 'Erreur de validation',
    errors: Array<{ path: string; message: string; code?: string }> = [],
  ) {
    super(message, 422, {
      code: 'VALIDATION_ERROR',
      details: errors,
    });
    this.errors = errors;
  }
}

/** 429 — Trop de requêtes (rate limiting) */
export class TooManyRequestsError extends AppError {
  constructor(
    message = 'Trop de requêtes, veuillez réessayer plus tard',
    retryAfterSeconds?: number,
  ) {
    super(message, 429, {
      code: 'TOO_MANY_REQUESTS',
      details: retryAfterSeconds ? { retryAfter: retryAfterSeconds } : undefined,
    });
  }
}

// =============================================================================
// 5xx — ERREURS SERVEUR
// =============================================================================

/** 500 — Erreur interne (bug, incohérence) */
export class InternalError extends AppError {
  constructor(message = 'Erreur interne du serveur', cause?: unknown) {
    super(message, 500, {
      code: 'INTERNAL_ERROR',
      cause,
      isOperational: false, // ← un 500 n'est jamais "prévisible"
    });
  }
}

/** 502 — Mauvaise réponse d'un service amont (SMTP, S3, paiement) */
export class BadGatewayError extends AppError {
  constructor(message = 'Service externe indisponible', cause?: unknown) {
    super(message, 502, { code: 'BAD_GATEWAY', cause });
  }
}

/** 503 — Service temporairement indisponible (maintenance, DB down) */
export class ServiceUnavailableError extends AppError {
  constructor(
    message = 'Service temporairement indisponible',
    retryAfterSeconds?: number,
  ) {
    super(message, 503, {
      code: 'SERVICE_UNAVAILABLE',
      details: retryAfterSeconds ? { retryAfter: retryAfterSeconds } : undefined,
    });
  }
}

// =============================================================================
// 🛠️ HELPERS DE TYPE
// =============================================================================

/**
 * Vérifie si une valeur est une `AppError` (utile dans les middlewares).
 */
export const isAppError = (err: unknown): err is AppError =>
  err instanceof AppError;

/**
 * Vérifie si une erreur est "attendue" (métier) vs un bug.
 */
export const isOperationalError = (err: unknown): boolean =>
  isAppError(err) ? err.isOperational : false;