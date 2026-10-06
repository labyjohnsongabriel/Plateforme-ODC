import { AppDataSource } from '../config/database';
import { Session, StatutSession } from '../entities/Session.entity';
import { AttestationService } from '../services/attestation.service';
import { logger } from '../config/logger';
import { LessThan } from 'typeorm';

export class AttestationJob {
  /**
   * Génère automatiquement les attestations des sessions terminées depuis 24h
   */
  static async executer(): Promise<void> {
    const sessionRepo = AppDataSource.getRepository(Session);
    const dateLimite = new Date(Date.now() - 24 * 3600 * 1000);

    const sessions = await sessionRepo.find({
      where: {
        statut: StatutSession.TERMINEE,
        dateFin: LessThan(dateLimite),
      },
      relations: ['formation'],
    });

    if (sessions.length === 0) {
      logger.info('📭 Aucune session à traiter');
      return;
    }

    logger.info(`📜 Traitement de ${sessions.length} session(s)`);

    let totalSucces = 0;
    let totalEchecs = 0;

    for (const session of sessions) {
      try {
        const result = await AttestationService.genererParSession(session.id);
        totalSucces += result.succes;
        totalEchecs += result.echecs;
        logger.info(
          `✅ Session ${session.formation?.titre} : ${result.succes} OK, ${result.echecs} échecs`
        );
      } catch (err) {
        logger.error(`❌ Erreur session ${session.id} :`, err);
      }
    }

    logger.info(
      `📊 Attestations générées : ${totalSucces} OK, ${totalEchecs} échecs`
    );
  }
}