import { AppDataSource } from '../config/database';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
import { Session, StatutSession } from '../models/Session.entity';
import { Presence } from '../models/Presence.entity';
import { Note } from '../models/Note.entity';
import { NotificationService } from '../services/notification.service';
import { TypeNotification } from '../models/Notification.entity';
import { logger } from '../config/logger';

export class VerificationJob {
  /**
   * Vérifie les critères d'obtention d'attestation pour les participants
   * et notifie ceux qui sont proches du seuil
   */
  static async executer(): Promise<void> {
    const sessions = await AppDataSource.getRepository(Session).find({
      where: { statut: StatutSession.EN_COURS },
      relations: ['formation'],
    });

    let alertes = 0;

    for (const session of sessions) {
      const inscriptions = await AppDataSource.getRepository(Inscription).find({
        where: { sessionId: session.id, statut: StatutInscription.ACCEPTEE },
      });

      for (const insc of inscriptions) {
        const taux = await this.calculerTauxPresence(session.id, insc.participantId);
        const moyenne = await this.calculerMoyenne(session.id, insc.participantId);

        // Alerte si taux < 80% ou moyenne < 12
        if (taux < 80 || moyenne < 12) {
          const raisons: string[] = [];
          if (taux < 80) raisons.push(`Présence: ${taux.toFixed(1)}%`);
          if (moyenne < 12) raisons.push(`Moyenne: ${moyenne.toFixed(1)}/20`);

          await NotificationService.create({
            userId: insc.participantId,
            titre: '⚠️ Attention — critères d\'obtention',
            message: `Pour « ${session.formation?.titre} » : ${raisons.join(' • ')}`,
            type: TypeNotification.WARNING,
            metadata: { sessionId: session.id },
          });
          alertes++;
        }
      }
    }

    logger.info(`📊 Vérification terminée : ${alertes} alerte(s) envoyée(s)`);
  }

  private static async calculerTauxPresence(
    sessionId: string,
    participantId: string
  ): Promise<number> {
    const repo = AppDataSource.getRepository(Presence);

    const total = await repo
      .createQueryBuilder('p')
      .select('COUNT(DISTINCT DATE(p.date_presence))', 'total')
      .where('p.session_id = :sid', { sid: sessionId })
      .getRawOne();

    const presences = await repo
      .createQueryBuilder('p')
      .select('COUNT(DISTINCT DATE(p.date_presence))', 'count')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('p.present = true')
      .getRawOne();

    if (!total.total || total.total === '0') return 0;
    return (Number(presences.count) / Number(total.total)) * 100;
  }

  private static async calculerMoyenne(
    sessionId: string,
    participantId: string
  ): Promise<number> {
    const notes = await AppDataSource.getRepository(Note)
      .createQueryBuilder('n')
      .leftJoin('n.evaluation', 'e')
      .where('e.session_id = :sid', { sid: sessionId })
      .andWhere('n.participant_id = :pid', { pid: participantId })
      .getMany();

    if (notes.length === 0) return 0;
    return notes.reduce((s, n) => s + Number(n.note), 0) / notes.length;
  }
}