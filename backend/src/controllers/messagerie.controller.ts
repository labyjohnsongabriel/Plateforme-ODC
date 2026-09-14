import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response.util';

export class MessagerieController {
  static async mesConversations(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, []); } catch (e) { next(e); }
  }
  static async createPrivate(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, {}, 'Conversation creee', 201); } catch (e) { next(e); }
  }
  static async createGroupe(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, {}, 'Groupe cree', 201); } catch (e) { next(e); }
  }
  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, { data: [], total: 0 }); } catch (e) { next(e); }
  }
  static async envoyer(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, {}, 'Message envoye', 201); } catch (e) { next(e); }
  }
  static async marquerLus(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, null, 'Messages lus'); } catch (e) { next(e); }
  }
  static async countNonLus(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, { count: 0 }); } catch (e) { next(e); }
  }
}