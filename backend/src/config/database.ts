// src/config/database.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import path from 'path';
import { env } from './env';
import { logger } from './logger';

// =============================================================================
// 📁 CHEMINS
// =============================================================================
const SRC_DIR = path.resolve(__dirname, '..');
const ENTITIES_GLOB = path.join(SRC_DIR, 'entities', '*.entity.{ts,js}');
const MIGRATIONS_GLOB = path.join(SRC_DIR, 'migrations', '*.{ts,js}');

// =============================================================================
// 🛠️ CONSTRUCTION DES OPTIONS
// =============================================================================
function buildDataSourceOptions(): DataSourceOptions {
  const baseOptions: Partial<DataSourceOptions> = {
    type: 'postgres',

    // -------------------------------------------------------------------------
    // Entités (⚠️ src/entities/ et NON src/models/)
    // -------------------------------------------------------------------------
    entities: [ENTITIES_GLOB],

    // -------------------------------------------------------------------------
    // Migrations (⚠️ src/migrations/)
    // -------------------------------------------------------------------------
    migrations: [MIGRATIONS_GLOB],
    migrationsTableName: env.DB_MIGRATIONS_TABLE ?? 'migrations',
    migrationsRun: env.DB_MIGRATIONS_RUN ?? false,

    // -------------------------------------------------------------------------
    // Synchronisation (⚠️ false en production)
    // -------------------------------------------------------------------------
    synchronize: env.DB_SYNCHRONIZE ?? false,
    dropSchema: env.DB_DROP_SCHEMA ?? false,

    // -------------------------------------------------------------------------
    // Logs
    // -------------------------------------------------------------------------
    logging: env.DB_LOGGING
      ? ['query', 'error', 'warn', 'schema']
      : ['error', 'warn'],

    // -------------------------------------------------------------------------
    // Schéma
    // -------------------------------------------------------------------------
    schema: env.DB_SCHEMA || 'public',

    // -------------------------------------------------------------------------
    // Pool de connexions + SSL
    // -------------------------------------------------------------------------
    extra: {
      // Pool
      min: env.DB_POOL_MIN ?? 2,
      max: env.DB_POOL_MAX ?? 10,
      idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT ?? 30000,
      connectionTimeoutMillis: env.DB_POOL_ACQUIRE_TIMEOUT ?? 2000,
      statement_timeout: env.DB_STATEMENT_TIMEOUT ?? 30000,
      query_timeout: env.DB_QUERY_TIMEOUT ?? 30000,

      // SSL
      ssl: env.DB_SSL
        ? {
            rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED ?? true,
            ca: env.DB_SSL_CA || undefined,
          }
        : false,

      application_name: 'odc-platform',
    },
  };

  // ---------------------------------------------------------------------------
  // Mode 1 : Connexion par URL
  // ---------------------------------------------------------------------------
  if (env.DB_CONNECTION === 'url' && env.DATABASE_URL) {
    return {
      ...baseOptions,
      url: env.DATABASE_URL,
    } as DataSourceOptions;
  }

  // ---------------------------------------------------------------------------
  // Mode 2 : Connexion par champs
  // ---------------------------------------------------------------------------
  return {
    ...baseOptions,
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER ?? env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  } as DataSourceOptions;
}

// =============================================================================
// 🎯 INSTANCE UNIQUE (singleton)
// =============================================================================
export const AppDataSource = new DataSource(buildDataSourceOptions());

// =============================================================================
// 🚀 INITIALISATION AVEC RETRY
// =============================================================================
export async function initializeDatabase(retries = 5): Promise<void> {
  const connectionInfo =
    env.DB_CONNECTION === 'url'
      ? `URL (${env.DATABASE_URL?.split('@')[1] ?? 'inconnu'})`
      : `champs (${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME})`;

  logger.info(`🐘 PostgreSQL : connexion par ${connectionInfo}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();

        // Test de connexion
        await AppDataSource.query('SELECT 1');

        logger.info('✅ Connexion PostgreSQL réussie');
        logger.info(`   Hôte    : ${env.DB_HOST}:${env.DB_PORT}`);
        logger.info(`   Base    : ${env.DB_NAME}`);
        logger.info(`   Pool    : ${env.DB_POOL_MIN}-${env.DB_POOL_MAX}`);
        logger.info(`   SSL     : ${env.DB_SSL ? 'activé' : 'désactivé'}`);
        logger.info(`   Sync    : ${env.DB_SYNCHRONIZE ? 'oui (⚠️ dev)' : 'non'}`);
        logger.info(`   Migrations : ${env.DB_MIGRATIONS_RUN ? 'auto' : 'manuelles'}`);

        // Nombre d'entités chargées
        const entityCount = AppDataSource.entityMetadatas.length;
        logger.info(`   Entités chargées : ${entityCount}`);
      }
      return;
    } catch (err: any) {
      logger.error(
        `❌ Tentative ${attempt}/${retries} — Erreur BDD : ${err.message}`,
      );

      if (attempt === retries) {
        logger.error('❌ Impossible de se connecter à la base après plusieurs tentatives');
        throw err;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      logger.info(`⏳ Nouvelle tentative dans ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// =============================================================================
// 🔒 FERMETURE PROPRE
// =============================================================================
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info('🔒 Connexion PostgreSQL fermée');
  }
}

// =============================================================================
// 🩺 HEALTHCHECK
// =============================================================================
export async function checkDatabaseHealth(): Promise<{
  status: 'up' | 'down';
  latency: number;
  details?: any;
}> {
  const start = Date.now();
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    await AppDataSource.query('SELECT 1');

    return {
      status: 'up',
      latency: Date.now() - start,
      details: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        poolSize: env.DB_POOL_MAX,
        entities: AppDataSource.entityMetadatas.length,
      },
    };
  } catch (err: any) {
    return {
      status: 'down',
      latency: Date.now() - start,
      details: { error: err.message },
    };
  }
}