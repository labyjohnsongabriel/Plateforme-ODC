import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';   // ⬅️ IMPORT MANQUANT

// Charger .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Schéma de validation des variables d'environnement
 */
const envSchema = z.object({
  // ==========================================================================
  // APPLICATION
  // ==========================================================================
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('ODC Platform'),
  APP_VERSION: z.string().default('1.0.0'),
  PORT: z.string().default('5000'),
  API_PREFIX: z.string().default('/api'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  HOST: z.string().default('0.0.0.0'),

  // ==========================================================================
  // DATABASE PostgreSQL
  // ==========================================================================
  DB_CONNECTION: z.enum(['url', 'fields']).default('fields'),
  DATABASE_URL: z.string().optional(),

  DB_TYPE: z.string().default('postgres'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SCHEMA: z.string().default('public'),

  DB_SSL: z.string().default('false'),
  DB_SSL_REJECT_UNAUTHORIZED: z.string().default('false'),
  DB_SSL_CA: z.string().optional(),
  DB_SSL_CERT: z.string().optional(),
  DB_SSL_KEY: z.string().optional(),

  DB_POOL_MIN: z.string().default('2'),
  DB_POOL_MAX: z.string().default('20'),
  DB_POOL_IDLE_TIMEOUT: z.string().default('30000'),
  DB_POOL_ACQUIRE_TIMEOUT: z.string().default('60000'),
  DB_STATEMENT_TIMEOUT: z.string().default('30000'),
  DB_QUERY_TIMEOUT: z.string().default('30000'),
  DB_CONNECTION_TIMEOUT: z.string().default('5000'),

  DB_LOGGING: z.string().default('false'),
  DB_SYNCHRONIZE: z.string().default('false'),
  DB_MIGRATIONS_RUN: z.string().default('true'),
  DB_MIGRATIONS_TABLE: z.string().default('migrations_history'),
  DB_DROP_SCHEMA: z.string().default('false'),

  DB_REPLICA_HOST: z.string().optional(),
  DB_REPLICA_PORT: z.string().optional(),

  // ==========================================================================
  // JWT
  // ==========================================================================
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().default('odc-platform'),
  JWT_AUDIENCE: z.string().default('odc-client'),

  // ==========================================================================
  // EMAIL SMTP
  // ==========================================================================
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587'),
  SMTP_SECURE: z.string().default('false'),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('Orange Digital Center <noreply@odc.mg>'),
  SMTP_REPLY_TO: z.string().default('contact@odc.mg'),
  SMTP_POOL: z.string().default('true'),
  SMTP_MAX_CONNECTIONS: z.string().default('5'),
  SMTP_MAX_MESSAGES: z.string().default('100'),

  // ==========================================================================
  // UPLOAD
  // ==========================================================================
  UPLOAD_DIR: z.string().default('./uploads'),
  UPLOAD_MAX_FILE_SIZE: z.string().default('10485760'),
  UPLOAD_MAX_FILES: z.string().default('10'),
  UPLOAD_ALLOWED_MIMES: z.string().optional(),
  UPLOAD_ALLOWED_EXTENSIONS: z.string().optional(),
  UPLOAD_KEEP_TEMP_HOURS: z.string().default('24'),

  // ==========================================================================
  // REDIS
  // ==========================================================================
  REDIS_ENABLED: z.string().default('false'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_DB: z.string().default('0'),
  REDIS_TTL: z.string().default('300'),

  // ==========================================================================
  // RATE LIMITING
  // ==========================================================================
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('500'),
  AUTH_RATE_LIMIT_MAX: z.string().default('20'),
  HEAVY_RATE_LIMIT_MAX: z.string().default('5'),

  // ==========================================================================
  // CORS
  // ==========================================================================
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  CORS_CREDENTIALS: z.string().default('true'),
  CORS_MAX_AGE: z.string().default('86400'),

  // ==========================================================================
  // LOGS
  // ==========================================================================
  LOG_LEVEL: z.string().default('info'),
  LOG_DIR: z.string().default('./logs'),
  LOG_MAX_SIZE: z.string().default('5242880'),
  LOG_MAX_FILES: z.string().default('5'),
  LOG_CONSOLE: z.string().default('true'),
  LOG_FILE: z.string().default('true'),

  // ==========================================================================
  // SÉCURITÉ
  // ==========================================================================
  BCRYPT_ROUNDS: z.string().default('12'),
  HELMET_ENABLED: z.string().default('true'),
  TRUST_PROXY: z.string().default('false'),
  REQUEST_TIMEOUT_MS: z.string().default('30000'),

  // ==========================================================================
  // CERTIFICATS & SIGNATURE
  // ==========================================================================
  KEYS_DIR: z.string().default('./keys'),
  ATTESTATION_CRITERIA_PRESENCE_MIN: z.string().default('75'),
  ATTESTATION_CRITERIA_NOTE_MIN: z.string().default('10'),
  ATTESTATION_DELAY_HOURS: z.string().default('24'),

  // ==========================================================================
  // SOCKET.IO
  // ==========================================================================
  SOCKET_CORS_ORIGINS: z.string().default('http://localhost:5173'),
  SOCKET_PING_TIMEOUT: z.string().default('60000'),
  SOCKET_PING_INTERVAL: z.string().default('25000'),
  SOCKET_MAX_HTTP_BUFFER_SIZE: z.string().default('1000000'),

  // ==========================================================================
  // JOBS CRON
  // ==========================================================================
  CRON_ENABLED: z.string().default('true'),
  CRON_TIMEZONE: z.string().default('Indian/Antananarivo'),

  // ==========================================================================
  // BACKUP
  // ==========================================================================
  BACKUP_ENABLED: z.string().default('true'),
  BACKUP_DIR: z.string().default('./backups'),
  BACKUP_RETENTION_DAYS: z.string().default('30'),
  PG_DUMP_PATH: z.string().default('pg_dump'),

  // ==========================================================================
  // SWAGGER
  // ==========================================================================
  SWAGGER_ENABLED: z.string().default('true'),
  SWAGGER_PATH: z.string().default('/api-docs'),

  // ==========================================================================
  // MONITORING
  // ==========================================================================
  SENTRY_DSN: z.string().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
});

/**
 * Parse + validation
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Erreur de configuration .env :');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

/**
 * Helper conversion booléen
 */
const bool = (v: string) => v === 'true';

/**
 * Helper conversion nombre
 */
const num = (v: string) => Number(v);

/**
 * Helper conversion liste séparée par virgules
 */
const list = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean);

/**
 * Configuration typée et validée
 */
export const env = {
  // Application
  ...parsed.data,

  // Conversions
  PORT: num(parsed.data.PORT),

  // Database
  DB_PORT: num(parsed.data.DB_PORT),
  DB_SSL: bool(parsed.data.DB_SSL),
  DB_SSL_REJECT_UNAUTHORIZED: bool(parsed.data.DB_SSL_REJECT_UNAUTHORIZED),
  DB_POOL_MIN: num(parsed.data.DB_POOL_MIN),
  DB_POOL_MAX: num(parsed.data.DB_POOL_MAX),
  DB_POOL_IDLE_TIMEOUT: num(parsed.data.DB_POOL_IDLE_TIMEOUT),
  DB_POOL_ACQUIRE_TIMEOUT: num(parsed.data.DB_POOL_ACQUIRE_TIMEOUT),
  DB_STATEMENT_TIMEOUT: num(parsed.data.DB_STATEMENT_TIMEOUT),
  DB_QUERY_TIMEOUT: num(parsed.data.DB_QUERY_TIMEOUT),
  DB_CONNECTION_TIMEOUT: num(parsed.data.DB_CONNECTION_TIMEOUT),
  DB_LOGGING: bool(parsed.data.DB_LOGGING),
  DB_SYNCHRONIZE: bool(parsed.data.DB_SYNCHRONIZE),
  DB_MIGRATIONS_RUN: bool(parsed.data.DB_MIGRATIONS_RUN),
  DB_DROP_SCHEMA: bool(parsed.data.DB_DROP_SCHEMA),

  // SMTP
  SMTP_PORT: num(parsed.data.SMTP_PORT),
  SMTP_SECURE: bool(parsed.data.SMTP_SECURE),
  SMTP_POOL: bool(parsed.data.SMTP_POOL),
  SMTP_MAX_CONNECTIONS: num(parsed.data.SMTP_MAX_CONNECTIONS),
  SMTP_MAX_MESSAGES: num(parsed.data.SMTP_MAX_MESSAGES),

  // Upload
  UPLOAD_MAX_FILE_SIZE: num(parsed.data.UPLOAD_MAX_FILE_SIZE),
  UPLOAD_MAX_FILES: num(parsed.data.UPLOAD_MAX_FILES),
  UPLOAD_KEEP_TEMP_HOURS: num(parsed.data.UPLOAD_KEEP_TEMP_HOURS),
  UPLOAD_ALLOWED_MIMES_LIST: parsed.data.UPLOAD_ALLOWED_MIMES
    ? list(parsed.data.UPLOAD_ALLOWED_MIMES)
    : undefined,
  UPLOAD_ALLOWED_EXTENSIONS_LIST: parsed.data.UPLOAD_ALLOWED_EXTENSIONS
    ? list(parsed.data.UPLOAD_ALLOWED_EXTENSIONS)
    : undefined,

  // Redis
  REDIS_ENABLED: bool(parsed.data.REDIS_ENABLED),
  REDIS_PORT: num(parsed.data.REDIS_PORT),
  REDIS_DB: num(parsed.data.REDIS_DB),
  REDIS_TTL: num(parsed.data.REDIS_TTL),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: num(parsed.data.RATE_LIMIT_WINDOW_MS),
  RATE_LIMIT_MAX: num(parsed.data.RATE_LIMIT_MAX),
  AUTH_RATE_LIMIT_MAX: num(parsed.data.AUTH_RATE_LIMIT_MAX),
  HEAVY_RATE_LIMIT_MAX: num(parsed.data.HEAVY_RATE_LIMIT_MAX),

  // CORS
  CORS_ORIGINS_LIST: list(parsed.data.CORS_ORIGINS),
  CORS_CREDENTIALS: bool(parsed.data.CORS_CREDENTIALS),
  CORS_MAX_AGE: num(parsed.data.CORS_MAX_AGE),

  // Logs
  LOG_MAX_SIZE: num(parsed.data.LOG_MAX_SIZE),
  LOG_MAX_FILES: num(parsed.data.LOG_MAX_FILES),
  LOG_CONSOLE: bool(parsed.data.LOG_CONSOLE),
  LOG_FILE: bool(parsed.data.LOG_FILE),

  // Sécurité
  BCRYPT_ROUNDS: num(parsed.data.BCRYPT_ROUNDS),
  HELMET_ENABLED: bool(parsed.data.HELMET_ENABLED),
  TRUST_PROXY: bool(parsed.data.TRUST_PROXY),
  REQUEST_TIMEOUT_MS: num(parsed.data.REQUEST_TIMEOUT_MS),

  // Attestation
  ATTESTATION_CRITERIA_PRESENCE_MIN: num(parsed.data.ATTESTATION_CRITERIA_PRESENCE_MIN),
  ATTESTATION_CRITERIA_NOTE_MIN: num(parsed.data.ATTESTATION_CRITERIA_NOTE_MIN),
  ATTESTATION_DELAY_HOURS: num(parsed.data.ATTESTATION_DELAY_HOURS),

  // Socket.io
  SOCKET_CORS_ORIGINS_LIST: list(parsed.data.SOCKET_CORS_ORIGINS),
  SOCKET_PING_TIMEOUT: num(parsed.data.SOCKET_PING_TIMEOUT),
  SOCKET_PING_INTERVAL: num(parsed.data.SOCKET_PING_INTERVAL),
  SOCKET_MAX_HTTP_BUFFER_SIZE: num(parsed.data.SOCKET_MAX_HTTP_BUFFER_SIZE),

  // Jobs
  CRON_ENABLED: bool(parsed.data.CRON_ENABLED),

  // Backup
  BACKUP_ENABLED: bool(parsed.data.BACKUP_ENABLED),
  BACKUP_RETENTION_DAYS: num(parsed.data.BACKUP_RETENTION_DAYS),

  // Swagger
  SWAGGER_ENABLED: bool(parsed.data.SWAGGER_ENABLED),

  // Helpers
  isDev: parsed.data.NODE_ENV === 'development',
  isProd: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
};

export type Env = typeof env;