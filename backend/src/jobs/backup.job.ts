import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../config/logger';

const execAsync = promisify(exec);

export class BackupJob {
  /**
   * Sauvegarde la base de données (pg_dump)
   */
  static async executer(): Promise<void> {
    const backupDir = path.join(process.cwd(), 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    const date = new Date().toISOString().split('T')[0];
    const filename = `odc_db_${date}.sql`;
    const filePath = path.join(backupDir, filename);

    const cmd = `pg_dump -h ${env.DB_HOST} -p ${env.DB_PORT} -U ${env.DB_USERNAME} -d ${env.DB_NAME} -f "${filePath}"`;

    try {
      // Définir le mot de passe via variable d'environnement
      const envVars = { ...process.env, PGPASSWORD: env.DB_PASSWORD };

      await execAsync(cmd, { env: envVars });

      const stats = await fs.stat(filePath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

      logger.info(`💾 Backup BDD : ${filename} (${sizeMB} MB)`);

      // Nettoyer les backups > 30 jours
      await this.nettoyerVieuxBackups(backupDir);
    } catch (err: any) {
      logger.error(`❌ Backup échoué : ${err.message}`);
    }
  }

  /**
   * Supprime les backups de plus de 30 jours
   */
  private static async nettoyerVieuxBackups(dir: string): Promise<void> {
    const files = await fs.readdir(dir);
    const limite = Date.now() - 30 * 24 * 3600 * 1000;

    for (const f of files) {
      const filePath = path.join(dir, f);
      const stat = await fs.stat(filePath);
      if (stat.mtimeMs < limite) {
        await fs.unlink(filePath);
        logger.info(`🗑️  Backup supprimé : ${f}`);
      }
    }
  }
}