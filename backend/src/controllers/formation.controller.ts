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
  }
}