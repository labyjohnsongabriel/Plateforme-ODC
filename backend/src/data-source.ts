// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './config/env';

/* ============================================================================
   DATA SOURCE — Point d'entrée TypeORM
   ============================================================================ */

const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,

  /* -------------------- Entités -------------------- */
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],

  /* -------------------- Migrations -------------------- */
  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  /* -------------------- Synchronisation -------------------- */
  // ⚠️ Uniquement en développement — jamais en production
  synchronize: env.NODE_ENV !== 'production',

  /* -------------------- Logs -------------------- */
  logging: env.NODE_ENV === 'development' ? ['error', 'warn'] : false,

  /* -------------------- SSL -------------------- */
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
export { AppDataSource };