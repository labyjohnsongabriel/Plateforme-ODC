// src/controllers/PresenceController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Presence } from '../entities/Presence.entity';
import { Session } from '../entities/Session.entity';
import { Inscription } from '../entities/Inscription.entity';
import {
  StatutPresence,
  MethodePresence,
  StatutInscription,
} from '../entities/enums';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../errors/AppError';
import { logger } from '../config/logger';
import crypto from 'crypto';

export class PresenceController {
  // ==========================================================================
  // 📷 SCAN QR (participant)
  // ==========================================================================
  /** POST /api/presences/scanner */
  static async scannerQr(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, qrToken } = req.body;
      if (!sessionId || !qrToken) {
        throw new BadRequestError('sessionId et qrToken requis');
      }

      const session = await AppDataSource.getRepository(Session).findOne({
        where: { id: sessionId },
      });
      if (!session) throw new NotFoundError('Session introuvable');
      if (!session.presenceOuverte) throw new ForbiddenError('Présence fermée');
      if (session.qrCodeSecret !== qrToken) throw new BadRequestError('QR code invalide');

      // Vérifier que le participant est bien inscrit et accepté
      const inscription = await AppDataSource.getRepository(Inscription).findOne({
        where: { sessionId, participantId: req.userId! },
      });
      if (!inscription || inscription.statut !== StatutInscription.ACCEPTEE) {
        throw new ForbiddenError('Vous n\'êtes pas inscrit à cette session');
      }

      const today = new Date().toISOString().split('T')[0];
      const repo = AppDataSource.getRepository(Presence);

      const existing = await repo.findOne({
        where: {
          sessionId,
          participantId: req.userId!,
          datePresence: new Date(today) as any,
        },
      });
      if (existing) throw new ConflictError('Présence déjà enregistrée aujourd\'hui');

      const presence = repo.create({
        sessionId,
        participantId: req.userId!,
        statut: StatutPresence.PRESENT,
        present: true,
        methode: MethodePresence.QR_CODE,
        datePresence: new Date(today) as any,
        scanneLe: new Date(),
        qrToken,
        ipAddress: req.ip,
      });
      await repo.save(presence);

      logger.info(`✅ Présence QR : user=${req.userId} session=${session.codeSession}`);
      return successResponse(res, presence, 'Présence enregistrée', 201);
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 📋 MES PRÉSENCES (participant)
  // ==========================================================================
  /** GET /api/participant/presences */
  static async mesPresences(req: Request, res: Response, next: NextFunction) {
    try {
      const presences = await AppDataSource.getRepository(Presence).find({
        where: { participantId: req.userId! },
        relations: ['session', 'session.formation'],
        order: { datePresence: 'DESC' },
      });
      return successResponse(res, presences, 'Mes présences');
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 🖊️ SAISIE MANUELLE (formateur / staff)
  // ==========================================================================
  /** POST /api/presences/manuelle */
  static async marquerManuel(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, participantId, present, commentaire } = req.body;
      if (!sessionId || !participantId) {
        throw new BadRequestError('sessionId et participantId requis');
      }

      const session = await AppDataSource.getRepository(Session).findOne({
        where: { id: sessionId },
      });
      if (!session) throw new NotFoundError('Session introuvable');
      if (session.formateurId !== req.userId) {
        throw new ForbiddenError('Seul le formateur peut saisir manuellement');
      }

      const today = new Date().toISOString().split('T')[0];
      const repo = AppDataSource.getRepository(Presence);

      let presence = await repo.findOne({
        where: {
          sessionId,
          participantId,
          datePresence: new Date(today) as any,
        },
      });

      if (presence) {
        presence.present = !!present;
        presence.statut = present ? StatutPresence.PRESENT : StatutPresence.ABSENT;
        if (commentaire !== undefined) presence.commentaire = commentaire;
      } else {
        presence = repo.create({
          sessionId,
          participantId,
          statut: present ? StatutPresence.PRESENT : StatutPresence.ABSENT,
          present: !!present,
          methode: MethodePresence.MANUEL,
          datePresence: new Date(today) as any,
          commentaire,
        });
      }
      await repo.save(presence);

      return successResponse(res, presence, 'Présence enregistrée');
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 📋 PAR SESSION (formateur / staff)
  // ==========================================================================
  /** GET /api/presences/session/:sessionId */
  static async findBySession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

      const [data, total] = await AppDataSource.getRepository(Presence).findAndCount({
        where: { sessionId },
        relations: ['participant', 'participant.role'],
        order: { scanneLe: 'ASC' },
        skip,
        take: limit,
      });

      return paginatedResponse(res, data, total, page, limit, 'Présences de la session');
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 📊 STATS
  // ==========================================================================
  /** GET /api/presences/stats/:sessionId */
  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const repo = AppDataSource.getRepository(Presence);

      const [total, presents, absents, retards] = await Promise.all([
        repo.count({ where: { sessionId } }),
        repo.count({ where: { sessionId, present: true } }),
        repo.count({ where: { sessionId, present: false } }),
        repo.count({ where: { sessionId, statut: StatutPresence.RETARD } }),
      ]);

      const tauxPresence = total > 0
        ? Math.round((presents / total) * 10000) / 100
        : 0;

      return successResponse(res, {
        total,
        presents,
        absents,
        retards,
        tauxPresence,
      }, 'Statistiques de présence');
    } catch (e) { next(e); }
  }

  /** GET /api/presences/taux/:sessionId/:participantId */
  static async tauxPresence(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, participantId } = req.params;
      const repo = AppDataSource.getRepository(Presence);

      const total = await repo.count({ where: { sessionId } });
      if (total === 0) return successResponse(res, { taux: 0 });

      const presents = await repo.count({
        where: { sessionId, participantId, present: true },
      });

      const taux = Math.round((presents / total) * 10000) / 100;
      return successResponse(res, { taux });
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 📱 GÉNÉRATION QR (formateur)
  // ==========================================================================
  /** POST /api/presences/qr/generer */
  static async generateQr(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.body;
      if (!sessionId) throw new BadRequestError('sessionId requis');

      const repo = AppDataSource.getRepository(Session);
      const session = await repo.findOne({ where: { id: sessionId } });
      if (!session) throw new NotFoundError('Session introuvable');
      if (session.formateurId !== req.userId) {
        throw new ForbiddenError('Seul le formateur peut générer le QR');
      }
      if (!session.presenceOuverte) {
        throw new ForbiddenError('Ouvrez d\'abord la présence');
      }

      const token = crypto.randomBytes(16).toString('hex');
      session.qrCodeSecret = token;
      await repo.save(session);

      return successResponse(res, {
        sessionId: session.id,
        qrToken: token,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        url: `${process.env.APP_URL}/presence/${session.codeSession}?t=${token}`,
      }, 'QR code généré');
    } catch (e) { next(e); }
  }
}