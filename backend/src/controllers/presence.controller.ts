// src/controllers/PresenceController.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
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

/* ============================================================================
   HELPERS
   ============================================================================ */

function getUserId(req: Request): string {
  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) throw new BadRequestError('Utilisateur non authentifié');
  return userId;
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class PresenceController {
  /* ==========================================================================
     📷 SCAN QR (participant)
     ========================================================================== */
  static async scannerQr(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { sessionId, qrToken } = req.body;

      if (!sessionId || !qrToken) {
        throw new BadRequestError('sessionId et qrToken requis');
      }

      const session = await AppDataSource.getRepository(Session).findOne({
        where: { id: sessionId },
      });

      if (!session) throw new NotFoundError('Session introuvable');
      if (!(session as any).presenceOuverte) {
        throw new ForbiddenError('Présence fermée');
      }
      if ((session as any).qrCodeSecret !== qrToken) {
        throw new BadRequestError('QR code invalide');
      }

      /* -------------------- Vérifier inscription -------------------- */
      const inscription = await AppDataSource.getRepository(Inscription).findOne({
        where: { sessionId, participantId: userId },
      });

      if (!inscription || inscription.statut !== StatutInscription.ACCEPTEE) {
        throw new ForbiddenError('Vous n\'êtes pas inscrit à cette session');
      }

      /* -------------------- Vérifier doublon -------------------- */
      const today = todayString();
      const repo = AppDataSource.getRepository(Presence);

      // ⭐ Utiliser une comparaison DATE correcte
      const existing = await repo
        .createQueryBuilder('p')
        .where('p.sessionId = :sid', { sid: sessionId })
        .andWhere('p.participantId = :pid', { pid: userId })
        .andWhere('DATE(p.datePresence) = :today', { today })
        .getOne();

      if (existing) {
        throw new ConflictError('Présence déjà enregistrée aujourd\'hui');
      }

      /* -------------------- Créer la présence -------------------- */
      const presence = repo.create({
        sessionId,
        participantId: userId,
        statut: StatutPresence.PRESENT,
        present: true,
        methode: MethodePresence.QR_CODE,
        datePresence: new Date(today),
        scanneLe: new Date(),
        qrToken,
        ipAddress: req.ip ?? null,
      } as any);

      await repo.save(presence);

      logger.info(
        `✅ Présence QR : user=${userId} session=${session.codeSession}`,
      );

      return successResponse(res, presence, 'Présence enregistrée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     📋 MES PRÉSENCES (participant)
     ========================================================================== */
  static async mesPresences(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      const presences = await AppDataSource.getRepository(Presence).find({
        where: { participantId: userId },
        relations: ['session', 'session.formation'],
        order: { datePresence: 'DESC' },
      });

      return successResponse(res, presences, 'Mes présences');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🖊️ SAISIE MANUELLE (formateur / staff)
     ========================================================================== */
  static async marquerManuel(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { sessionId, participantId, present, commentaire } = req.body;

      if (!sessionId || !participantId) {
        throw new BadRequestError('sessionId et participantId requis');
      }

      const session = await AppDataSource.getRepository(Session).findOne({
        where: { id: sessionId },
      });

      if (!session) throw new NotFoundError('Session introuvable');

      // ⭐ formateurId (propriété TS)
      if (session.formateurId !== userId) {
        throw new ForbiddenError(
          'Seul le formateur peut saisir manuellement',
        );
      }

      const today = todayString();
      const repo = AppDataSource.getRepository(Presence);

      let presence = await repo
        .createQueryBuilder('p')
        .where('p.sessionId = :sid', { sid: sessionId })
        .andWhere('p.participantId = :pid', { pid: participantId })
        .andWhere('DATE(p.datePresence) = :today', { today })
        .getOne();

      if (presence) {
        presence.present = !!present;
        presence.statut = present
          ? StatutPresence.PRESENT
          : StatutPresence.ABSENT;
        if (commentaire !== undefined) presence.commentaire = commentaire;
      } else {
        presence = repo.create({
          sessionId,
          participantId,
          statut: present
            ? StatutPresence.PRESENT
            : StatutPresence.ABSENT,
          present: !!present,
          methode: MethodePresence.MANUELLE,
          datePresence: new Date(today),
          commentaire: commentaire ?? null,
        } as any);
      }

      await repo.save(presence);

      return successResponse(res, presence, 'Présence enregistrée');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     📋 PAR SESSION (formateur / staff)
     ========================================================================== */
  static async findBySession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { page, limit, skip } = getPagination(
        req.query.page,
        req.query.limit,
      );

      const [data, total] = await AppDataSource.getRepository(
        Presence,
      ).findAndCount({
        where: { sessionId },
        relations: ['participant', 'participant.role'],
        order: { createdAt: 'ASC' }, // ⭐ propriété TS
        skip,
        take: limit,
      });

      return paginatedResponse(
        res,
        data,
        total,
        page,
        limit,
        'Présences de la session',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     📊 STATS
     ========================================================================== */
  static async stats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      const repo = AppDataSource.getRepository(Presence);

      const [total, presents, absents, retards] = await Promise.all([
        repo.count({ where: { sessionId } }),
        repo.count({ where: { sessionId, present: true } }),
        repo.count({ where: { sessionId, present: false } }),
        repo.count({
          where: { sessionId, statut: StatutPresence.RETARD },
        }),
      ]);

      const tauxPresence =
        total > 0 ? Math.round((presents / total) * 10000) / 100 : 0;

      return successResponse(
        res,
        { total, presents, absents, retards, tauxPresence },
        'Statistiques de présence',
      );
    } catch (e) {
      next(e);
    }
  }

  static async tauxPresence(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     📱 GÉNÉRATION QR (formateur)
     ========================================================================== */
  static async generateQr(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { sessionId } = req.body;

      if (!sessionId) throw new BadRequestError('sessionId requis');

      const repo = AppDataSource.getRepository(Session);

      const session = await repo.findOne({ where: { id: sessionId } });
      if (!session) throw new NotFoundError('Session introuvable');

      if (session.formateurId !== userId) {
        throw new ForbiddenError(
          'Seul le formateur peut générer le QR',
        );
      }

      if (!(session as any).presenceOuverte) {
        throw new ForbiddenError('Ouvrez d\'abord la présence');
      }

      const token = crypto.randomBytes(16).toString('hex');
      (session as any).qrCodeSecret = token;

      await repo.save(session);

      return successResponse(
        res,
        {
          sessionId: session.id,
          qrToken: token,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          url: `${process.env.APP_URL ?? 'http://localhost:3000'}/presence/${
            session.codeSession
          }?t=${token}`,
        },
        'QR code généré',
      );
    } catch (e) {
      next(e);
    }
  }
}