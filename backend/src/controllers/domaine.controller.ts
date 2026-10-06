// src/controllers/DomaineController.ts
import { Request, Response, NextFunction } from 'express';
import { domaineService } from '../services/domaine.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError } from '../errors/AppError';

export class DomaineController {
  // 🌐 PUBLIC
  static async listPublic(_req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await domaineService.listPublic()); }
    catch (e) { next(e); }
  }

  static async detailPublic(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await domaineService.detailPublic(req.params.slug)); }
    catch (e) { next(e); }
  }

  // 🔒 ADMIN
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await domaineService.findAll(req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit);
    } catch (e) { next(e); }
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await domaineService.findById(req.params.id)); }
    catch (e) { next(e); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.nom) throw new BadRequestError('Nom requis');
      return successResponse(res, await domaineService.create(req.body), 'Domaine créé', 201);
    } catch (e) { next(e); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await domaineService.update(req.params.id, req.body), 'Domaine mis à jour'); }
    catch (e) { next(e); }
  }

  static async publier(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await domaineService.togglePublication(req.params.id, !!req.body.estPubliee)); }
    catch (e) { next(e); }
  }

  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('Aucun fichier');
      const url = `/uploads/domaines/${req.file.filename}`;
      return successResponse(res, await domaineService.setImage(req.params.id, url), 'Image mise à jour');
    } catch (e) { next(e); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try { await domaineService.delete(req.params.id); return successResponse(res, null, 'Domaine supprimé'); }
    catch (e) { next(e); }
  }

  static async statsByDomaine(_req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await domaineService.statsByDomaine()); }
    catch (e) { next(e); }
  }
}