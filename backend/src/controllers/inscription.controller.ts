import { Request, Response, NextFunction } from 'express';
import { InscriptionService } from '../services/inscription.service';
import { StatutInscription } from '../models/Inscription.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';

export class InscriptionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await InscriptionService.create(req.userId!, req.body.sessionId, req.body.motivation), 'Inscription envoyee', 201); }
    catch (e) { next(e); }
  }
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await InscriptionService.findAll(req.userId!, req.userRole!, req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit);
    } catch (e) { next(e); }
  }
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await InscriptionService.findById(req.params.id)); }
    catch (e) { next(e); }
  }
  static async selectionner(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await InscriptionService.selectionner(req.params.id, req.body.statut as StatutInscription, req.body.motifRefus)); }
    catch (e) { next(e); }
  }
  static async annuler(req: Request, res: Response, next: NextFunction) {
    try { await InscriptionService.annuler(req.params.id, req.userId!); return successResponse(res, null, 'Inscription annulee'); }
    catch (e) { next(e); }
  }
}