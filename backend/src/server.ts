<<<<<<< HEAD
=======
// src/server.ts
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
import 'reflect-metadata';

import http from 'http';

import app from './app';

import { env } from './config/env';
import { logger } from './config/logger';

import {
  initializeDatabase,
<<<<<<< HEAD
  ensureRoles,
=======
  AppDataSource,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
} from './config/database';

import {
  initializeSockets,
} from './sockets';

import {
  JobsScheduler,
} from './jobs';

<<<<<<< HEAD
async function bootstrap(): Promise<void> {
  try {
    logger.info(
      '🚀 Démarrage du serveur ODC Platform...'
    );
=======
import { DatabaseSeeder } from './database/database.seeder';

async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Démarrage du serveur ODC Platform...');
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

    /**
     * ==========================================
     * 1. BASE DE DONNÉES
     * ==========================================
     */

    await initializeDatabase();
<<<<<<< HEAD
    await ensureRoles();
=======

    /**
     * ==========================================
     * 1bis. SEED AUTOMATIQUE
     * ⭐ Initialise les rôles/permissions si absents
     * ==========================================
     */

    await runSeedIfNeeded();
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

    /**
     * ==========================================
     * 2. SERVEUR HTTP
     * ==========================================
     */

<<<<<<< HEAD
    const httpServer =
      http.createServer(app);
=======
    const httpServer = http.createServer(app);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

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

<<<<<<< HEAD
    httpServer.listen(
      env.PORT,
      () => {
        logger.info(
          `✅ Serveur : http://localhost:${env.PORT}`
        );

        logger.info(
          `📚 API : http://localhost:${env.PORT}${env.API_PREFIX}`
        );

        logger.info(
          `💚 Health : http://localhost:${env.PORT}${env.API_PREFIX}/health`
        );

        logger.info(
          `🔌 Sockets : ws://localhost:${env.PORT}/socket.io`
        );

        logger.info(
          `🌍 Environnement : ${env.NODE_ENV}`
        );
      }
    );
=======
    httpServer.listen(env.PORT, () => {
      logger.info(`✅ Serveur : http://localhost:${env.PORT}`);
      logger.info(`📚 API : http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`💚 Health : http://localhost:${env.PORT}${env.API_PREFIX}/health`);
      logger.info(`🔌 Sockets : ws://localhost:${env.PORT}/socket.io`);
      logger.info(`🌍 Environnement : ${env.NODE_ENV}`);
    });
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

    /**
     * ==========================================
     * ARRÊT GRACIEUX
     * ==========================================
     */

<<<<<<< HEAD
    const shutdown = async (
      signal: string
    ) => {
      logger.info(
        `⚠️ Signal ${signal}. Arrêt gracieux...`
      );

      httpServer.close(() => {
        logger.info(
          '🔒 Serveur HTTP fermé'
        );
      });

      const {
        AppDataSource,
      } = await import(
        './config/database'
      );

      if (
        AppDataSource.isInitialized
      ) {
        await AppDataSource.destroy();

        logger.info(
          '🔒 Connexion BDD fermée'
        );
=======
    const shutdown = async (signal: string) => {
      logger.info(`⚠️ Signal ${signal}. Arrêt gracieux...`);

      httpServer.close(() => {
        logger.info('🔒 Serveur HTTP fermé');
      });

      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        logger.info('🔒 Connexion BDD fermée');
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      }

      process.exit(0);
    };

<<<<<<< HEAD
    process.on(
      'SIGTERM',
      () => shutdown('SIGTERM')
    );

    process.on(
      'SIGINT',
      () => shutdown('SIGINT')
    );

    process.on(
      'unhandledRejection',
      (reason) => {
        logger.error(
          '❌ Unhandled Rejection :',
          reason
        );
      }
    );

    process.on(
      'uncaughtException',
      (error) => {
        logger.error(
          '❌ Uncaught Exception :',
          error
        );

        process.exit(1);
      }
    );

  } catch (error) {
    logger.error(
      '❌ Erreur fatale :',
      error
    );

=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    process.exit(1);
  }
}

<<<<<<< HEAD
=======
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

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
bootstrap();