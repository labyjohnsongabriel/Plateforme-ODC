<<<<<<< HEAD
=======
// src/config/database.ts
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
import { DataSource, DataSourceOptions } from 'typeorm';
import path from 'path';
import { env } from './env';
import { logger } from './logger';
<<<<<<< HEAD
import { Role, RoleName } from '../models/Role.entity';

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
=======

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

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      application_name: 'odc-platform',
    },
  };

<<<<<<< HEAD
  // Connexion par URL
  if (env.DB_CONNECTION === 'url' && env.DATABASE_URL) {
    logger.info('🐘 PostgreSQL : connexion par URL');
=======
  // ---------------------------------------------------------------------------
  // Mode 1 : Connexion par URL
  // ---------------------------------------------------------------------------
  if (env.DB_CONNECTION === 'url' && env.DATABASE_URL) {
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    return {
      ...baseOptions,
      url: env.DATABASE_URL,
    } as DataSourceOptions;
  }

<<<<<<< HEAD
  // Connexion par champs
  logger.info(
    `🐘 PostgreSQL : connexion par champs (${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME})`
  );
=======
  // ---------------------------------------------------------------------------
  // Mode 2 : Connexion par champs
  // ---------------------------------------------------------------------------
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  return {
    ...baseOptions,
    host: env.DB_HOST,
    port: env.DB_PORT,
<<<<<<< HEAD
    username: env.DB_USERNAME,
=======
    username: env.DB_USER ?? env.DB_USERNAME,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  } as DataSourceOptions;
}

<<<<<<< HEAD
/**
 * Instance DataSource unique (singleton)
 */
export const AppDataSource = new DataSource(buildDataSourceOptions());

/**
 * Initialise la connexion avec retry
 */
export async function initializeDatabase(retries = 5): Promise<void> {
=======
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

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();

<<<<<<< HEAD
        // Test simple
=======
        // Test de connexion
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
        await AppDataSource.query('SELECT 1');

        logger.info('✅ Connexion PostgreSQL réussie');
        logger.info(`   Hôte    : ${env.DB_HOST}:${env.DB_PORT}`);
        logger.info(`   Base    : ${env.DB_NAME}`);
        logger.info(`   Pool    : ${env.DB_POOL_MIN}-${env.DB_POOL_MAX}`);
        logger.info(`   SSL     : ${env.DB_SSL ? 'activé' : 'désactivé'}`);
<<<<<<< HEAD
=======
        logger.info(`   Sync    : ${env.DB_SYNCHRONIZE ? 'oui (⚠️ dev)' : 'non'}`);
        logger.info(`   Migrations : ${env.DB_MIGRATIONS_RUN ? 'auto' : 'manuelles'}`);

        // Nombre d'entités chargées
        const entityCount = AppDataSource.entityMetadatas.length;
        logger.info(`   Entités chargées : ${entityCount}`);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      }
      return;
    } catch (err: any) {
      logger.error(
<<<<<<< HEAD
        `❌ Tentative ${attempt}/${retries} — Erreur BDD : ${err.message}`
=======
        `❌ Tentative ${attempt}/${retries} — Erreur BDD : ${err.message}`,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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

<<<<<<< HEAD
/**
 * Ferme la connexion
 */
=======
// =============================================================================
// 🔒 FERMETURE PROPRE
// =============================================================================
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info('🔒 Connexion PostgreSQL fermée');
  }
}

<<<<<<< HEAD
/**
 * Vérifie l'état de la connexion
 */
=======
// =============================================================================
// 🩺 HEALTHCHECK
// =============================================================================
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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
<<<<<<< HEAD
=======
        entities: AppDataSource.entityMetadatas.length,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      },
    };
  } catch (err: any) {
    return {
      status: 'down',
      latency: Date.now() - start,
      details: { error: err.message },
    };
  }
<<<<<<< HEAD
}

export async function ensureRoles(): Promise<void> {
  const roleRepo = AppDataSource.getRepository(Role);
  const roles = [
    { nom: RoleName.ADMIN, description: 'Administrateur de la plateforme' },
    { nom: RoleName.STAFF, description: 'Personnel ODC' },
    { nom: RoleName.FORMATEUR, description: 'Formateur' },
    { nom: RoleName.PARTICIPANT, description: 'Participant aux formations' },
    { nom: RoleName.PARTENAIRE, description: 'Partenaire externe' },
  ];

  for (const roleData of roles) {
    const role = await roleRepo.findOne({ where: { nom: roleData.nom } });
    if (!role) {
      await roleRepo.save(roleRepo.create(roleData));
      logger.info(`✅ Rôle initialisé : ${roleData.nom}`);
    }
  }
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
}