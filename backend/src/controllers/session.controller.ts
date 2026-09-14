import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { StatutSession } from '../models/Session.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';

export class SessionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await SessionService.create(req.body), 'Session creee', 201); }
    catch (e) { next(e); }
  }
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await SessionService.findAll(req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit);
    } catch (e) { next(e); }
  }
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await SessionService.findById(req.params.id)); }
    catch (e) { next(e); }
  }
  static async update(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await SessionService.update(req.params.id, req.body), 'Session mise a jour'); }
    catch (e) { next(e); }
  }
  static async changerStatut(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await SessionService.changerStatut(req.params.id, req.body.statut), 'Statut modifie'); }
    catch (e) { next(e); }
  }
  static async delete(req: Request, res: Response, next: NextFunction) {
    try { await SessionService.delete(req.params.id); return successResponse(res, null, 'Session supprimee'); }
    catch (e) { next(e); }
  }
  static async mesSessions(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await SessionService.findMesSessions(req.userId!)); }
    catch (e) { next(e); }
  }
}