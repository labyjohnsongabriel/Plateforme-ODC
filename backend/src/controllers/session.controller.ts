// src/controllers/SessionController.ts — UN SEUL fichier
import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { StatutSession } from '../entities/enums';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError } from '../errors/AppError';

export class SessionController {
  // ==================== 🌐 PUBLIC ====================

  /** GET /api/public/sessions */
  static async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await SessionService.findAllPublic(req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit, 'Sessions ouvertes');
    } catch (e) { next(e); }
  }

  /** GET /api/public/sessions/:codeSession */
  static async detailPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const s = await SessionService.findByCodePublic(req.params.codeSession);
      return successResponse(res, s);
    } catch (e) { next(e); }
  }

  // ==================== 🔒 STAFF / ADMIN ====================

  /** POST /api/sessions */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.formationId || !req.body.dateDebut || !req.body.dateFin) {
        throw new BadRequestError('formationId, dateDebut et dateFin requis');
      }
      return successResponse(res, await SessionService.create(req.body), 'Session créée', 201);
    } catch (e) { next(e); }
  }

  /** GET /api/sessions */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await SessionService.findAll(req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit);
    } catch (e) { next(e); }
  }

  /** GET /api/sessions/:id */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(res, await SessionService.findById(req.params.id));
    } catch (e) { next(e); }
  }

  /** PUT /api/sessions/:id */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(
        res,
        await SessionService.update(req.params.id, req.body),
        'Session mise à jour',
      );
    } catch (e) { next(e); }
  }

  /** PUT /api/sessions/:id/statut */
  static async changerStatut(req: Request, res: Response, next: NextFunction) {
    try {
      const statut = req.body.statut as StatutSession;
      if (!Object.values(StatutSession).includes(statut)) {
        throw new BadRequestError('Statut invalide');
      }
      return successResponse(
        res,
        await SessionService.changerStatut(req.params.id, statut),
        'Statut modifié',
      );
    } catch (e) { next(e); }
  }

  /** PUT /api/sessions/:id/publier */
  static async publier(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(
        res,
        await SessionService.togglePublication(req.params.id, !!req.body.estPubliee),
        'Publication mise à jour',
      );
    } catch (e) { next(e); }
  }

  /** PUT /api/sessions/:id/ouvrir-presence — Active le QR code */
  static async ouvrirPresence(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(
        res,
        await SessionService.ouvrirPresence(req.params.id, req.body.ouverte !== false),
        'Présence mise à jour',
      );
    } catch (e) { next(e); }
  }

  /** DELETE /api/sessions/:id */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await SessionService.delete(req.params.id);
      return successResponse(res, null, 'Session supprimée');
    } catch (e) { next(e); }
  }

  // ==================== 🔒 FORMATEUR ====================

  /** GET /api/formateur/sessions — Formateur connecté */
  static async mesSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SessionService.findMesSessions(req.userId!);
      return successResponse(res, data, 'Mes sessions');
    } catch (e) { next(e); }
  }

  /** GET /api/formateur/sessions/:id/participants */
  static async participants(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SessionService.getParticipants(req.params.id);
      return successResponse(res, data, 'Participants');
    } catch (e) { next(e); }
  }
}  // ✅ ACCOLADE FERMANTE DE LA CLASSE — NE PAS OUBLIER !