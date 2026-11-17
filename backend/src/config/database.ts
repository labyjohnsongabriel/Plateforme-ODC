// src/config/database.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import path from 'path';
import fs from 'fs';

// ⭐ Import robuste : si env.ts n'est pas encore prêt, on utilise des défauts
let env: any = {};
try {
  env = require('./env').env ?? {};
} catch (err) {
  console.error('⚠️ env.ts non chargé dans database.ts, valeurs par défaut');
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHEMINS
   ═══════════════════════════════════════════════════════════════════════════ */

const SRC_DIR = path.resolve(__dirname, '..');
const ENTITIES_DIR = path.join(SRC_DIR, 'entities');
const MIGRATIONS_DIR = path.join(SRC_DIR, 'migrations');

/* ═══════════════════════════════════════════════════════════════════════════
   AUTO-DÉCOUVERTE DES ENTITÉS
   ═══════════════════════════════════════════════════════════════════════════ */

function discoverEntityFiles(): string[] {
  if (!fs.existsSync(ENTITIES_DIR)) {
    console.error(`❌ Dossier entities introuvable : ${ENTITIES_DIR}`);
    return [];
  }
  return fs
    .readdirSync(ENTITIES_DIR)
    .filter((f) => f.endsWith('.entity.ts') || f.endsWith('.entity.js'))
    .map((f) => path.join(ENTITIES_DIR, f));
}

function loadEntities(): Function[] {
  const files = discoverEntityFiles();
  const entities: Function[] = [];
  for (const file of files) {
    try {
      const mod = require(file);
      for (const key of Object.keys(mod)) {
        const exported = mod[key];
        if (typeof exported === 'function') entities.push(exported);
      }
    } catch (err: any) {
      console.error(`❌ Impossible de charger ${path.basename(file)} : ${err.message}`);
    }
  }
  return entities;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTRUCTION DES OPTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

function buildDataSourceOptions(): DataSourceOptions {
  const entities = loadEntities();
  console.log(`📦 Entités découvertes : ${entities.length}`);

  // ⭐ Valeurs par défaut si env est undefined
  const NODE_ENV = env.NODE_ENV ?? 'development';
  const DB_TYPE = env.DB_TYPE ?? 'postgres';
  const DB_HOST = env.DB_HOST ?? 'localhost';
  const DB_PORT = Number(env.DB_PORT ?? 5432);
  const DB_USERNAME = env.DB_USERNAME ?? env.DB_USER ?? 'postgres';
  const DB_PASSWORD = env.DB_PASSWORD ?? '';
  const DB_NAME = env.DB_NAME ?? 'odc_db';
  const DB_SCHEMA = env.DB_SCHEMA ?? 'public';
  const DB_SSL = env.DB_SSL === true;
  const DB_SSL_REJECT_UNAUTHORIZED = env.DB_SSL_REJECT_UNAUTHORIZED === true;
  const DB_SSL_CA = env.DB_SSL_CA;
  const DB_POOL_MIN = Number(env.DB_POOL_MIN ?? 2);
  const DB_POOL_MAX = Number(env.DB_POOL_MAX ?? 10);
  const DB_POOL_IDLE_TIMEOUT = Number(env.DB_POOL_IDLE_TIMEOUT ?? 30000);
  const DB_POOL_ACQUIRE_TIMEOUT = Number(env.DB_POOL_ACQUIRE_TIMEOUT ?? 60000);
  const DB_STATEMENT_TIMEOUT = Number(env.DB_STATEMENT_TIMEOUT ?? 30000);
  const DB_QUERY_TIMEOUT = Number(env.DB_QUERY_TIMEOUT ?? 30000);
  const DB_LOGGING = env.DB_LOGGING === true;
  const DB_SYNCHRONIZE = env.DB_SYNCHRONIZE === true;
  const DB_MIGRATIONS_RUN = env.DB_MIGRATIONS_RUN === true;
  const DB_MIGRATIONS_TABLE = env.DB_MIGRATIONS_TABLE ?? 'migrations_history';
  const DB_DROP_SCHEMA = env.DB_DROP_SCHEMA === true;
  const DB_CONNECTION = env.DB_CONNECTION ?? 'fields';

  const baseOptions: Partial<DataSourceOptions> = {
    type: DB_TYPE as any,
    entities,
    migrations: [path.join(MIGRATIONS_DIR, '*.{ts,js}')],
    migrationsTableName: DB_MIGRATIONS_TABLE,
    migrationsRun: DB_MIGRATIONS_RUN,
    synchronize: DB_SYNCHRONIZE,
    dropSchema: DB_DROP_SCHEMA,
    logging: DB_LOGGING
      ? ['query', 'error', 'warn', 'schema']
      : ['error', 'warn'],
    schema: DB_SCHEMA,
    extra: {
      min: DB_POOL_MIN,
      max: DB_POOL_MAX,
      idleTimeoutMillis: DB_POOL_IDLE_TIMEOUT,
      connectionTimeoutMillis: DB_POOL_ACQUIRE_TIMEOUT,
      statement_timeout: DB_STATEMENT_TIMEOUT,
      query_timeout: DB_QUERY_TIMEOUT,
      ssl: DB_SSL
        ? {
            rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED,
            ca: DB_SSL_CA || undefined,
          }
        : false,
      application_name: 'odc-platform',
    },
  };

  if (DB_CONNECTION === 'url' && env.DATABASE_URL) {
    return { ...baseOptions, url: env.DATABASE_URL } as DataSourceOptions;
  }

  return {
    ...baseOptions,
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
  } as DataSourceOptions;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INSTANCE
   ═══════════════════════════════════════════════════════════════════════════ */

export const AppDataSource = new DataSource(buildDataSourceOptions());

/* ═══════════════════════════════════════════════════════════════════════════
   DIAGNOSTIC COLONNES
   ═══════════════════════════════════════════════════════════════════════════ */

async function diagnoseColumns(): Promise<void> {
  try {
    const criticalEntities = ['User', 'Formation', 'Partenaire', 'Session', 'Domaine'];
    for (const entityName of criticalEntities) {
      const meta = AppDataSource.entityMetadatas.find((m) => m.name === entityName);
      if (!meta) continue;
      const expectedCols = meta.columns.map((c) => c.databaseName);
      const rows = await AppDataSource.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1`,
        [meta.tableName],
      );
      const existingCols = rows.map((r: any) => r.column_name);
      const missing = expectedCols.filter((c) => !existingCols.includes(c));
      if (missing.length > 0) {
        console.warn('');
        console.warn(`   ⚠️  ${entityName} → "${meta.tableName}" : ${missing.length} colonne(s) manquante(s)`);
        missing.forEach((c) => console.warn(`      ❌ ${c}`));
      }
    }
  } catch (err: any) {
    console.error('   ❌ Erreur diagnostic colonnes', err.message);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   INITIALISATION
   ═══════════════════════════════════════════════════════════════════════════ */

export async function initializeDatabase(retries = 5): Promise<void> {
  const connectionInfo =
    (env.DB_CONNECTION ?? 'fields') === 'url'
      ? `URL`
      : `champs (${env.DB_HOST ?? 'localhost'}:${env.DB_PORT ?? 5432}/${env.DB_NAME ?? 'odc_db'})`;

  console.log(`🐘 PostgreSQL : connexion par ${connectionInfo}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        await AppDataSource.query('SELECT 1');

        console.log('✅ Connexion PostgreSQL réussie');
        console.log(`   Hôte    : ${env.DB_HOST ?? 'localhost'}:${env.DB_PORT ?? 5432}`);
        console.log(`   Base    : ${env.DB_NAME ?? 'odc_db'}`);
        console.log(`   Pool    : ${env.DB_POOL_MIN ?? 2}-${env.DB_POOL_MAX ?? 10}`);
        console.log(`   SSL     : ${env.DB_SSL ? 'activé' : 'désactivé'}`);
        console.log(`   Sync    : ${AppDataSource.options.synchronize ? '⚠️ OUI (DANGEREUX)' : 'non'}`);
        console.log(`   Migrations auto : ${AppDataSource.options.migrationsRun ? 'oui' : 'non'}`);

        const entityCount = AppDataSource.entityMetadatas.length;
        console.log(`   Entités chargées : ${entityCount}`);

        AppDataSource.entityMetadatas.forEach((meta) => {
          const isUser = meta.name === 'User';
          console.log(`      ${isUser ? '⭐' : ' '} ${meta.name} → "${meta.tableName}"`);
        });

        const userMeta = AppDataSource.entityMetadatas.find((m) => m.name === 'User');
        if (!userMeta) {
          console.error('');
          console.error('   ❌❌❌ USER N\'EST PAS CHARGÉ ❌❌❌');
          throw new Error('Entité User non chargée');
        }

        console.log('');
        console.log('   ⭐ User chargé :');
        console.log(`      Table     : "${userMeta.tableName}"`);
        console.log(`      Colonnes  : ${userMeta.columns.map((c) => c.propertyName).join(', ')}`);
        console.log('');

        await diagnoseColumns();
        await checkMissingTables();
      }
      return;
    } catch (err: any) {
      console.error(`❌ Tentative ${attempt}/${retries} — Erreur BDD : ${err.message}`);
      if (attempt === retries) {
        console.error('❌ Impossible de se connecter après plusieurs tentatives');
        throw err;
      }
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`⏳ Nouvelle tentative dans ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   VÉRIFICATION DES TABLES
   ═══════════════════════════════════════════════════════════════════════════ */

async function checkMissingTables(): Promise<void> {
  try {
    const rows = await AppDataSource.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    const existingTables = new Set(rows.map((r: any) => r.table_name));
    const missing = AppDataSource.entityMetadatas.filter(
      (meta) => !existingTables.has(meta.tableName),
    );
    if (missing.length === 0) {
      console.log('   ✅ Toutes les tables sont présentes');
    } else {
      console.warn('   ⚠️  Tables manquantes dans la base :');
      missing.forEach((meta) => {
        console.warn(`      - ${meta.name} → table "${meta.tableName}"`);
      });
    }
  } catch (err: any) {
    console.error('   ❌ Impossible de vérifier les tables', err.message);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FERMETURE
   ═══════════════════════════════════════════════════════════════════════════ */

export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('🔒 Connexion PostgreSQL fermée');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HEALTHCHECK
   ═══════════════════════════════════════════════════════════════════════════ */

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
        host: env.DB_HOST ?? 'localhost',
        port: env.DB_PORT ?? 5432,
        database: env.DB_NAME ?? 'odc_db',
        poolSize: env.DB_POOL_MAX ?? 10,
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