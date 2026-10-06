// src/controllers/RessourceController.ts
import { Request, Response, NextFunction } from 'express';
import { ressourceService } from '../services/ressource.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError, ForbiddenError } from '../errors/AppError';
import { RoleName } from '../entities/enums';
import { logger } from '../config/logger';

export class RessourceController {
  // ==========================================================================
  // 📋 LECTURE
  // ==========================================================================

  /**
   * GET /api/.../ressources/session/:sessionId
   * Liste les ressources d'une session.
   * - Formateur / Staff / Admin → voit toutes les ressources
   * - Participant → voit uniquement celles `visibleParticipants = true`
   */
  static async findBySession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      if (!sessionId) throw new BadRequestError('sessionId requis');

      const isParticipant = req.userRole === RoleName.PARTICIPANT;
      const data = await ressourceService.findBySession(sessionId, isParticipant);

      return successResponse(res, data, 'Ressources de la session');
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/.../ressources/:id
   * Détail d'une ressource.
   */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const ressource = await ressourceService.findById(req.params.id);

      // Participant : interdiction d'accéder aux ressources masquées
      if (
        req.userRole === RoleName.PARTICIPANT &&
        !ressource.visibleParticipants
      ) {
        throw new ForbiddenError('Ressource non accessible');
      }

      return successResponse(res, ressource, 'Ressource récupérée');
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/.../ressources
   * Liste paginée (staff / admin) avec filtres.
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await ressourceService.findAll({
        sessionId: req.query.sessionId as string,
        type: req.query.type as string,
        visibleParticipants:
          req.query.visibleParticipants === 'true'
            ? true
            : req.query.visibleParticipants === 'false'
              ? false
              : undefined,
        q: req.query.q as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });

      return paginatedResponse(
        res,
        r.data,
        r.total,
        r.page,
        r.limit,
        'Liste des ressources',
      );
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // ✍️ ÉCRITURE
  // ==========================================================================

  /**
   * POST /api/.../ressources
   * Crée une ressource (upload fichier en amont via multer).
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, titre, type } = req.body;
      if (!titre) throw new BadRequestError('Le titre est requis');
      if (!type) throw new BadRequestError('Le type est requis');

      // Fichier uploadé → URL automatique
      let fichierUrl = req.body.fichierUrl;
      let fichierNom = req.body.fichierNom;
      let fichierTaille = req.body.fichierTaille;

      if (req.file) {
        fichierUrl = `/uploads/ressources/${req.file.filename}`;
        fichierNom = req.file.originalname;
        fichierTaille = req.file.size;
      }

      if (!fichierUrl) throw new BadRequestError('Un fichier ou une URL est requis');

      const ressource = await ressourceService.create(
        {
          ...req.body,
          sessionId,
          fichierUrl,
          fichierNom,
          fichierTaille,
        },
        req.userId!,
      );

      logger.info(`📎 Ressource créée : ${ressource.titre}`);
      return successResponse(res, ressource, 'Ressource créée', 201);
    } catch (e) {
      next(e);
    }
  }

  /**
   * PUT /api/.../ressources/:id
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const ressource = await ressourceService.update(req.params.id, req.body);
      logger.info(`📝 Ressource mise à jour : ${ressource.titre}`);
      return successResponse(res, ressource, 'Ressource mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /**
   * PUT /api/.../ressources/:id/visibilite
   * Bascule la visibilité aux participants.
   */
  static async toggleVisibilite(req: Request, res: Response, next: NextFunction) {
    try {
      const visible = !!req.body.visibleParticipants;
      const ressource = await ressourceService.toggleVisibilite(req.params.id, visible);

      logger.info(
        `${visible ? '👁️' : '🙈'} Ressource ${visible ? 'visible' : 'masquée'} : ${ressource.titre}`,
      );

      return successResponse(
        res,
        ressource,
        visible ? 'Ressource visible aux participants' : 'Ressource masquée',
      );
    } catch (e) {
      next(e);
    }
  }

  /**
   * PUT /api/.../ressources/reorder
   * Réordonne les ressources d'une session.
   * Body : { sessionId, ordre: [{ id, ordreAffichage }] }
   */
  static async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, ordre } = req.body;
      if (!sessionId || !Array.isArray(ordre)) {
        throw new BadRequestError('sessionId et ordre requis');
      }

      await ressourceService.reorder(sessionId, ordre);
      logger.info(`🔀 Ressources réordonnées (session=${sessionId})`);

      return successResponse(res, null, 'Ordre mis à jour');
    } catch (e) {
      next(e);
    }
  }

  /**
   * DELETE /api/.../ressources/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ressourceService.delete(req.params.id);
      logger.info(`🗑️ Ressource supprimée : ${req.params.id}`);
      return successResponse(res, null, 'Ressource supprimée');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // 📥 TÉLÉCHARGEMENT (participant)
  // ==========================================================================

  /**
   * POST /api/participant/ressources/:id/telecharger
   * Incrémente le compteur et renvoie les infos de la ressource.
   */
  static async telecharger(req: Request, res: Response, next: NextFunction) {
    try {
      const ressource = await ressourceService.incrementerTelechargement(req.params.id);
      return successResponse(res, ressource, 'Téléchargement enregistré');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // 📊 STATISTIQUES
  // ==========================================================================

  /**
   * GET /api/.../ressources/stats/session/:sessionId
   * Nombre de ressources, répartition par type, total téléchargements.
   */
  static async statsBySession(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ressourceService.statsBySession(req.params.sessionId);
      return successResponse(res, stats, 'Statistiques des ressources');
    } catch (e) {
      next(e);
    }
  }
}