// src/services/attestation.service.ts
import crypto from 'crypto';
import { attestationRepository } from '../repositories/attestation.repository';
import { sessionRepository } from '../repositories/session.repository';
import { presenceRepository } from '../repositories/presence.repository';
import { noteRepository } from '../repositories/note.repository';
import { inscriptionRepository } from '../repositories/inscription.repository';
import { StatutInscription } from '../entities/enums';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/AppError';
import { notificationService } from './notification.service';
import { logger } from '../config/logger';

export interface Eligibilite {
  eligible: boolean;
  raison?: string;
  tauxPresence: number;
  moyenne: number;
}

export class AttestationService {
  /** Numéro unique : ODC-ATT-YYYY-NNNNNN */
  private static async generateNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await attestationRepository.count();
    return `ODC-ATT-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  /** Hash de vérification */
  private static generateHash(sessionId: string, participantId: string): string {
    return crypto
      .createHash('sha256')
      .update(`${sessionId}:${participantId}:${Date.now()}`)
      .digest('hex');
  }

  /** Vérifie l'éligibilité d'un participant à une attestation */
  static async verifierEligibilite(sessionId: string, participantId: string): Promise<Eligibilite> {
    const inscription = await inscriptionRepository.findBySessionAndParticipant(sessionId, participantId);
    if (!inscription || inscription.statut !== StatutInscription.ACCEPTEE) {
      return { eligible: false, raison: 'Participant non accepté dans la session', tauxPresence: 0, moyenne: 0 };
    }

    const tauxPresence = await presenceRepository.tauxPresence(sessionId, participantId);
    const notes = await noteRepository.findBySessionAndParticipant(sessionId, participantId);
    const moyenne = notes.length
      ? Math.round((notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) * 100) / 100
      : 0;

    const SEUIL_PRESENCE = 75;
    const SEUIL_NOTE = 10;

    if (tauxPresence < SEUIL_PRESENCE) {
      return { eligible: false, raison: `Taux de présence insuffisant (${tauxPresence}% < ${SEUIL_PRESENCE}%)`, tauxPresence, moyenne };
    }
    if (notes.length > 0 && moyenne < SEUIL_NOTE) {
      return { eligible: false, raison: `Moyenne insuffisante (${moyenne} < ${SEUIL_NOTE})`, tauxPresence, moyenne };
    }
    return { eligible: true, tauxPresence, moyenne };
  }

  /** Génère une attestation individuelle */
  static async generer(sessionId: string, participantId: string) {
    const existing = await attestationRepository.findBySessionAndParticipant(sessionId, participantId);
    if (existing) throw new ConflictError('Une attestation existe déjà pour ce participant');

    const elig = await this.verifierEligibilite(sessionId, participantId);
    if (!elig.eligible) throw new BadRequestError(elig.raison ?? 'Participant non éligible');

    const numero = await this.generateNumero();
    const hash = this.generateHash(sessionId, participantId);

    const attestation = await attestationRepository.create({
      numero,
      hash,
      sessionId,
      participantId,
      noteFinale: elig.moyenne,
      tauxPresence: elig.tauxPresence,
      dateEmission: new Date(),
      valide: true,
    });

    // TODO: générer PDF + QR + signature numérique
    // const fileUrl = await pdfService.generateAttestation(attestation);
    // attestation.fichierUrl = fileUrl;
    // await attestationRepository.save(attestation);

    await notificationService.create({
      userId: participantId,
      titre: '🎓 Attestation disponible',
      message: `Votre attestation ${numero} est disponible au téléchargement`,
      metadata: { attestationId: attestation.id },
    });

    logger.info(`🎓 Attestation générée : ${numero}`);
    return attestation;
  }

  /** Génération pour toute une session */
  static async genererParSession(sessionId: string) {
    const session = await sessionRepository.findByIdOrFail(sessionId, ['formation']);
    const inscriptions = await inscriptionRepository.findBySession(sessionId);
    const acceptes = inscriptions.filter((i) => i.statut === StatutInscription.ACCEPTEE);

    const result = { total: acceptes.length, generes: 0, ignores: 0, erreurs: [] as Array<{ participantId: string; raison: string }> };

    for (const insc of acceptes) {
      try {
        await this.generer(sessionId, insc.participantId);
        result.generes++;
      } catch (e: any) {
        result.ignores++;
        result.erreurs.push({ participantId: insc.participantId, raison: e.message });
      }
    }

    logger.info(`🎓 Génération session=${session.codeSession} : ${result.generes}/${result.total}`);
    return result;
  }

  /** Vérification publique */
  static async verifierAuthenticite(numero: string) {
    const att = await attestationRepository.findByNumero(numero);
    if (!att) return { valide: false };
    return {
      valide: true,
      attestation: {
        numero: att.numero,
        dateEmission: att.dateEmission,
        participant: `${att.participant.prenom} ${att.participant.nom}`,
        formation: att.session.formation.titre,
        noteFinale: att.noteFinale,
        tauxPresence: att.tauxPresence,
      },
    };
  }

  /** Mes attestations (participant) */
  static async mesAttestations(participantId: string) {
    return attestationRepository.findByParticipant(participantId);
  }

  /** Liste admin/staff */
  static async findAll(filters: any) {
    return attestationRepository.search({
      sessionId: filters.sessionId,
      participantId: filters.participantId,
      valide: filters.valide === 'true' ? true : filters.valide === 'false' ? false : undefined,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 10,
    });
  }

  /** Téléchargement (participant) */
  static async telecharger(id: string, userId: string) {
    const att = await attestationRepository.findByIdOrFail(id);
    if (att.participantId !== userId) {
      throw new NotFoundError('Attestation introuvable');
    }
    if (!att.fichierUrl) throw new NotFoundError('Fichier non disponible');

    att.telechargee = true;
    att.dateTelechargement = new Date();
    await attestationRepository.save(att);

    return {
      path: att.fichierUrl,
      nom: `attestation-${att.numero}.pdf`,
    };
  }
}