import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { Formation } from '../models/Formation.entity';
import { Session, StatutSession } from '../models/Session.entity';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
import { Attestation } from '../models/Attestation.entity';
import { successResponse } from '../utils/response.util';

export class DashboardController {
  static async myStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardController.getStats(req.userRole!, req.userId!);
      return successResponse(res, stats);
    } catch (e) { next(e); }
  }
  static async adminStats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await DashboardController.getStats('ADMIN', req.userId!)); }
    catch (e) { next(e); }
  }
  static async staffStats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await DashboardController.getStats('STAFF', req.userId!)); }
    catch (e) { next(e); }
  }
  static async formateurStats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await DashboardController.getStats('FORMATEUR', req.userId!)); }
    catch (e) { next(e); }
  }
  static async participantStats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await DashboardController.getStats('PARTICIPANT', req.userId!)); }
    catch (e) { next(e); }
  }
  static async partenaireStats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await DashboardController.getStats('PARTENAIRE', req.userId!)); }
    catch (e) { next(e); }
  }

  private static async getStats(role: string, userId: string) {
    if (role === 'ADMIN' || role === 'STAFF') {
      const [users, formations, sessions, inscriptions, attestations] = await Promise.all([
        AppDataSource.getRepository(User).count({ where: { actif: true } }),
        AppDataSource.getRepository(Formation).count({ where: { actif: true } }),
        AppDataSource.getRepository(Session).count(),
        AppDataSource.getRepository(Inscription).count(),
        AppDataSource.getRepository(Attestation).count(),
      ]);
      return { users, formations, sessions, inscriptions, attestations };
    }
    if (role === 'PARTICIPANT') {
      const [inscriptions, attestations] = await Promise.all([
        AppDataSource.getRepository(Inscription).count({ where: { participantId: userId } }),
        AppDataSource.getRepository(Attestation).count({ where: { participantId: userId } }),
      ]);
      return { inscriptions, attestations };
    }
    return {};
  }
}