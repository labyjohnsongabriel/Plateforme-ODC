// src/jobs/sessionStatut.job.ts
import { AppDataSource } from '../config/database';
import { Session } from '../entities/Session.entity';
import { StatutSession } from '../entities/enums';   // ⬅️ IMPORT CORRIGÉ
import { logger } from '../config/logger';

export class SessionStatutJob {
  static async executer(): Promise<void> {
    try {
      /* ---------- Garde-fou : vérifier l'enum ---------- */
      if (!StatutSession || !StatutSession.EN_COURS) {
        logger.error(
          '[SessionStatutJob] StatutSession non importé ou incomplet',
          { StatutSession },
        );
        return;
      }

      const repo = AppDataSource.getRepository(Session);
      const today = new Date().toISOString().split('T')[0];

      logger.info(`🔄 [CRON] Mise à jour statuts sessions (${today})`);

      /* ---------- 1. OUVERTE → EN_COURS (dateDebut passée, dateFin future) ---------- */
      const demarrees = await repo
        .createQueryBuilder()
        .update(Session)
        .set({ statut: StatutSession.EN_COURS, presenceOuverte: true })
        .where('DATE(date_debut) <= :today', { today })
        .andWhere('DATE(date_fin) >= :today', { today })
        .andWhere('statut = :statut', { statut: StatutSession.OUVERTE })
        .andWhere('deleted_at IS NULL')
        .execute();

      /* ---------- 2. PLANIFIEE → EN_COURS (idem) ---------- */
      const planifiees = await repo
        .createQueryBuilder()
        .update(Session)
        .set({ statut: StatutSession.EN_COURS, presenceOuverte: true })
        .where('DATE(date_debut) <= :today', { today })
        .andWhere('DATE(date_fin) >= :today', { today })
        .andWhere('statut = :statut', { statut: StatutSession.PLANIFIEE })
        .andWhere('deleted_at IS NULL')
        .execute();

      /* ---------- 3. EN_COURS → TERMINEE (dateFin passée) ---------- */
      const terminees = await repo
        .createQueryBuilder()
        .update(Session)
        .set({ statut: StatutSession.TERMINEE, presenceOuverte: false })
        .where('date_fin < :today', { today })
        .andWhere('statut = :statut', { statut: StatutSession.EN_COURS })
        .andWhere('deleted_at IS NULL')
        .execute();

      /* ---------- Logs ---------- */
      logger.info(
        `📊 Sessions : ${demarrees.affected || 0} OUVERTE→EN_COURS, ` +
          `${planifiees.affected || 0} PLANIFIEE→EN_COURS, ` +
          `${terminees.affected || 0} EN_COURS→TERMINEE`,
      );
    } catch (e) {
      logger.error('Erreur SessionStatutJob', e);
    }
  }
}