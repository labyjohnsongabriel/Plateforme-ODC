import { eventEmitter, EVENTS } from './index';
import { logger } from '../config/logger';
import { NotificationService } from '../services/notification.service';
import { TypeNotification } from '../entities/Notification.entity';
import { MailService } from '../services/mail.service';
import { AppDataSource } from '../config/database';
import { Inscription } from '../entities/Inscription.entity';

/**
 * Enregistre les écouteurs d'événements liés aux inscriptions
 */
export function registerInscriptionEvents(): void {
  /**
   * Nouvelle inscription
   */
  eventEmitter.on(
    EVENTS.INSCRIPTION_CREATED,
    async (data: { inscriptionId: string }) => {
      try {
        const inscription = await AppDataSource.getRepository(Inscription).findOne({
          where: { id: data.inscriptionId },
          relations: ['participant', 'session', 'session.formation'],
        });
        if (!inscription) return;

        // Notification au participant
        await NotificationService.create({
          userId: inscription.participantId,
          titre: '📩 Inscription enregistrée',
          message: `Votre demande pour « ${inscription.session.formation.titre} » a été enregistrée`,
          type: TypeNotification.INFO,
        });

        // Email de confirmation
        try {
          await MailService.envoyerConfirmationInscription({
            destinataire: inscription.participant.email,
            nomParticipant: `${inscription.participant.prenom} ${inscription.participant.nom}`,
            formationTitre: inscription.session.formation.titre,
            dateDebut: inscription.session.dateDebut,
            lieu: inscription.session.lieu || 'À préciser',
          });
        } catch (err) {
          logger.error('Erreur email inscription :', err);
        }

        logger.info(`✅ Event inscription.created traité : ${data.inscriptionId}`);
      } catch (err) {
        logger.error('Erreur event inscription.created :', err);
      }
    }
  );

  /**
   * Inscription acceptée
   */
  eventEmitter.on(
    EVENTS.INSCRIPTION_ACCEPTED,
    async (data: { inscriptionId: string }) => {
      try {
        const inscription = await AppDataSource.getRepository(Inscription).findOne({
          where: { id: data.inscriptionId },
          relations: ['participant', 'session', 'session.formation'],
        });
        if (!inscription) return;

        await NotificationService.create({
          userId: inscription.participantId,
          titre: '🎉 Inscription acceptée',
          message: `Vous êtes accepté pour « ${inscription.session.formation.titre} »`,
          type: TypeNotification.SUCCESS,
        });

        try {
          await MailService.envoyerSelectionAcceptee({
            destinataire: inscription.participant.email,
            nomParticipant: `${inscription.participant.prenom} ${inscription.participant.nom}`,
            formationTitre: inscription.session.formation.titre,
            dateDebut: inscription.session.dateDebut,
            lieu: inscription.session.lieu || 'À préciser',
          });
        } catch (err) {
          logger.error('Erreur email acceptation :', err);
        }

        logger.info(`✅ Event inscription.accepted : ${data.inscriptionId}`);
      } catch (err) {
        logger.error('Erreur event inscription.accepted :', err);
      }
    }
  );

  /**
   * Inscription refusée
   */
  eventEmitter.on(
    EVENTS.INSCRIPTION_REFUSED,
    async (data: { inscriptionId: string; motif?: string }) => {
      try {
        const inscription = await AppDataSource.getRepository(Inscription).findOne({
          where: { id: data.inscriptionId },
          relations: ['participant', 'session', 'session.formation'],
        });
        if (!inscription) return;

        await NotificationService.create({
          userId: inscription.participantId,
          titre: '📋 Candidature non retenue',
          message: `Votre candidature pour « ${inscription.session.formation.titre} » n'a pas été retenue`,
          type: TypeNotification.WARNING,
        });

        try {
          await MailService.envoyerSelectionRefusee({
            destinataire: inscription.participant.email,
            nomParticipant: `${inscription.participant.prenom} ${inscription.participant.nom}`,
            formationTitre: inscription.session.formation.titre,
            motif: data.motif,
          });
        } catch (err) {
          logger.error('Erreur email refus :', err);
        }

        logger.info(`✅ Event inscription.refused : ${data.inscriptionId}`);
      } catch (err) {
        logger.error('Erreur event inscription.refused :', err);
      }
    }
  );

  /**
   * Inscription annulée
   */
  eventEmitter.on(
    EVENTS.INSCRIPTION_CANCELLED,
    (data: { inscriptionId: string }) => {
      logger.info(`❌ Inscription annulée : ${data.inscriptionId}`);
    }
  );

  logger.info('✅ Events inscription enregistrés');
}