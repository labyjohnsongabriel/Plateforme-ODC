// src/controllers/SessionController.ts
import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { StatutSession, ModaliteSession } from '../entities/enums';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError, NotFoundError } from '../errors/AppError';

/* ============================================================================
   HELPERS
   ============================================================================ */

const VALID_STATUTS = Object.values(StatutSession);

function validateStatut(statut: unknown): asserts statut is StatutSession {
  if (!statut || !VALID_STATUTS.includes(statut as StatutSession)) {
    throw new BadRequestError(
      `Statut invalide. Valeurs acceptées : ${VALID_STATUTS.join(', ')}`,
    );
  }
}

function validateModalite(modalite: unknown): asserts modalite is ModaliteSession {
  if (
    modalite !== undefined &&
    !Object.values(ModaliteSession).includes(modalite as ModaliteSession)
  ) {
    throw new BadRequestError('Modalité invalide');
  }
}

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
     🌐 PUBLIC
     ========================================================================== */

  /**
   * GET /api/public/sessions
   * Liste publique des sessions ouvertes.
   */
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

  /**
   * GET /api/public/sessions/:codeSession
   * Détail public par code session.
   */
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
     🔒 STAFF / ADMIN
     ========================================================================== */

  /**
   * POST /api/sessions
   * Créer une session.
   */
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { formationId, dateDebut, dateFin } = req.body;

      if (!formationId) {
        throw new BadRequestError('formationId est requis');
      }
      if (!dateDebut || !dateFin) {
        throw new BadRequestError('dateDebut et dateFin sont requis');
      }

      // Validation des dates
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);

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

      // Validation modalité si présente
      validateModalite(req.body.modalite);

      const session = await SessionService.create(req.body);

      return successResponse(res, session, 'Session créée', 201);
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/sessions
   * Liste paginée (admin/staff).
   */
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

  /**
   * GET /api/sessions/:id
   * Détail admin/staff par ID.
   */
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

  /**
   * PUT /api/sessions/:id
   * Mise à jour d'une session.
   */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validation modalité si présente
      validateModalite(req.body.modalite);

      // Validation dates si présentes
      if (req.body.dateDebut && req.body.dateFin) {
        const debut = new Date(req.body.dateDebut);
        const fin = new Date(req.body.dateFin);

        if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
          throw new BadRequestError('Dates invalides');
        }
        if (fin <= debut) {
          throw new BadRequestError(
            'dateFin doit être postérieure à dateDebut',
          );
        }
      }

      const session = await SessionService.update(req.params.id, req.body);

      return successResponse(res, session, 'Session mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /**
   * PUT /api/sessions/:id/statut
   * Changer le statut d'une session.
   */
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

  /**
   * PUT /api/sessions/:id/publier
   * Toggle publication.
   */
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

  /**
   * PUT /api/sessions/:id/ouvrir-presence
   * Active/désactive le QR code de présence.
   */
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

  /**
   * DELETE /api/sessions/:id
   * Suppression (soft delete) d'une session.
   */
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

  /**
   * POST /api/sessions/:id/dupliquer
   * Dupliquer une session.
   */
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
     🔒 FORMATEUR
     ========================================================================== */

  /**
   * GET /api/formateur/sessions
   * Sessions animées par le formateur connecté.
   */
  static async mesSessions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // ⭐ CORRECTION : utiliser (req as any).user.sub (défini par authMiddleware)
      const userId = (req as any).user?.sub;

      if (!userId) {
        throw new BadRequestError('Utilisateur non authentifié');
      }

      const data = await SessionService.findMesSessions(userId);

      return successResponse(res, data, 'Mes sessions');
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/formateur/sessions/:id/participants
   * Participants d'une session.
   */
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

  /**
   * GET /api/sessions/:id/statistiques
   * Statistiques d'une session (présences, taux, etc.).
   */
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