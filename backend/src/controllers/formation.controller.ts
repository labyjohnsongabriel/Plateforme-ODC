// src/controllers/FormationController.ts
import { Request, Response, NextFunction } from 'express';
import { FormationService } from '../services/formation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError } from '../errors/AppError';

export class FormationController {
  // ==================== 🌐 PUBLIC ====================

  /** GET /api/public/formations — Catalogue public (publiées + actives) */
  static async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await FormationService.findAllPublic(req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit, 'Catalogue public');
    } catch (e) { next(e); }
  }

  /** GET /api/public/formations/:slug — Détail public */
  static async detailPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const formation = await FormationService.findBySlugPublic(req.params.slug);
      return successResponse(res, formation);
    } catch (e) { next(e); }
  }

  /** GET /api/public/formations/top — Top formations mises en avant */
  static async topPublic(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FormationService.getTopPublic(6);
      return successResponse(res, data);
    } catch (e) { next(e); }
  }

  // ==================== 🔒 STAFF / ADMIN ====================

  /** POST /api/formations */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.titre || !req.body.slug) throw new BadRequestError('Titre et slug requis');
      const f = await FormationService.create(req.body);
      return successResponse(res, f, 'Formation créée', 201);
    } catch (e) { next(e); }
  }

  /** GET /api/formations (admin/staff) */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await FormationService.findAll(req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit, 'Liste des formations');
    } catch (e) { next(e); }
  }

  /** GET /api/formations/:id */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await FormationService.findById(req.params.id)); }
    catch (e) { next(e); }
  }

  /** PUT /api/formations/:id */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const f = await FormationService.update(req.params.id, req.body);
      return successResponse(res, f, 'Formation mise à jour');
    } catch (e) { next(e); }
  }

  /** PUT /api/formations/:id/publier — Publier / dépublier */
  static async publier(req: Request, res: Response, next: NextFunction) {
    try {
      const f = await FormationService.togglePublication(req.params.id, !!req.body.estPubliee);
      return successResponse(res, f, f.estPubliee ? 'Formation publiée' : 'Formation dépubliée');
    } catch (e) { next(e); }
  }

  /** POST /api/formations/:id/image — Upload image de couverture */
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('Aucun fichier fourni');
      const url = `/uploads/${req.file.filename}`;
      const f = await FormationService.setImage(req.params.id, url);
      return successResponse(res, f, 'Image mise à jour');
    } catch (e) { next(e); }
  }

  /** DELETE /api/formations/:id */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try { await FormationService.delete(req.params.id); return successResponse(res, null, 'Formation supprimée'); }
    catch (e) { next(e); }
  }

  /** GET /api/formations/stats/domaines */
  static async statsByDomaine(_req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await FormationService.countByDomaine()); }
    catch (e) { next(e); }
  }
}