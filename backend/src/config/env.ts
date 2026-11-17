// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const NODE_ENV = process.env.NODE_ENV ?? 'development';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
  override: true,
});
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${NODE_ENV}`),
  override: true,
});

/* ═══════════════════════════════════════════════════════════════════════════
   SCHÉMA ZOD
   ═══════════════════════════════════════════════════════════════════════════ */

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    APP_NAME: z.string().default('ODC Platform'),
    APP_VERSION: z.string().default('1.0.0'),
    PORT: z.coerce.number().int().positive().default(5000),
    API_PREFIX: z.string().default('/api'),
    CLIENT_URL: z.string().url().default('http://localhost:3000'),
    HOST: z.string().default('0.0.0.0'),

    DB_CONNECTION: z.enum(['url', 'fields']).default('fields'),
    DATABASE_URL: z.string().url().optional(),
    DB_TYPE: z.string().default('postgres'),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().int().positive().default(5432),
    DB_USERNAME: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),
    DB_SCHEMA: z.string().default('public'),
    DB_SSL: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
    DB_SSL_REJECT_UNAUTHORIZED: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
    DB_SSL_CA: z.string().optional(),
    DB_SSL_CERT: z.string().optional(),
    DB_SSL_KEY: z.string().optional(),
    DB_POOL_MIN: z.coerce.number().int().min(0).default(2),
    DB_POOL_MAX: z.coerce.number().int().min(1).default(20),
    DB_POOL_IDLE_TIMEOUT: z.coerce.number().int().default(30000),
    DB_POOL_ACQUIRE_TIMEOUT: z.coerce.number().int().default(60000),
    DB_STATEMENT_TIMEOUT: z.coerce.number().int().default(30000),
    DB_QUERY_TIMEOUT: z.coerce.number().int().default(30000),
    DB_CONNECTION_TIMEOUT: z.coerce.number().int().default(5000),
    DB_LOGGING: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
    DB_SYNCHRONIZE: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
    DB_MIGRATIONS_RUN: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
    DB_MIGRATIONS_TABLE: z.string().default('migrations_history'),
    DB_DROP_SCHEMA: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
    DB_REPLICA_HOST: z.string().optional(),
    DB_REPLICA_PORT: z.coerce.number().int().positive().optional(),

    JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET doit faire au moins 32 caractères'),
    JWT_EXPIRES_IN: z.string().default('1h'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    JWT_ISSUER: z.string().default('odc-platform'),
    JWT_AUDIENCE: z.string().default('odc-client'),

    QR_TOKEN_SECRET: z.string().min(32, 'QR_TOKEN_SECRET doit faire au moins 32 caractères'),
    QR_TOKEN_TTL_MINUTES: z.coerce.number().int().min(1).max(60).default(15),
    QR_TOKEN_CLOCK_SKEW_SECONDS: z.coerce.number().int().min(0).max(120).default(30),

    // ⭐ NOUVEAU — bypass de la fenêtre temporelle en dev
    QR_SKIP_TIME_WINDOW: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),

    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    SMTP_FROM: z.string().default('Orange Digital Center <noreply@odc.mg>'),
    SMTP_REPLY_TO: z.string().default('contact@odc.mg'),
    SMTP_POOL: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
    SMTP_MAX_CONNECTIONS: z.coerce.number().int().positive().default(5),
    SMTP_MAX_MESSAGES: z.coerce.number().int().positive().default(100),

    UPLOAD_DIR: z.string().default('./uploads'),
    UPLOAD_MAX_FILE_SIZE: z.coerce.number().int().positive().default(10485760),
    UPLOAD_MAX_FILES: z.coerce.number().int().positive().default(10),
    UPLOAD_ALLOWED_MIMES: z.string().optional(),
    UPLOAD_ALLOWED_EXTENSIONS: z.string().optional(),
    UPLOAD_KEEP_TEMP_HOURS: z.coerce.number().int().positive().default(24),

    REDIS_ENABLED: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    REDIS_PASSWORD: z.string().default(''),
    REDIS_DB: z.coerce.number().int().min(0).default(0),
    REDIS_TTL: z.coerce.number().int().positive().default(300),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(500),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
    HEAVY_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),

    CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
    CORS_CREDENTIALS: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
    CORS_MAX_AGE: z.coerce.number().int().positive().default(86400),

    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
    LOG_DIR: z.string().default('./logs'),
    LOG_MAX_SIZE: z.coerce.number().int().positive().default(5242880),
    LOG_MAX_FILES: z.coerce.number().int().positive().default(5),
    LOG_CONSOLE: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
    LOG_FILE: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),

    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(20).default(12),
    HELMET_ENABLED: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
    TRUST_PROXY: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
    REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),

    KEYS_DIR: z.string().default('./keys'),
    ATTESTATION_CRITERIA_PRESENCE_MIN: z.coerce.number().int().min(0).max(100).default(75),
    ATTESTATION_CRITERIA_NOTE_MIN: z.coerce.number().int().min(0).default(10),
    ATTESTATION_DELAY_HOURS: z.coerce.number().int().positive().default(24),

    SOCKET_CORS_ORIGINS: z.string().default('http://localhost:5173'),
    SOCKET_PING_TIMEOUT: z.coerce.number().int().positive().default(60000),
    SOCKET_PING_INTERVAL: z.coerce.number().int().positive().default(25000),
    SOCKET_MAX_HTTP_BUFFER_SIZE: z.coerce.number().int().positive().default(1000000),

    CRON_ENABLED: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
    CRON_TIMEZONE: z.string().default('Indian/Fianarantsoa'),

    BACKUP_ENABLED: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
    BACKUP_DIR: z.string().default('./backups'),
    BACKUP_RETENTION_DAYS: z.coerce.number().int().positive().default(30),
    PG_DUMP_PATH: z.string().default('pg_dump'),

    SWAGGER_ENABLED: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
    SWAGGER_PATH: z.string().default('/api-docs'),

    SENTRY_DSN: z.string().optional().transform((v) => (v?.trim() ? v : undefined)).pipe(z.string().url().optional()),
    NEW_RELIC_LICENSE_KEY: z.string().optional().transform((v) => (v?.trim() ? v : undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.DB_CONNECTION === 'url') {
      if (!data.DATABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message: 'DATABASE_URL requis quand DB_CONNECTION=url',
        });
      }
    } else {
      if (!data.DB_USERNAME) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DB_USERNAME'],
          message: 'DB_USERNAME requis quand DB_CONNECTION=fields',
        });
      }
      if (!data.DB_PASSWORD) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DB_PASSWORD'],
          message: 'DB_PASSWORD requis quand DB_CONNECTION=fields',
        });
      }
      if (!data.DB_NAME) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DB_NAME'],
          message: 'DB_NAME requis quand DB_CONNECTION=fields',
        });
      }
    }

    if (data.NODE_ENV === 'production') {
      const weakSecrets = ['changeme', 'secret', 'default', 'your-secret'];
      const secretsToCheck: Array<[string, string]> = [
        ['JWT_SECRET', data.JWT_SECRET],
        ['JWT_REFRESH_SECRET', data.JWT_REFRESH_SECRET],
        ['QR_TOKEN_SECRET', data.QR_TOKEN_SECRET],
      ];
      for (const [key, value] of secretsToCheck) {
        if (weakSecrets.some((w) => value.toLowerCase().includes(w))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} contient un secret faible. Utilise : openssl rand -base64 48`,
          });
        }
      }
    }
  });

/* ═══════════════════════════════════════════════════════════════════════════
   PARSING + FALLBACK
   ═══════════════════════════════════════════════════════════════════════════ */

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Erreur de configuration .env :\n');
  const errors = parsed.error.flatten().fieldErrors;
  for (const [key, messages] of Object.entries(errors)) {
    console.error(`  • ${key}:`);
    for (const msg of messages ?? []) {
      console.error(`      - ${msg}`);
    }
  }
  console.error('\n👉 Vérifie ton fichier .env (ou .env.local)\n');

  // ⭐ En DEV, continuer avec des valeurs par défaut au lieu de crasher
  if (NODE_ENV === 'production') {
    process.exit(1);
  }
  console.warn('⚠️  Utilisation des valeurs par défaut en dev...\n');
}

const list = (v: string) =>
  v.split(',').map((s) => s.trim()).filter(Boolean);

const data: any = parsed.success ? parsed.data : {};

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT — avec valeurs par défaut garanties
   ═══════════════════════════════════════════════════════════════════════════ */

export const env = {
  // App
  NODE_ENV: data.NODE_ENV ?? NODE_ENV,
  APP_NAME: data.APP_NAME ?? 'ODC Platform',
  APP_VERSION: data.APP_VERSION ?? '1.0.0',
  PORT: data.PORT ?? 5000,
  API_PREFIX: data.API_PREFIX ?? '/api',
  CLIENT_URL: data.CLIENT_URL ?? 'http://localhost:3000',
  HOST: data.HOST ?? '0.0.0.0',

  // DB
  DB_CONNECTION: data.DB_CONNECTION ?? 'fields',
  DATABASE_URL: data.DATABASE_URL,
  DB_TYPE: data.DB_TYPE ?? 'postgres',
  DB_HOST: data.DB_HOST ?? 'localhost',
  DB_PORT: data.DB_PORT ?? 5432,
  DB_USERNAME: data.DB_USERNAME ?? 'postgres',
  DB_PASSWORD: data.DB_PASSWORD ?? '',
  DB_NAME: data.DB_NAME ?? 'odc_db',
  DB_SCHEMA: data.DB_SCHEMA ?? 'public',
  DB_SSL: data.DB_SSL ?? false,
  DB_SSL_REJECT_UNAUTHORIZED: data.DB_SSL_REJECT_UNAUTHORIZED ?? false,
  DB_SSL_CA: data.DB_SSL_CA,
  DB_POOL_MIN: data.DB_POOL_MIN ?? 2,
  DB_POOL_MAX: data.DB_POOL_MAX ?? 10,
  DB_POOL_IDLE_TIMEOUT: data.DB_POOL_IDLE_TIMEOUT ?? 30000,
  DB_POOL_ACQUIRE_TIMEOUT: data.DB_POOL_ACQUIRE_TIMEOUT ?? 60000,
  DB_STATEMENT_TIMEOUT: data.DB_STATEMENT_TIMEOUT ?? 30000,
  DB_QUERY_TIMEOUT: data.DB_QUERY_TIMEOUT ?? 30000,
  DB_CONNECTION_TIMEOUT: data.DB_CONNECTION_TIMEOUT ?? 5000,
  DB_LOGGING: data.DB_LOGGING ?? false,
  DB_SYNCHRONIZE: data.DB_SYNCHRONIZE ?? false,
  DB_MIGRATIONS_RUN: data.DB_MIGRATIONS_RUN ?? false,
  DB_MIGRATIONS_TABLE: data.DB_MIGRATIONS_TABLE ?? 'migrations_history',
  DB_DROP_SCHEMA: data.DB_DROP_SCHEMA ?? false,

  // JWT
  JWT_SECRET: data.JWT_SECRET ?? 'dev-jwt-secret-at-least-32-chars-long!!',
  JWT_REFRESH_SECRET: data.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-at-least-32-chars!!',
  JWT_EXPIRES_IN: data.JWT_EXPIRES_IN ?? '1h',
  JWT_REFRESH_EXPIRES_IN: data.JWT_REFRESH_EXPIRES_IN ?? '7d',
  JWT_ISSUER: data.JWT_ISSUER ?? 'odc-platform',
  JWT_AUDIENCE: data.JWT_AUDIENCE ?? 'odc-client',

  // QR
  QR_TOKEN_SECRET: data.QR_TOKEN_SECRET ?? 'dev-qr-token-secret-at-least-32-chars!!',
  QR_TOKEN_TTL_MINUTES: data.QR_TOKEN_TTL_MINUTES ?? 15,
  QR_TOKEN_CLOCK_SKEW_SECONDS: data.QR_TOKEN_CLOCK_SKEW_SECONDS ?? 30,
  // ⭐ NOUVEAU — bypass de la fenêtre temporelle
  QR_SKIP_TIME_WINDOW: data.QR_SKIP_TIME_WINDOW ?? false,

  // SMTP
  SMTP_HOST: data.SMTP_HOST ?? 'smtp.gmail.com',
  SMTP_PORT: data.SMTP_PORT ?? 587,
  SMTP_SECURE: data.SMTP_SECURE ?? false,
  SMTP_USER: data.SMTP_USER ?? '',
  SMTP_PASS: data.SMTP_PASS ?? '',
  SMTP_FROM: data.SMTP_FROM ?? 'Orange Digital Center <noreply@odc.mg>',
  SMTP_REPLY_TO: data.SMTP_REPLY_TO ?? 'contact@odc.mg',
  SMTP_POOL: data.SMTP_POOL ?? true,
  SMTP_MAX_CONNECTIONS: data.SMTP_MAX_CONNECTIONS ?? 5,
  SMTP_MAX_MESSAGES: data.SMTP_MAX_MESSAGES ?? 100,

  // Upload
  UPLOAD_DIR: data.UPLOAD_DIR ?? './uploads',
  UPLOAD_MAX_FILE_SIZE: data.UPLOAD_MAX_FILE_SIZE ?? 10485760,
  UPLOAD_MAX_FILES: data.UPLOAD_MAX_FILES ?? 10,
  UPLOAD_KEEP_TEMP_HOURS: data.UPLOAD_KEEP_TEMP_HOURS ?? 24,

  // Redis
  REDIS_ENABLED: data.REDIS_ENABLED ?? false,
  REDIS_HOST: data.REDIS_HOST ?? 'localhost',
  REDIS_PORT: data.REDIS_PORT ?? 6379,
  REDIS_PASSWORD: data.REDIS_PASSWORD ?? '',
  REDIS_DB: data.REDIS_DB ?? 0,
  REDIS_TTL: data.REDIS_TTL ?? 300,

  // Rate limit
  RATE_LIMIT_WINDOW_MS: data.RATE_LIMIT_WINDOW_MS ?? 900000,
  RATE_LIMIT_MAX: data.RATE_LIMIT_MAX ?? 500,
  AUTH_RATE_LIMIT_MAX: data.AUTH_RATE_LIMIT_MAX ?? 20,
  HEAVY_RATE_LIMIT_MAX: data.HEAVY_RATE_LIMIT_MAX ?? 5,

  // CORS
  CORS_ORIGINS: data.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5173',
  CORS_CREDENTIALS: data.CORS_CREDENTIALS ?? true,
  CORS_MAX_AGE: data.CORS_MAX_AGE ?? 86400,

  // Logs
  LOG_LEVEL: data.LOG_LEVEL ?? 'info',
  LOG_DIR: data.LOG_DIR ?? './logs',
  LOG_MAX_SIZE: data.LOG_MAX_SIZE ?? 5242880,
  LOG_MAX_FILES: data.LOG_MAX_FILES ?? 5,
  LOG_CONSOLE: data.LOG_CONSOLE ?? true,
  LOG_FILE: data.LOG_FILE ?? true,

  // Sécurité
  BCRYPT_ROUNDS: data.BCRYPT_ROUNDS ?? 12,
  HELMET_ENABLED: data.HELMET_ENABLED ?? true,
  TRUST_PROXY: data.TRUST_PROXY ?? false,
  REQUEST_TIMEOUT_MS: data.REQUEST_TIMEOUT_MS ?? 30000,

  // Attestations
  KEYS_DIR: data.KEYS_DIR ?? './keys',
  ATTESTATION_CRITERIA_PRESENCE_MIN: data.ATTESTATION_CRITERIA_PRESENCE_MIN ?? 75,
  ATTESTATION_CRITERIA_NOTE_MIN: data.ATTESTATION_CRITERIA_NOTE_MIN ?? 10,
  ATTESTATION_DELAY_HOURS: data.ATTESTATION_DELAY_HOURS ?? 24,

  // Socket
  SOCKET_CORS_ORIGINS: data.SOCKET_CORS_ORIGINS ?? 'http://localhost:3000',
  SOCKET_PING_TIMEOUT: data.SOCKET_PING_TIMEOUT ?? 60000,
  SOCKET_PING_INTERVAL: data.SOCKET_PING_INTERVAL ?? 25000,
  SOCKET_MAX_HTTP_BUFFER_SIZE: data.SOCKET_MAX_HTTP_BUFFER_SIZE ?? 1000000,

  // Cron
  CRON_ENABLED: data.CRON_ENABLED ?? true,
  CRON_TIMEZONE: data.CRON_TIMEZONE ?? 'Indian/Fianarantsoa',

  // Backup
  BACKUP_ENABLED: data.BACKUP_ENABLED ?? true,
  BACKUP_DIR: data.BACKUP_DIR ?? './backups',
  BACKUP_RETENTION_DAYS: data.BACKUP_RETENTION_DAYS ?? 30,
  PG_DUMP_PATH: data.PG_DUMP_PATH ?? 'pg_dump',

  // Swagger
  SWAGGER_ENABLED: data.SWAGGER_ENABLED ?? true,
  SWAGGER_PATH: data.SWAGGER_PATH ?? '/api-docs',

  // Lists
  CORS_ORIGINS_LIST: data.CORS_ORIGINS
    ? list(data.CORS_ORIGINS)
    : ['http://localhost:3000', 'http://localhost:5173'],
  SOCKET_CORS_ORIGINS_LIST: data.SOCKET_CORS_ORIGINS
    ? list(data.SOCKET_CORS_ORIGINS)
    : ['http://localhost:3000'],
  UPLOAD_ALLOWED_MIMES_LIST: data.UPLOAD_ALLOWED_MIMES
    ? list(data.UPLOAD_ALLOWED_MIMES)
    : undefined,
  UPLOAD_ALLOWED_EXTENSIONS_LIST: data.UPLOAD_ALLOWED_EXTENSIONS
    ? list(data.UPLOAD_ALLOWED_EXTENSIONS)
    : undefined,

  // Flags
  isDev: (data.NODE_ENV ?? NODE_ENV) === 'development',
  isProd: (data.NODE_ENV ?? NODE_ENV) === 'production',
  isTest: (data.NODE_ENV ?? NODE_ENV) === 'test',
};

export type Env = typeof env;