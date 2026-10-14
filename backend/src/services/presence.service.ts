<<<<<<< HEAD
import { AppDataSource } from '../config/database';
import { Presence } from '../models/Presence.entity';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { QrCodeService } from './qrcode.service';

export class PresenceService {
  private static get repo() { return AppDataSource.getRepository(Presence); }

  static async scannerQr(participantId: string, sessionId: string, qrToken: string) {
    const inscription = await AppDataSource.getRepository(Inscription).findOne({
      where: { sessionId, participantId, statut: StatutInscription.ACCEPTEE },
    });
    if (!inscription) throw new ForbiddenError('Non inscrit ou accepte');
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.repo.createQueryBuilder('p')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('DATE(p.date_presence) = :today', { today })
      .getOne();
    if (existing) throw new ConflictError('Presence deja enregistree');
    const presence = this.repo.create({
      sessionId, participantId, datePresence: new Date(),
      heureScan: new Date().toTimeString().split(' ')[0], present: true, qrToken,
    });
    await this.repo.save(presence);
    return presence;
  }

  static async marquerManuel(sessionId: string, participantId: string, present: boolean, commentaire?: string) {
    const today = new Date().toISOString().split('T')[0];
    let p = await this.repo.createQueryBuilder('p')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('DATE(p.date_presence) = :today', { today })
      .getOne();
    if (!p) p = this.repo.create({ sessionId, participantId, datePresence: new Date(), present, commentaire });
    else { p.present = present; if (commentaire) p.commentaire = commentaire; }
    await this.repo.save(p);
    return p;
  }

  static async findBySession(sessionId: string, params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);
    const [data, total] = await this.repo.findAndCount({
      where: { sessionId }, relations: ['participant'], skip, take: limit,
      order: { datePresence: 'DESC' },
    });
    return { data, total, page, limit };
  }

  static async calculerTauxPresence(sessionId: string, participantId: string): Promise<number> {
    const total = await this.repo.createQueryBuilder('p')
      .select('COUNT(DISTINCT DATE(p.date_presence))', 'total')
      .where('p.session_id = :sid', { sid: sessionId }).getRawOne();
    const presences = await this.repo.createQueryBuilder('p')
      .select('COUNT(DISTINCT DATE(p.date_presence))', 'count')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('p.present = true').getRawOne();
    if (!total.total || total.total === '0') return 0;
    return (Number(presences.count) / Number(total.total)) * 100;
  }

  static async getStats(sessionId: string) {
    const records = await this.repo.find({ where: { sessionId } });
    const total = records.length;
    const presents = records.filter((presence) => presence.present).length;
    const absents = total - presents;
    const tauxPresence = total ? Math.round((presents / total) * 100) : 0;

    return {
      total,
      presents,
      absents,
      retards: 0,
      excuses: records.filter((presence) => presence.justifiee).length,
      tauxPresence,
      tauxAbsence: total ? 100 - tauxPresence : 0,
    };
  }

  static async generateQr(sessionId: string) {
    return QrCodeService.genererQrSession(sessionId);
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}