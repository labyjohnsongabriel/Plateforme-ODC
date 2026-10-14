// src/controllers/formation.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Formation } from '../entities/Formation.entity';
import { Session } from '../entities/Session.entity';
import { Inscription } from '../entities/Inscription.entity';
import { FormationService } from '../services/formation.service';
import {
  successResponse,
  paginatedResponse,
} from '../utils/response.util';
import {
  BadRequestError,
  NotFoundError,
} from '../errors/AppError';
import { slugify } from '../utils/string.util';
import { logger } from '../config/logger';

/* ============================================================================
   REPOSITORIES
   ============================================================================ */

const sessionRepo = () => AppDataSource.getRepository(Session);
const inscriptionRepo = () => AppDataSource.getRepository(Inscription);
const formationRepo = () => AppDataSource.getRepository(Formation);

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class FormationController {
  /* ==========================================================================
     🌐 PUBLIC — Liste des formations publiées
     ========================================================================== */
  static async listPublic(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await FormationService.findAllPublic(req.query);

      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
        'Catalogue public',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🌐 PUBLIC — Détail par slug
     ========================================================================== */
  static async detailPublic(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const formation = await FormationService.findBySlugPublic(
        req.params.slug,
      );
      return successResponse(res, formation);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🌐 PUBLIC — Top formations
     ========================================================================== */
  static async topPublic(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await FormationService.getTopPublic(6);
      return successResponse(res, data);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Créer une formation
     ========================================================================== */
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { titre } = req.body;

      if (!titre || typeof titre !== 'string') {
        throw new BadRequestError('Le titre est requis');
      }

      const slug = req.body.slug || slugify(titre);

      const formation = await FormationService.create({
        ...req.body,
        slug,
      });

      logger.info(`✅ Formation créée : ${formation.titre}`);

      return successResponse(res, formation, 'Formation créée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Liste paginée avec compteurs
     ========================================================================== */
  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await FormationService.findAll(req.query);

      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
        'Liste des formations',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐⭐ ADMIN — Sessions liées à une formation
     GET /api/admin/formations/:id/sessions
     ========================================================================== */
  static async getSessions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const formationId = req.params.id;

      const formationExists = await formationRepo().count({
        where: { id: formationId },
      });

      if (formationExists === 0) {
        throw new NotFoundError('Formation introuvable');
      }

      const sessions = await sessionRepo()
        .createQueryBuilder('s')
        .leftJoinAndSelect('s.formateur', 'u')
        .loadRelationCountAndMap(
          's.inscriptionsCount',
          's.inscriptions',
        )
        .where('s.formationId = :formationId', { formationId })
        .andWhere('s.deletedAt IS NULL')
        .orderBy('s.dateDebut', 'DESC')
        .getMany();

      const normalized = sessions.map((s) => ({
        id: s.id,
        codeSession: s.codeSession,
        titre: s.titre,
        statut: s.statut,
        dateDebut: s.dateDebut,
        dateFin: s.dateFin,
        lieu: s.lieu,
        lienVisio: s.lienVisio,
        capacite: s.capacite,
        estPubliee: s.estPubliee,
        presenceOuverte: s.presenceOuverte,
        inscriptionsCount: Number(
          (s as any).inscriptionsCount ?? 0,
        ),
        formateur: s.formateur
          ? {
              id: s.formateur.id,
              nom: s.formateur.nom,
              prenom: s.formateur.prenom,
              email: s.formateur.email,
            }
          : null,
      }));

      return successResponse(res, normalized, 'Sessions de la formation');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐⭐ ADMIN — Inscriptions liées à une formation
     GET /api/admin/formations/:id/inscriptions
     ========================================================================== */
  static async getInscriptions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const formationId = req.params.id;

      const formationExists = await formationRepo().count({
        where: { id: formationId },
      });

      if (formationExists === 0) {
        throw new NotFoundError('Formation introuvable');
      }

      const inscriptions = await inscriptionRepo()
        .createQueryBuilder('i')
        .leftJoinAndSelect('i.participant', 'p')
        .leftJoinAndSelect('i.session', 's')
        .where('s.formationId = :formationId', { formationId })
        .andWhere('i.deletedAt IS NULL')
        .orderBy('i.createdAt', 'DESC')
        .getMany();

      const normalized = inscriptions.map((i) => ({
        id: i.id,
        statut: i.statut,
        motivation: i.motivation,
        motifRefus: i.motifRefus,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        participant: i.participant
          ? {
              id: i.participant.id,
              nom: i.participant.nom,
              prenom: i.participant.prenom,
              email: i.participant.email,
              telephone: i.participant.telephone,
              photoUrl: i.participant.photoUrl,
            }
          : null,
        session: i.session
          ? {
              id: i.session.id,
              codeSession: i.session.codeSession,
              dateDebut: i.session.dateDebut,
              dateFin: i.session.dateFin,
            }
          : null,
      }));

      return successResponse(
        res,
        normalized,
        'Inscriptions à cette formation',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Détail par ID
     ========================================================================== */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const formation = await FormationService.findById(req.params.id);

      if (!formation) {
        throw new NotFoundError('Formation introuvable');
      }

      return successResponse(res, formation);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Mettre à jour
     ========================================================================== */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const formation = await FormationService.update(
        req.params.id,
        req.body,
      );
      return successResponse(res, formation, 'Formation mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Publier / Dépublier
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

      const formation = await FormationService.togglePublication(
        req.params.id,
        estPubliee,
      );

      return successResponse(
        res,
        formation,
        formation.estPubliee
          ? 'Formation publiée'
          : 'Formation dépubliée',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Upload image
     ========================================================================== */
  static async uploadImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError('Aucun fichier fourni');
      }

      const filename =
        (req.file as any).filename ??
        req.file.originalname ??
        'image';
      const url = `/uploads/formations/${Date.now()}-${filename}`;

      const formation = await FormationService.setImage(
        req.params.id,
        url,
      );

      return successResponse(res, formation, 'Image mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Supprimer
     ========================================================================== */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await FormationService.delete(req.params.id);
      return successResponse(res, null, 'Formation supprimée');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Statistiques par domaine
     ========================================================================== */
  static async statsByDomaine(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await FormationService.countByDomaine();
      return successResponse(res, stats);
    } catch (e) {
      next(e);
    }
  }
}