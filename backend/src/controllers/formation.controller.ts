<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
import { FormationService } from '../services/formation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';

export class FormationController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const f = await FormationService.create(req.body);
      return successResponse(res, f, 'Formation creee', 201);
    } catch (e) { next(e); }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await FormationService.findAll(req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit, 'Liste des formations');
    } catch (e) { next(e); }
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const f = await FormationService.findById(req.params.id);
      return successResponse(res, f);
    } catch (e) { next(e); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const f = await FormationService.update(req.params.id, req.body);
      return successResponse(res, f, 'Formation mise a jour');
    } catch (e) { next(e); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await FormationService.delete(req.params.id);
      return successResponse(res, null, 'Formation supprimee');
    } catch (e) { next(e); }
  }

  static async top(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await FormationService.getTop();
      return successResponse(res, r);
    } catch (e) { next(e); }
  }

  static async statsByDomaine(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await FormationService.countByDomaine();
      return successResponse(res, r);
    } catch (e) { next(e); }
=======
// src/controllers/FormationController.ts
import { Request, Response, NextFunction } from 'express';
import { FormationService } from '../services/formation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError, NotFoundError } from '../errors/AppError';
import { slugify } from '../utils/string.util';

export class FormationController {
  /* ==========================================================================
     🌐 PUBLIC
     ========================================================================== */

  /** GET /api/public/formations */
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

  /** GET /api/public/formations/:slug */
  static async detailPublic(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const formation = await FormationService.findBySlugPublic(req.params.slug);
      return successResponse(res, formation);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/public/formations/top */
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
     🔒 ADMIN / STAFF
     ========================================================================== */

  /** POST /api/formations */
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

      // Slug auto-généré si absent
      const slug = req.body.slug || slugify(titre);

      const formation = await FormationService.create({
        ...req.body,
        slug,
      });

      return successResponse(res, formation, 'Formation créée', 201);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/formations */
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

  /** GET /api/formations/:id */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const formation = await FormationService.findById(req.params.id);
      if (!formation) throw new NotFoundError('Formation introuvable');
      return successResponse(res, formation);
    } catch (e) {
      next(e);
    }
  }

  /** PUT /api/formations/:id */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const formation = await FormationService.update(req.params.id, req.body);
      return successResponse(res, formation, 'Formation mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /** PUT /api/formations/:id/publier */
  static async publier(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const estPubliee =
        typeof req.body.estPubliee === 'boolean' ? req.body.estPubliee : true;

      const formation = await FormationService.togglePublication(
        req.params.id,
        estPubliee,
      );

      return successResponse(
        res,
        formation,
        formation.estPubliee ? 'Formation publiée' : 'Formation dépubliée',
      );
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/formations/:id/image */
  static async uploadImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError('Aucun fichier fourni');

      const filename =
        (req.file as any).filename ?? req.file.originalname ?? 'image';
      const url = `/uploads/formations/${Date.now()}-${filename}`;

      const formation = await FormationService.setImage(req.params.id, url);
      return successResponse(res, formation, 'Image mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /** DELETE /api/formations/:id */
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

  /** GET /api/formations/stats/domaines */
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}