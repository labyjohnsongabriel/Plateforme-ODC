// src/server.ts
import 'reflect-metadata';

import http from 'http';

import app from './app';

import { env } from './config/env';
import { logger } from './config/logger';

import {
  initializeDatabase,
  AppDataSource,
} from './config/database';

import {
  initializeSockets,
} from './sockets';

import {
  JobsScheduler,
} from './jobs';

import { DatabaseSeeder } from './database/database.seeder';

async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Démarrage du serveur ODC Platform...');

    /**
     * ==========================================
     * 1. BASE DE DONNÉES
     * ==========================================
     */

    await initializeDatabase();

    /**
     * ==========================================
     * 1bis. SEED AUTOMATIQUE
     * ⭐ Initialise les rôles/permissions si absents
     * ==========================================
     */

    await runSeedIfNeeded();

    /**
     * ==========================================
     * 2. SERVEUR HTTP
     * ==========================================
     */

    const httpServer = http.createServer(app);

    /**
     * ==========================================
     * 3. SOCKET.IO
     * ==========================================
     */

    initializeSockets(httpServer);

    /**
     * ==========================================
     * 4. JOBS CRON
     * ==========================================
     */

    JobsScheduler.demarrer();

    /**
     * ==========================================
     * 5. DÉMARRAGE SERVEUR
     * ==========================================
     */

    httpServer.listen(env.PORT, () => {
      logger.info(`✅ Serveur : http://localhost:${env.PORT}`);
      logger.info(`📚 API : http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`💚 Health : http://localhost:${env.PORT}${env.API_PREFIX}/health`);
      logger.info(`🔌 Sockets : ws://localhost:${env.PORT}/socket.io`);
      logger.info(`🌍 Environnement : ${env.NODE_ENV}`);
    });

    /**
     * ==========================================
     * ARRÊT GRACIEUX
     * ==========================================
     */

    const shutdown = async (signal: string) => {
      logger.info(`⚠️ Signal ${signal}. Arrêt gracieux...`);

      httpServer.close(() => {
        logger.info('🔒 Serveur HTTP fermé');
      });

      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        logger.info('🔒 Connexion BDD fermée');
      }

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('❌ Unhandled Rejection :', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception :', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Erreur fatale :', error);
    process.exit(1);
  }
}

/**
 * ============================================================================
 * SEED AUTOMATIQUE AU DÉMARRAGE
 * ============================================================================
 * Vérifie si les rôles existent. Si la table est vide, exécute le seed.
 * Idempotent : ne fait rien si les rôles sont déjà présents.
 */
async function runSeedIfNeeded(): Promise<void> {
  try {
    const roleRepo = AppDataSource.getRepository('Role');
    const roleCount = await roleRepo.count();

    if (roleCount > 0) {
      logger.info(`✅ ${roleCount} rôle(s) déjà initialisé(s) en base`);
      return;
    }

    logger.warn('⚠️  Aucun rôle en base — exécution du seed initial...');

    const seeder = new DatabaseSeeder(AppDataSource);
    await seeder.run();

    logger.info('✅ Seed initial terminé');
  } catch (error) {
    logger.error('❌ Erreur pendant le seed automatique :', error);
    // On ne crash pas le serveur — le seed peut être relancé manuellement
  }
}

bootstrap();