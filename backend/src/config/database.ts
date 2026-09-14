import { DataSource, DataSourceOptions } from 'typeorm';
import path from 'path';
import { env } from './env';
import { logger } from './logger';

/**
 * Construction de la config selon DB_CONNECTION
 */
function buildDataSourceOptions(): DataSourceOptions {
  const baseOptions: Partial<DataSourceOptions> = {
    type: 'postgres',
    synchronize: env.DB_SYNCHRONIZE,
    logging: env.DB_LOGGING
      ? ['query', 'error', 'warn', 'schema']
      : ['error', 'warn'],
    entities: [path.join(__dirname, '../models/*.entity.{ts,js}')],
    migrations: [path.join(__dirname, '../database/migrations/*.{ts,js}')],
    migrationsTableName: env.DB_MIGRATIONS_TABLE,
    migrationsRun: env.DB_MIGRATIONS_RUN,
    dropSchema: env.DB_DROP_SCHEMA,
    schema: env.DB_SCHEMA,
    extra: {
      // Pool
      min: env.DB_POOL_MIN,
      max: env.DB_POOL_MAX,
      idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT,
      connectionTimeoutMillis: env.DB_POOL_ACQUIRE_TIMEOUT,
      statement_timeout: env.DB_STATEMENT_TIMEOUT,
      query_timeout: env.DB_QUERY_TIMEOUT,
      // SSL
      ssl: env.DB_SSL
        ? {
            rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED,
            ca: env.DB_SSL_CA || undefined,
          }
        : false,
      application_name: 'odc-platform',
    },
  };

  // Connexion par URL
  if (env.DB_CONNECTION === 'url' && env.DATABASE_URL) {
    logger.info('🐘 PostgreSQL : connexion par URL');
    return {
      ...baseOptions,
      url: env.DATABASE_URL,
    } as DataSourceOptions;
  }

  // Connexion par champs
  logger.info(
    `🐘 PostgreSQL : connexion par champs (${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME})`
  );
  return {
    ...baseOptions,
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  } as DataSourceOptions;
}

/**
 * Instance DataSource unique (singleton)
 */
export const AppDataSource = new DataSource(buildDataSourceOptions());

/**
 * Initialise la connexion avec retry
 */
export async function initializeDatabase(retries = 5): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();

        // Test simple
        await AppDataSource.query('SELECT 1');

        logger.info('✅ Connexion PostgreSQL réussie');
        logger.info(`   Hôte    : ${env.DB_HOST}:${env.DB_PORT}`);
        logger.info(`   Base    : ${env.DB_NAME}`);
        logger.info(`   Pool    : ${env.DB_POOL_MIN}-${env.DB_POOL_MAX}`);
        logger.info(`   SSL     : ${env.DB_SSL ? 'activé' : 'désactivé'}`);
      }
      return;
    } catch (err: any) {
      logger.error(
        `❌ Tentative ${attempt}/${retries} — Erreur BDD : ${err.message}`
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

/**
 * Ferme la connexion
 */
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info('🔒 Connexion PostgreSQL fermée');
  }
}

/**
 * Vérifie l'état de la connexion
 */
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