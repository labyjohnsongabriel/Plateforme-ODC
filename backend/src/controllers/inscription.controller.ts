// src/controllers/InscriptionController.ts
import { Request, Response, NextFunction } from 'express';
import { InscriptionService } from '../services/inscription.service';
import { StatutInscription } from '../entities/enums';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError } from '../errors/AppError';

export class InscriptionController {
  /** POST /api/public/inscriptions — Public : inscription en ligne */
  static async createPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, email, nom, prenom, motivation, telephone } = req.body;
      if (!sessionId || !email || !nom || !prenom) {
        throw new BadRequestError('sessionId, email, nom et prénom requis');
      }
      const r = await InscriptionService.createPublic({
        sessionId, email, nom, prenom, motivation, telephone,
      });
      return successResponse(res, r, 'Inscription envoyée', 201);
    } catch (e) { next(e); }
  }

  /** POST /api/inscriptions — Participant authentifié */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.sessionId) throw new BadRequestError('sessionId requis');
      const r = await InscriptionService.create(req.userId!, req.body.sessionId, req.body.motivation);
      return successResponse(res, r, 'Inscription envoyée', 201);
    } catch (e) { next(e); }
  }

  /** GET /api/inscriptions */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await InscriptionService.findAll(req.userId!, req.userRole!, req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit);
    } catch (e) { next(e); }
  }

  /** GET /api/inscriptions/:id */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await InscriptionService.findById(req.params.id)); }
    catch (e) { next(e); }
  }

  /** PUT /api/inscriptions/:id/selectionner — Staff ODC */
  static async selectionner(req: Request, res: Response, next: NextFunction) {
    try {
      const { statut, motifRefus } = req.body;
      if (!Object.values(StatutInscription).includes(statut)) {
        throw new BadRequestError('Statut invalide');
      }
      const r = await InscriptionService.selectionner(req.params.id, statut, motifRefus, req.userId!);
      return successResponse(res, r, 'Sélection effectuée');
    } catch (e) { next(e); }
  }

  /** DELETE /api/inscriptions/:id — Participant */
  static async annuler(req: Request, res: Response, next: NextFunction) {
    try {
      await InscriptionService.annuler(req.params.id, req.userId!);
      return successResponse(res, null, 'Inscription annulée');
    } catch (e) { next(e); }
  }
}