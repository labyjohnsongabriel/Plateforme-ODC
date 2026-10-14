import { AppDataSource } from '../config/database';
<<<<<<< HEAD
import { Session, StatutSession } from '../models/Session.entity';
=======
import { Session, StatutSession } from '../entities/Session.entity';
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
import { logger } from '../config/logger';

export class SessionStatutJob {
  static async executer(): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(Session);
      const today = new Date().toISOString().split('T')[0];

      // Sessions en cours
      const demarrees = await repo
        .createQueryBuilder()
        .update(Session)
        .set({ statut: StatutSession.EN_COURS })
        .where('DATE(date_debut) <= :today', { today })
        .andWhere('DATE(date_fin) >= :today', { today })
        .andWhere('statut = :statut', { statut: StatutSession.OUVERTE })
        .execute();

      // Sessions terminees
      const terminees = await repo
        .createQueryBuilder()
        .update(Session)
        .set({ statut: StatutSession.TERMINEE })
        .where('date_fin < :today', { today })
        .andWhere('statut = :statut', { statut: StatutSession.EN_COURS })
        .execute();

      logger.info(
        `📊 Sessions : ${demarrees.affected || 0} demarrees, ${terminees.affected || 0} terminees`
      );
    } catch (e) {
      logger.error('Erreur SessionStatutJob :', e);
    }
  }
}