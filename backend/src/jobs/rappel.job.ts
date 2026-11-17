import { AppDataSource } from '../config/database';
import { Session, StatutSession } from '../entities/Session.entity';
import { Inscription, StatutInscription } from '../entities/Inscription.entity';
import { MailService } from '../services/mail.service';
import { NotificationService } from '../services/notification.service';
import { TypeNotification } from '../entities/Notification.entity';
import { logger } from '../config/logger';
import { Between } from 'typeorm';

export class RappelJob {
  /**
   * Envoie des rappels J-3 et J-1 avant le début des sessions
   */
  static async executer(): Promise<void> {
    const sessionRepo = AppDataSource.getRepository(Session);

    // Rappel J-3
    await this.envoyerRappels(sessionRepo, 3);
    // Rappel J-1
    await this.envoyerRappels(sessionRepo, 1);
  }

  private static async envoyerRappels(
    sessionRepo: any,
    joursRestants: number
  ): Promise<void> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + joursRestants);
    const dateStr = targetDate.toISOString().split('T')[0];

    const sessions = await sessionRepo.find({
      where: {
        statut: StatutSession.OUVERTE,
        dateDebut: dateStr as any,
      },
      relations: ['formation', 'formateur'],
    });

    if (sessions.length === 0) return;

    logger.info(
      `📅 ${sessions.length} session(s) dans ${joursRestants} jour(s) — envoi rappels`
    );

    for (const session of sessions) {
      const inscriptions = await AppDataSource.getRepository(Inscription).find({
        where: {
          sessionId: session.id,
          statut: StatutInscription.ACCEPTEE,
        },
        relations: ['participant'],
      });

      for (const insc of inscriptions) {
        // Notification app
        await NotificationService.create({
          userId: insc.participantId,
          titre: `⏰ Formation dans ${joursRestants} jour(s)`,
          message: `« ${session.formation?.titre} » commence le ${new Date(session.dateDebut).toLocaleDateString('fr-FR')} à ${session.lieu || 'lieu à préciser'}`,
          type: TypeNotification.INFO,
          metadata: { sessionId: session.id },
        });

        // Email
        try {
          await MailService.envoyerRappelSession({
            destinataire: insc.participant.email,
            nomParticipant: `${insc.participant.prenom} ${insc.participant.nom}`,
            formationTitre: session.formation?.titre || '',
            dateDebut: session.dateDebut,
            lieu: session.lieu || 'À préciser',
            joursRestants,
          });
        } catch (err) {
          logger.error(`❌ Email rappel échec pour ${insc.participant.email}`);
        }
      }
    }
  }
}