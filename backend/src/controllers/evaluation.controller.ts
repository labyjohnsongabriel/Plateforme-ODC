import { Request, Response, NextFunction } from 'express';
import { EvaluationService } from '../services/evaluation.service';
import { successResponse } from '../utils/response.util';

export class EvaluationController {
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await EvaluationService.findAll(req.query.sessionId as string | undefined)); }
    catch (e) { next(e); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await EvaluationService.create(req.userId!, req.body), 'Evaluation creee', 201); }
    catch (e) { next(e); }
  }
  static async findBySession(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await EvaluationService.findBySession(req.params.sessionId)); }
    catch (e) { next(e); }
  }
  static async saisirNote(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await EvaluationService.saisirNote(req.userId!, req.params.evaluationId, req.body.participantId, req.body.note, req.body.commentaire), 'Note enregistree'); }
    catch (e) { next(e); }
  }
  static async moyenne(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, { moyenne: await EvaluationService.calculerMoyenne(req.params.sessionId, req.params.participantId) }); }
    catch (e) { next(e); }
  }
}