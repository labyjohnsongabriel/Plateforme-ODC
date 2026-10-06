import fs from 'fs/promises';
import path from 'path';
import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification.entity';
import { AuditLog } from '../entities/AuditLog.entity';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class CleanupJob {
  /**
   * Nettoie les vieux fichiers temporaires et les logs anciens
   */
  static async executer(): Promise<void> {
    await this.nettoyerFichiersTemp();
    await this.nettoyerNotifications();
    await this.nettoyerAuditLogs();
  }

  /**
   * Supprime les fichiers temp de plus de 24h
   */
  private static async nettoyerFichiersTemp(): Promise<void> {
    const tempDir = path.join(process.cwd(), env.UPLOAD_DIR, 'temp');
    try {
      const files = await fs.readdir(tempDir);
      const limite = Date.now() - 24 * 3600 * 1000;
      let deleted = 0;

      for (const f of files) {
        if (f === '.gitkeep') continue;
        const filePath = path.join(tempDir, f);
        const stat = await fs.stat(filePath);
        if (stat.mtimeMs < limite) {
          await fs.unlink(filePath);
          deleted++;
        }
      }

      if (deleted > 0) logger.info(`🧹 ${deleted} fichier(s) temp supprimé(s)`);
    } catch (err: any) {
      if (err.code !== 'ENOENT') logger.error('Erreur nettoyage temp :', err);
    }
  }

  /**
   * Supprime les notifications lues de plus de 30 jours
   */
  private static async nettoyerNotifications(): Promise<void> {
    const result = await AppDataSource.getRepository(Notification)
      .createQueryBuilder()
      .delete()
      .where('lue = true')
      .andWhere('created_at < NOW() - INTERVAL \'30 days\'')
      .execute();

    if (result.affected) {
      logger.info(`🧹 ${result.affected} notification(s) supprimée(s)`);
    }
  }

  /**
   * Supprime les audit logs de plus de 90 jours
   */
  private static async nettoyerAuditLogs(): Promise<void> {
    const result = await AppDataSource.getRepository(AuditLog)
      .createQueryBuilder()
      .delete()
      .where('created_at < NOW() - INTERVAL \'90 days\'')
      .execute();

    if (result.affected) {
      logger.info(`🧹 ${result.affected} log(s) d'audit supprimé(s)`);
    }
  }
}