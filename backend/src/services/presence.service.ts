// src/services/presence.service.ts
import crypto from 'crypto';
import { presenceRepository } from '../repositories/presence.repository';
import { sessionRepository } from '../repositories/session.repository';
import { inscriptionRepository } from '../repositories/inscription.repository';
import { StatutPresence, MethodePresence, StatutInscription } from '../entities/enums';
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from '../errors/AppError';
import { logger } from '../config/logger';

export class PresenceService {
  /** Génère le QR code token pour une session (formateur) */
  static async generateQr(sessionId: string, formateurId: string) {
    const session = await sessionRepository.findByIdOrFail(sessionId);
    if (session.formateurId !== formateurId) {
      throw new ForbiddenError('Vous n\'êtes pas le formateur de cette session');
    }
    if (!session.presenceOuverte) {
      throw new ForbiddenError('La session n\'accepte pas les présences actuellement');
    }

    const token = crypto.randomBytes(16).toString('hex');
    session.qrCodeSecret = token;
    await sessionRepository.save(session);

    return {
      sessionId: session.id,
      qrToken: token,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      url: `${process.env.APP_URL}/presence/${session.codeSession}?t=${token}`,
    };
  }

  /** Scan du QR par un participant */
  static async scannerQr(participantId: string, sessionId: string, qrToken: string, ip?: string) {
    const session = await sessionRepository.findByIdOrFail(sessionId);
    if (!session.presenceOuverte) throw new ForbiddenError('Présence fermée');
    if (session.qrCodeSecret !== qrToken) throw new BadRequestError('QR code invalide ou expiré');

    // Vérifier que le participant est bien inscrit et accepté
    const inscription = await inscriptionRepository.findBySessionAndParticipant(sessionId, participantId);
    if (!inscription || inscription.statut !== StatutInscription.ACCEPTEE) {
      throw new ForbiddenError('Vous n\'êtes pas inscrit à cette session');
    }

    const today = new Date().toISOString().split('T')[0];
    const existing = await presenceRepository.findBySessionAndParticipant(sessionId, participantId, today);
    if (existing) throw new ConflictError('Présence déjà enregistrée aujourd\'hui');

    const presence = await presenceRepository.create({
      sessionId,
      participantId,
      statut: StatutPresence.PRESENT,
      methode: MethodePresence.QR_CODE,
      datePresence: new Date(today),
      scanneLe: new Date(),
      qrToken,
      ipAddress: ip,
    });

    logger.info(`✅ Présence QR : user=${participantId} session=${session.codeSession}`);
    return presence;
  }

  /** Saisie manuelle (formateur/staff) */
  static async marquerManuel(
    sessionId: string,
    participantId: string,
    present: boolean,
    commentaire: string | undefined,
    staffId: string,
  ) {
    const session = await sessionRepository.findByIdOrFail(sessionId);
    if (session.formateurId !== staffId) {
      throw new ForbiddenError('Seul le formateur peut saisir manuellement les présences');
    }

    const today = new Date().toISOString().split('T')[0];
    let presence = await presenceRepository.findBySessionAndParticipant(sessionId, participantId, today);

    if (presence) {
      presence.present = present;
      presence.commentaire = commentaire ?? presence.commentaire;
      presence.statut = present ? StatutPresence.PRESENT : StatutPresence.ABSENT;
      await presenceRepository.save(presence);
    } else {
      presence = await presenceRepository.create({
        sessionId,
        participantId,
        statut: present ? StatutPresence.PRESENT : StatutPresence.ABSENT,
        methode: MethodePresence.MANUEL,
        datePresence: new Date(today),
        commentaire,
      });
    }

    return presence;
  }

  static async findBySession(sessionId: string, filters: any) {
    const data = await presenceRepository.findBySession(sessionId);
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    return {
      data: data.slice((page - 1) * limit, page * limit),
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit),
    };
  }

  static async mesPresences(participantId: string) {
    return presenceRepository.findByParticipant(participantId);
  }

  static async calculerTauxPresence(sessionId: string, participantId: string) {
    return presenceRepository.tauxPresence(sessionId, participantId);
  }

  static async getStats(sessionId: string) {
    return presenceRepository.statsBySession(sessionId);
  }
}