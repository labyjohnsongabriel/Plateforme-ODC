// src/controllers/EvaluationController.ts
import { Request, Response, NextFunction } from 'express';
import { EvaluationService } from '../services/evaluation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { TypeEvaluation } from '../entities/enums';
import { BadRequestError } from '../errors/AppError';

export class EvaluationController {
  /** GET /api/evaluations — Formateur / Staff / Admin */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await EvaluationService.findAll(req.query, req.userId!, req.userRole!);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit);
    } catch (e) { next(e); }
  }

  /** POST /api/evaluations — Formateur / Staff */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.sessionId || !req.body.titre) {
        throw new BadRequestError('sessionId et titre requis');
      }
      if (req.body.type && !Object.values(TypeEvaluation).includes(req.body.type)) {
        throw new BadRequestError('Type d\'évaluation invalide');
      }
      const e = await EvaluationService.create(req.userId!, req.body);
      return successResponse(res, e, 'Évaluation créée', 201);
    } catch (e) { next(e); }
  }

  /** GET /api/evaluations/session/:sessionId — Tous rôles autorisés */
  static async findBySession(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await EvaluationService.findBySession(req.params.sessionId)); }
    catch (e) { next(e); }
  }

  /** GET /api/evaluations/:id */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await EvaluationService.findById(req.params.id)); }
    catch (e) { next(e); }
  }

  /** PUT /api/evaluations/:id */
  static async update(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await EvaluationService.update(req.params.id, req.userId!, req.body), 'Évaluation mise à jour'); }
    catch (e) { next(e); }
  }

  /** PUT /api/evaluations/:id/publier */
  static async publier(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await EvaluationService.togglePublication(req.params.id, req.userId!, !!req.body.publiee), 'Publication mise à jour'); }
    catch (e) { next(e); }
  }

  /** POST /api/evaluations/:evaluationId/notes — Formateur */
  static async saisirNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { participantId, note, commentaire } = req.body;
      if (!participantId || note === undefined) throw new BadRequestError('participantId et note requis');
      const r = await EvaluationService.saisirNote(
        req.userId!, req.params.evaluationId, participantId, note, commentaire
      );
      return successResponse(res, r, 'Note enregistrée');
    } catch (e) { next(e); }
  }

  /** GET /api/evaluations/session/:sessionId/participant/:participantId/moyenne */
  static async moyenne(req: Request, res: Response, next: NextFunction) {
    try {
      const m = await EvaluationService.calculerMoyenne(req.params.sessionId, req.params.participantId);
      return successResponse(res, { moyenne: m });
    } catch (e) { next(e); }
  }

  /** DELETE /api/evaluations/:id */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try { await EvaluationService.delete(req.params.id, req.userId!); return successResponse(res, null, 'Évaluation supprimée'); }
    catch (e) { next(e); }
  }
}