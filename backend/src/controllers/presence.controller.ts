// src/controllers/presence.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Session } from '../entities/Session.entity';
import { Inscription } from '../entities/Inscription.entity';
import {
  RoleName,
  StatutInscription,
  StatutPresence,
} from '../entities/enums';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../errors/AppError';
import { PresenceService } from '../services/presence.service';
import { logger } from '../config/logger';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function getUserId(req: Request): string {
  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) throw new BadRequestError('Utilisateur non authentifié');
  return userId;
}

function getUserRole(req: Request): RoleName {
  const role = (req as any).userRole ?? (req as any).user?.role?.nom;
  if (!role) throw new ForbiddenError('Rôle utilisateur introuvable');
  return role;
}

function validateUuid(value: string, field: string): void {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new BadRequestError(`${field} doit être un UUID valide`);
  }
}

function canManageSession(req: Request, session: Session): boolean {
  const role = getUserRole(req);
  if (role === RoleName.ADMINISTRATEUR || role === RoleName.STAFF_ODC) {
    return true;
  }
  return role === RoleName.FORMATEUR && session.formateurId === getUserId(req);
}

async function getSessionOrFail(sessionId: string): Promise<Session> {
  const session = await AppDataSource.getRepository(Session).findOne({
    where: { id: sessionId },
  });
  if (!session) throw new NotFoundError('Session introuvable');
  return session;
}

function isValidQrTokenStructure(token: string): boolean {
  if (typeof token !== 'string') return false;
  if (token.length < 100) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  return parts.every((p) => p.length > 0);
}

function logControllerError(
  method: string,
  req: Request,
  error: unknown,
): void {
  const err = error as {
    message?: string;
    name?: string;
    statusCode?: number;
    code?: string;
    stack?: string;
  };

  logger.error(`[PRESENCE CONTROLLER] ${method} failed`, {
    message: err?.message ?? String(error),
    name: err?.name,
    statusCode: err?.statusCode,
    code: err?.code,
    path: req.originalUrl,
    method: req.method,
    userId: (req as any).user?.sub ?? (req as any).userId,
    bodyKeys: Object.keys(req.body ?? {}),
    params: req.params,
    stack: err?.stack?.split('\n').slice(0, 5),
  });
}

/** Ajoute `present` à une présence (getter non sérialisé). */
function withPresent<T extends { statut: StatutPresence }>(p: T) {
  return {
    ...p,
    present:
      p.statut === StatutPresence.PRESENT || p.statut === StatutPresence.RETARD,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROLLER
   ═══════════════════════════════════════════════════════════════════════════ */

export class PresenceController {
  /* ══════════════════════════════════════════════════════════════════════════
     📷 SCAN QR
     ══════════════════════════════════════════════════════════════════════════ */
  static async scannerQr(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { sessionId, qrToken } = (req.body ?? {}) as {
        sessionId?: string;
        qrToken?: string;
      };

      if (!sessionId) throw new BadRequestError('sessionId requis');
      validateUuid(sessionId, 'sessionId');

      if (!qrToken) throw new BadRequestError('qrToken requis');
      if (!isValidQrTokenStructure(qrToken)) {
        throw new BadRequestError(
          'qrToken invalide — format attendu : header.payload.signature',
        );
      }

      const presence = await PresenceService.scannerQr(
        userId,
        sessionId,
        qrToken,
        req.ip,
      );

      logger.info('[SCANNER] ✅ Présence enregistrée', {
        userId,
        sessionId,
        presenceId: presence.id,
        statut: presence.statut,
      });

      successResponse(res, withPresent(presence), 'Présence enregistrée', 201);
    } catch (e) {
      logControllerError('scannerQr', req, e);
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     📋 MES PRÉSENCES
     ══════════════════════════════════════════════════════════════════════════ */
  static async mesPresences(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const presences = await PresenceService.mesPresences(userId);
      successResponse(res, presences.map(withPresent), 'Mes présences');
    } catch (e) {
      logControllerError('mesPresences', req, e);
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     🖊️ SAISIE MANUELLE
     ══════════════════════════════════════════════════════════════════════════ */
  static async marquerManuel(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId, participantId, present, commentaire } =
        (req.body ?? {}) as {
          sessionId?: string;
          participantId?: string;
          present?: boolean;
          commentaire?: string;
        };

      if (!sessionId) throw new BadRequestError('sessionId requis');
      if (!participantId) throw new BadRequestError('participantId requis');
      validateUuid(sessionId, 'sessionId');
      validateUuid(participantId, 'participantId');

      if (typeof present !== 'boolean') {
        throw new BadRequestError('Le statut de présence doit être un booléen');
      }

      const presence = await PresenceService.marquerManuel(
        sessionId,
        participantId,
        present,
        commentaire,
        getUserId(req),
        getUserRole(req),
      );

      // ✅ withPresent crée un nouvel objet, sans toucher au getter
      successResponse(res, withPresent(presence), 'Présence enregistrée');
    } catch (e) {
      logControllerError('marquerManuel', req, e);
      next(e);
    }
  }
  /* ══════════════════════════════════════════════════════════════════════════
     📱 GÉNÉRATION QR
     ══════════════════════════════════════════════════════════════════════════ */
  static async generateQr(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId, dureeMinutes } = (req.body ?? {}) as {
        sessionId?: string;
        dureeMinutes?: number;
      };

      if (!sessionId) throw new BadRequestError('sessionId requis');
      validateUuid(sessionId, 'sessionId');

      if (
        dureeMinutes !== undefined &&
        (typeof dureeMinutes !== 'number' ||
          dureeMinutes < 1 ||
          dureeMinutes > 60)
      ) {
        throw new BadRequestError(
          'dureeMinutes doit être un nombre entre 1 et 60',
        );
      }

      const data = await PresenceService.generateQr(
        sessionId,
        getUserId(req),
        getUserRole(req),
        dureeMinutes,
      );

      logger.info('[QR GENERATE] ✅', {
        sessionId,
        expiresAt: data.expiresAt.toISOString(),
        tokenLength: data.qrToken.length,
      });

      successResponse(res, data, 'QR code généré', 201);
    } catch (e) {
      logControllerError('generateQr', req, e);
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     🔓 OUVRIR / FERMER
     ══════════════════════════════════════════════════════════════════════════ */
  static async ouvrirPresences(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      validateUuid(sessionId, 'sessionId');

      await PresenceService.ouvrirPresences(
        sessionId,
        getUserId(req),
        getUserRole(req),
      );

      successResponse(
        res,
        { sessionId, presenceOuverte: true },
        'Présences ouvertes',
      );
    } catch (e) {
      logControllerError('ouvrirPresences', req, e);
      next(e);
    }
  }

  static async fermerPresences(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      validateUuid(sessionId, 'sessionId');

      await PresenceService.fermerPresences(
        sessionId,
        getUserId(req),
        getUserRole(req),
      );

      successResponse(
        res,
        { sessionId, presenceOuverte: false },
        'Présences fermées',
      );
    } catch (e) {
      logControllerError('fermerPresences', req, e);
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     📋 CONSULTATION PAR SESSION
     ══════════════════════════════════════════════════════════════════════════ */
  static async findBySession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      validateUuid(sessionId, 'sessionId');

      const session = await getSessionOrFail(sessionId);
      if (!canManageSession(req, session)) {
        throw new ForbiddenError(
          'Vous ne pouvez pas consulter les présences de cette session',
        );
      }

      const { page, limit } = getPagination(
        req.query.page as string | undefined,
        req.query.limit as string | undefined,
      );

      const { data, pagination } = await PresenceService.findBySession(
        sessionId,
        page,
        limit,
      );

      paginatedResponse(
        res,
        data.map(withPresent),
        pagination.total,
        pagination.page,
        pagination.limit,
        'Présences de la session',
      );
    } catch (e) {
      logControllerError('findBySession', req, e);
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     📊 STATS
     ══════════════════════════════════════════════════════════════════════════ */
  static async stats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      validateUuid(sessionId, 'sessionId');

      const session = await getSessionOrFail(sessionId);
      if (!canManageSession(req, session)) {
        throw new ForbiddenError(
          'Vous ne pouvez pas consulter les statistiques de cette session',
        );
      }

      const stats = await PresenceService.stats(sessionId);

      const totalInscrits = await AppDataSource.getRepository(
        Inscription,
      ).count({
        where: { sessionId, statut: StatutInscription.ACCEPTEE },
      });

      successResponse(
        res,
        { totalInscrits, ...stats },
        'Statistiques de présence',
      );
    } catch (e) {
      logControllerError('stats', req, e);
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     📊 TAUX PRÉSENCE
     ══════════════════════════════════════════════════════════════════════════ */
  static async tauxPresence(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId, participantId } = req.params;
      validateUuid(sessionId, 'sessionId');
      validateUuid(participantId, 'participantId');

      const session = await getSessionOrFail(sessionId);
      if (!canManageSession(req, session)) {
        throw new ForbiddenError(
          'Vous ne pouvez consulter que le taux de présence de vos sessions',
        );
      }

      const taux = await PresenceService.tauxPresence(sessionId, participantId);

      successResponse(res, { taux });
    } catch (e) {
      logControllerError('tauxPresence', req, e);
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     📋 DÉTAIL PRÉSENCE PARTICIPANT (participant connecté)
     ══════════════════════════════════════════════════════════════════════════ */
  static async getParticipantPresenceDetail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const participantId = getUserId(req);
      const { sessionId } = req.params;

      validateUuid(sessionId, 'sessionId');

      /* 1. Session */
      const sessionRows = await AppDataSource.query(
        `SELECT
           s.id,
           s.code_session AS "codeSession",
           s.date_debut AS "dateDebut",
           s.date_fin AS "dateFin",
           s.lieu,
           s.capacite,
           s.statut,
           s.presence_ouverte AS "presenceOuverte",
           f.id AS "formationId",
           f.titre AS "formationTitre",
           f.description AS "formationDescription",
           form.id AS "formateurId",
           form.prenom AS "formateurPrenom",
           form.nom AS "formateurNom",
           form.email AS "formateurEmail"
         FROM sessions s
         LEFT JOIN formations f ON f.id = s.formation_id
         LEFT JOIN users form ON form.id = s.formateur_id
         WHERE s.id = $1 AND s.deleted_at IS NULL`,
        [sessionId],
      );

      const sessionRow = sessionRows[0];
      if (!sessionRow) throw new NotFoundError('Session introuvable');

      /* 2. Inscription */
      const inscriptionRows = await AppDataSource.query(
        `SELECT id, statut
         FROM inscriptions
         WHERE session_id = $1 AND participant_id = $2`,
        [sessionId, participantId],
      );
      const inscription = inscriptionRows[0] ?? null;

      /* 3. Présence */
      const presenceRows = await AppDataSource.query(
        `SELECT
           id,
           statut,
           methode,
           date_presence AS "datePresence",
           scanne_le AS "scanneLe",
           heure_scan AS "heureScan"
         FROM presences
         WHERE session_id = $1 AND participant_id = $2
         ORDER BY created_at DESC
         LIMIT 1`,
        [sessionId, participantId],
      );

      const presence = presenceRows[0] ?? null;

      /* 4. Réponse structurée */
      const response = {
        session: {
          id: sessionRow.id,
          codeSession: sessionRow.codeSession,
          dateDebut: sessionRow.dateDebut,
          dateFin: sessionRow.dateFin,
          lieu: sessionRow.lieu,
          capacite: sessionRow.capacite,
          statut: sessionRow.statut,
          presenceOuverte: sessionRow.presenceOuverte,
          formation: sessionRow.formationId
            ? {
                id: sessionRow.formationId,
                titre: sessionRow.formationTitre,
                description: sessionRow.formationDescription,
              }
            : null,
          formateur: sessionRow.formateurId
            ? {
                id: sessionRow.formateurId,
                prenom: sessionRow.formateurPrenom,
                nom: sessionRow.formateurNom,
                email: sessionRow.formateurEmail,
              }
            : null,
        },
        presence: presence
          ? {
              ...presence,
              present:
                presence.statut === StatutPresence.PRESENT ||
                presence.statut === StatutPresence.RETARD,
            }
          : null,
        inscription,
      };

      successResponse(res, response, 'Détail de la présence');
    } catch (e) {
      logControllerError('getParticipantPresenceDetail', req, e);
      next(e);
    }
  }
}