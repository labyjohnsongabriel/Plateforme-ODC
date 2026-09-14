import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { logger } from '../config/logger';

async function syncDatabase() {
  try {
    logger.info('🔄 Connexion à PostgreSQL...');
    await AppDataSource.initialize();
    logger.info('✅ Connecté');

    logger.info('🔄 Synchronisation du schéma (ALTER TABLE)...');
    // synchronize(false) = ajoute les colonnes manquantes SANS supprimer les données
    await AppDataSource.synchronize(false);
    logger.info('✅ Schéma synchronisé');

    // Lister les colonnes de la table users
    const columns = await AppDataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    logger.info('');
    logger.info('📊 Colonnes de la table users :');
    columns.forEach((c: any, i: number) => {
      logger.info(`   ${(i + 1).toString().padStart(2)}. ${c.column_name} (${c.data_type})`);
    });

    await AppDataSource.destroy();
    process.exit(0);
  } catch (err: any) {
    logger.error('❌ Erreur sync :', err.message);
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    process.exit(1);
  }
}

syncDatabase();