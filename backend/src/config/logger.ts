// src/config/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { env } from './env';

// =============================================================================
// 📁 DOSSIER DES LOGS
// =============================================================================
const logDir = path.resolve(process.cwd(), env.LOG_DIR ?? 'logs');

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  // Ne jamais faire planter l'app à cause des logs
  console.error(`⚠️ Impossible de créer le dossier logs ${logDir}:`, err);
}

// =============================================================================
// 🧩 MÉTADONNÉES GLOBALES (injectées dans chaque log)
// =============================================================================
const GLOBAL_META = {
  service: env.APP_NAME ?? 'odc-api',
  env: env.NODE_ENV ?? 'development',
  pid: process.pid,
};

// =============================================================================
// 🔒 SÉRIALISATION SÛRE DES MÉTADONNÉES
// =============================================================================
/**
 * Évite les crashs sur objets circulaires (Request, Error, Socket, ...)
 * et limite la taille des valeurs.
 */
function safeStringify(obj: unknown): string {
  const seen = new WeakSet();
  try {
    return JSON.stringify(obj, (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
      }
      if (typeof value === 'bigint') return value.toString();
      if (value instanceof Error) {
        return { name: value.name, message: value.message, stack: value.stack };
      }
      return value;
    });
  } catch {
    return '[Unserializable]';
  }
}

// =============================================================================
// 🎨 FORMATS
// =============================================================================

/** Champs internes winston à exclure du JSON de métadonnées */
const INTERNAL_FIELDS = new Set([
  'timestamp',
  'level',
  'message',
  'splat',
  'service',
  'env',
  'pid',
]);

/** Format des logs FICHIERS (JSON structuré — parsable par Loki/ELK) */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['timestamp', 'level', 'message'] }),
  winston.format.json(),
);

/** Format CONSOLE (lisible humain, colorisé) */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ level: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack } = info as any;

    // Métadonnées : on prend tout sauf les champs internes
    const meta: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(info)) {
      if (!INTERNAL_FIELDS.has(k) && k !== 'stack') meta[k] = v;
    }

    const metaStr = Object.keys(meta).length
      ? ` ${safeStringify(meta)}`
      : '';
    const stackStr = stack ? `\n${stack}` : '';

    return `[${timestamp}] ${level}: ${message}${metaStr}${stackStr}`;
  }),
);

// =============================================================================
// 📦 TRANSPORTS
// =============================================================================
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true,
    silent: env.NODE_ENV === 'test',
  }),
];

// Fichiers uniquement hors test
if (env.NODE_ENV !== 'test') {
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
      level: env.LOG_LEVEL ?? 'info',
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
      level: 'error',
    }),
  );
}

// =============================================================================
// 🚀 LOGGER
// =============================================================================
export const logger = winston.createLogger({
  level: env.LOG_LEVEL ?? 'info',
  defaultMeta: GLOBAL_META,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// =============================================================================
// 🛡️ GESTION DES ERREURS NON CAPTURÉES
// =============================================================================
process.on('uncaughtException', (err) => {
  logger.error('💥 uncaughtException', { error: err.message, stack: err.stack });
  // Laisser le process mourir après flush
  setTimeout(() => process.exit(1), 500);
});

process.on('unhandledRejection', (reason) => {
  logger.error('💥 unhandledRejection', {
    reason: reason instanceof Error
      ? { message: reason.message, stack: reason.stack }
      : safeStringify(reason),
  });
});

// =============================================================================
// 📡 STREAM POUR MORGAN (utilisé dans app.ts)
// =============================================================================
export const logStream = {
  write: (message: string) => {
    logger.http ? logger.http(message.trim()) : logger.info(message.trim());
  },
};

// =============================================================================
// 🧪 HELPERS TYPÉS (facultatif mais pratique)
// =============================================================================
export const log = {
  info:  (msg: string, meta?: Record<string, unknown>) => logger.info(msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => logger.warn(msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => logger.error(msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => logger.debug(msg, meta),
  http:  (msg: string, meta?: Record<string, unknown>) => logger.http(msg, meta),
};

export default logger;
