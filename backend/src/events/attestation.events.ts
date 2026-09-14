import { eventEmitter, EVENTS } from './index';
import { logger } from '../config/logger';
import { NotificationService } from '../services/notification.service';
import { TypeNotification } from '../models/Notification.entity';
import { MailService } from '../services/mail.service';
import { PdfService } from '../services/pdf.service';
import { AppDataSource } from '../config/database';
import { Attestation } from '../models/Attestation.entity';

/**
 * Enregistre les écouteurs d'événements liés aux attestations
 */
export function registerAttestationEvents(): void {
  /**
   * Après génération d'une attestation :
   * - Générer le PDF
   * - Envoyer par email
   * - Notifier
   */
  eventEmitter.on(
    EVENTS.ATTESTATION_GENERATED,
    async (data: { attestationId: string }) => {
      try {
        logger.info(`📜 Event: attestation générée ${data.attestationId}`);

        const attestation = await AppDataSource.getRepository(Attestation).findOne({
          where: { id: data.attestationId },
          relations: ['participant', 'session', 'session.formation', 'session.formateur'],
        });

        if (!attestation) return;

        // Notification app
        await NotificationService.create({
          userId: attestation.participantId,
          titre: '🎓 Votre attestation est disponible',
          message: `Attestation « ${attestation.session.formation.titre} » — N° ${attestation.numero}`,
          type: TypeNotification.SUCCESS,
          metadata: { attestationId: attestation.id, numero: attestation.numero },
        });

        // Envoi email (best-effort)
        try {
          const pdfBuffer = await PdfService.genererAttestation({
            numero: attestation.numero,
            hash: attestation.hash,
            participantNom: attestation.participant.nom,
            participantPrenom: attestation.participant.prenom,
            formationTitre: attestation.session.formation.titre,
            formationDomaine: attestation.session.formation.domaine,
            formationDuree: attestation.session.formation.dureeHeures,
            sessionDateDebut: attestation.session.dateDebut,
            sessionDateFin: attestation.session.dateFin,
            formateurNom: attestation.session.formateur
              ? `${attestation.session.formateur.prenom} ${attestation.session.formateur.nom}`
              : 'ODC',
            note: Number(attestation.noteFinale),
            tauxPresence: Number(attestation.tauxPresence),
            dateEmission: attestation.dateEmission,
            qrCodeDataUrl: '', // à générer séparément si besoin
          });

          await MailService.envoyerAttestation({
            destinataire: attestation.participant.email,
            nomParticipant: `${attestation.participant.prenom} ${attestation.participant.nom}`,
            formationTitre: attestation.session.formation.titre,
            numeroAttestation: attestation.numero,
            pdfBuffer,
          });
        } catch (err) {
          logger.error('Erreur envoi email attestation :', err);
        }
      } catch (err) {
        logger.error('Erreur event attestation.generated :', err);
      }
    }
  );

  /**
   * Après téléchargement d'une attestation
   */
  eventEmitter.on(
    EVENTS.ATTESTATION_DOWNLOADED,
    async (data: { attestationId: string }) => {
      try {
        await AppDataSource.getRepository(Attestation).update(data.attestationId, {
          telechargee: true,
          dateTelechargement: new Date(),
        });
        logger.info(`📥 Attestation téléchargée : ${data.attestationId}`);
      } catch (err) {
        logger.error('Erreur event attestation.downloaded :', err);
      }
    }
  );

  /**
   * Après vérification (QR Code)
   */
  eventEmitter.on(
    EVENTS.ATTESTATION_VERIFIED,
    (data: { numero: string; valide: boolean }) => {
      logger.info(
        `🔍 Vérification attestation ${data.numero} : ${data.valide ? 'valide' : 'invalide'}`
      );
    }
  );

  logger.info('✅ Events attestation enregistrés');
}