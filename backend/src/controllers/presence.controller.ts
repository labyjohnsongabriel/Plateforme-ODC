import { Request, Response, NextFunction } from 'express';
import { PresenceService } from '../services/presence.service';
import { successResponse, paginatedResponse } from '../utils/response.util';

export class PresenceController {
  static async scannerQr(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await PresenceService.scannerQr(req.userId!, req.body.sessionId, req.body.qrToken), 'Presence enregistree', 201); }
    catch (e) { next(e); }
  }
  static async marquerManuel(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await PresenceService.marquerManuel(req.body.sessionId, req.body.participantId, req.body.present, req.body.commentaire), 'Presence mise a jour'); }
    catch (e) { next(e); }
  }
  static async findBySession(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await PresenceService.findBySession(req.params.sessionId, req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit);
    } catch (e) { next(e); }
  }
  static async tauxPresence(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, { taux: await PresenceService.calculerTauxPresence(req.params.sessionId, req.params.participantId) }); }
    catch (e) { next(e); }
  }

  static async stats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await PresenceService.getStats(req.params.sessionId)); }
    catch (e) { next(e); }
  }

  static async generateQr(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await PresenceService.generateQr(req.body.sessionId)); }
    catch (e) { next(e); }
  }
}