// src/controllers/SessionController.ts
import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { StatutSession, ModaliteSession } from '../entities/enums';
import {
  successResponse,
  paginatedResponse,
} from '../utils/response.util';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/AppError';
import { logger } from '../config/logger';

/* ============================================================================
   CONSTANTES & HELPERS
   ============================================================================ */

const VALID_STATUTS = Object.values(StatutSession);
const VALID_MODALITES = Object.values(ModaliteSession);

function validateStatut(statut: unknown): asserts statut is StatutSession {
  if (!statut || !VALID_STATUTS.includes(statut as StatutSession)) {
    throw new BadRequestError(
      `Statut invalide. Valeurs acceptées : ${VALID_STATUTS.join(', ')}`,
    );
  }
}

function validateModalite(
  modalite: unknown,
): asserts modalite is ModaliteSession {
  if (
    modalite !== undefined &&
    modalite !== '' &&
    !VALID_MODALITES.includes(modalite as ModaliteSession)
  ) {
    throw new BadRequestError(
      `Modalité invalide. Valeurs acceptées : ${VALID_MODALITES.join(', ')}`,
    );
  }
}

function validateDates(dateDebut: unknown, dateFin: unknown): void {
  if (!dateDebut || !dateFin) {
    throw new BadRequestError('dateDebut et dateFin sont requis');
  }

  const debut = new Date(dateDebut as string);
  const fin = new Date(dateFin as string);

  if (isNaN(debut.getTime())) {
    throw new BadRequestError('dateDebut invalide');
  }
  if (isNaN(fin.getTime())) {
    throw new BadRequestError('dateFin invalide');
  }
  if (fin <= debut) {
    throw new BadRequestError(
      'dateFin doit être postérieure à dateDebut',
    );
  }
}

function getUserId(req: Request): string {
  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) throw new BadRequestError('Utilisateur non authentifié');
  return userId;
}

/* ============================================================================
   TYPES
   ============================================================================ */

interface SessionQuery {
  page?: string;
  limit?: string;
  q?: string;
  statut?: StatutSession;
  modalite?: ModaliteSession;
  formationId?: string;
  formateurId?: string;
  dateDebut?: string;
  dateFin?: string;
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class SessionController {
  /* ==========================================================================
     🌐 PUBLIC — Liste des sessions
     ========================================================================== */
  static async listPublic(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query: SessionQuery = {
        page: req.query.page as string,
        limit: req.query.limit as string,
        q: req.query.q as string,
        statut: req.query.statut as StatutSession,
        modalite: req.query.modalite as ModaliteSession,
        formationId: req.query.formationId as string,
      };

      const result = await SessionService.findAllPublic(query);

      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
        'Sessions ouvertes',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🌐 PUBLIC — Détail par code
     ========================================================================== */
  static async detailPublic(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = await SessionService.findByCodePublic(
        req.params.codeSession,
      );

      if (!session) {
        throw new NotFoundError(
          `Session "${req.params.codeSession}" introuvable`,
        );
      }

      return successResponse(res, session);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Création
     ========================================================================== */
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { formationId, dateDebut, dateFin, modalite } = req.body;

      if (!formationId) {
        throw new BadRequestError('formationId est requis');
      }

      validateDates(dateDebut, dateFin);
      validateModalite(modalite);

      const session = await SessionService.create(req.body);

      return successResponse(res, session, 'Session créée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Liste paginée
     ========================================================================== */
  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query: SessionQuery = {
        page: req.query.page as string,
        limit: req.query.limit as string,
        q: req.query.q as string,
        statut: req.query.statut as StatutSession,
        modalite: req.query.modalite as ModaliteSession,
        formationId: req.query.formationId as string,
        formateurId: req.query.formateurId as string,
        dateDebut: req.query.dateDebut as string,
        dateFin: req.query.dateFin as string,
      };

      const result = await SessionService.findAll(query);

      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐⭐⭐ STAFF / ADMIN — Statistiques globales
     ⚠️ Route : GET /api/admin/sessions/stats
     ⚠️ DOIT ÊTRE DÉCLARÉE AVANT /:id dans les routes
     ========================================================================== */
  static async getStats(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await SessionService.getStats();
      return successResponse(res, stats, 'Statistiques des sessions');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Détail par ID
     ========================================================================== */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = await SessionService.findById(req.params.id);

      if (!session) {
        throw new NotFoundError('Session introuvable');
      }

      return successResponse(res, session);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐⭐⭐ STAFF / ADMIN — Inscriptions d'une session
     ⚠️ Route : GET /api/admin/sessions/:id/inscriptions
     ⚠️ DOIT ÊTRE DÉCLARÉE AVANT /:id dans les routes
     ========================================================================== */
  static async getInscriptions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionId = req.params.id;

      // ⭐ Vérifier que la session existe
      const exists = await SessionService.exists(sessionId);
      if (!exists) {
        throw new NotFoundError('Session introuvable');
      }

      const inscriptions = await SessionService.getInscriptions(sessionId);

      return successResponse(
        res,
        inscriptions,
        'Inscriptions de la session',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐⭐⭐ STAFF / ADMIN — Présences d'une session
     ⚠️ Route : GET /api/admin/sessions/:id/presences
     ⚠️ DOIT ÊTRE DÉCLARÉE AVANT /:id dans les routes
     ========================================================================== */
  static async getPresences(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionId = req.params.id;

      // ⭐ Vérifier que la session existe
      const exists = await SessionService.exists(sessionId);
      if (!exists) {
        throw new NotFoundError('Session introuvable');
      }

      const presences = await SessionService.getPresences(sessionId);

      return successResponse(res, presences, 'Présences de la session');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Mise à jour
     ========================================================================== */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validation modalité si présente
      if (req.body.modalite !== undefined) {
        validateModalite(req.body.modalite);
      }

      // Validation dates si présentes
      if (req.body.dateDebut && req.body.dateFin) {
        validateDates(req.body.dateDebut, req.body.dateFin);
      }

      const session = await SessionService.update(
        req.params.id,
        req.body,
      );

      return successResponse(res, session, 'Session mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Changer le statut
     ========================================================================== */
  static async changerStatut(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { statut } = req.body;

      validateStatut(statut);

      const session = await SessionService.changerStatut(
        req.params.id,
        statut,
      );

      return successResponse(res, session, 'Statut modifié');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Publier / Dépublier
     ========================================================================== */
  static async publier(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const estPubliee =
        typeof req.body.estPubliee === 'boolean'
          ? req.body.estPubliee
          : true;

      const session = await SessionService.togglePublication(
        req.params.id,
        estPubliee,
      );

      return successResponse(
        res,
        session,
        estPubliee ? 'Session publiée' : 'Session dépubliée',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Ouvrir / Fermer présence
     ========================================================================== */
  static async ouvrirPresence(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const ouverte = req.body.ouverte !== false;

      const session = await SessionService.ouvrirPresence(
        req.params.id,
        ouverte,
      );

      return successResponse(
        res,
        session,
        ouverte ? 'Présence ouverte' : 'Présence fermée',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Suppression
     ========================================================================== */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await SessionService.delete(req.params.id);
      return successResponse(res, null, 'Session supprimée');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Dupliquer une session
     ========================================================================== */
  static async dupliquer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = await SessionService.dupliquer(req.params.id);
      return successResponse(res, session, 'Session dupliquée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 FORMATEUR — Mes sessions
     ========================================================================== */
  static async mesSessions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const data = await SessionService.findMesSessions(userId);
      return successResponse(res, data, 'Mes sessions');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 FORMATEUR / STAFF — Participants d'une session
     ========================================================================== */
  static async participants(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await SessionService.getParticipants(req.params.id);
      return successResponse(res, data, 'Participants');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STATISTIQUES — Détail d'une session
     ========================================================================== */
  static async statistiques(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await SessionService.getStatistiques(req.params.id);
      return successResponse(res, stats, 'Statistiques');
    } catch (e) {
      next(e);
    }
  }
}