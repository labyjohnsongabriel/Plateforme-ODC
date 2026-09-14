import cron, { ScheduledTask } from 'node-cron';
import { logger } from '../config/logger';

const tasks: ScheduledTask[] = [];

export class JobsScheduler {
  static demarrer(): void {
    logger.info('⏰ Démarrage des jobs CRON...');

    // Statuts des sessions — toutes les heures
    tasks.push(
      cron.schedule('0 * * * *', async () => {
        try {
          logger.info('🔄 [CRON] Mise a jour statuts sessions...');
          const { SessionStatutJob } = await import('./sessionStatut.job');
          await SessionStatutJob.executer();
        } catch (e) {
          logger.error('[CRON] Erreur session statut :', e);
        }
      })
    );

    logger.info(`✅ ${tasks.length} job(s) CRON demarre(s)`);
  }

  static arreter(): void {
    tasks.forEach((t) => t.stop());
    tasks.length = 0;
    logger.info('⏹️  Jobs CRON arretes');
  }
}

export function demarrerJobs(): void {
  JobsScheduler.demarrer();
}

export function arreterJobs(): void {
  JobsScheduler.arreter();
}