<<<<<<< HEAD
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
=======
// src/controllers/DashboardController.ts
import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { successResponse } from '../utils/response.util';
import { BadRequestError } from '../errors/AppError';
import { RoleName } from '../entities/enums';
import { AppDataSource } from '../config/database';
import { logger } from '../config/logger';

/* ============================================================================
   HELPERS
   ============================================================================ */

function getUserId(req: Request): string {
  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) throw new BadRequestError('Utilisateur non authentifié');
  return userId;
}

function getUserRole(req: Request): RoleName {
  const role = (req as any).user?.role ?? (req as any).userRole;
  if (!role) throw new BadRequestError('Rôle manquant');
  return role as RoleName;
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class DashboardController {
  /* ==========================================================================
     GET /api/dashboard/me
     Tableau de bord générique selon le rôle de l'utilisateur
     ========================================================================== */
  static async myStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const role = getUserRole(req);

      logger.info(`📊 myStats — user=${userId} role=${role}`);

      const stats = await DashboardService.getStats(role, userId);

      return successResponse(res, stats, 'Statistiques du tableau de bord');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐ GET /api/admin/dashboard
     Dashboard administrateur
     ========================================================================== */
  static async adminDashboard(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      logger.info('📊 adminDashboard');

      const stats = await DashboardService.getAdminStats();

      return successResponse(res, stats, 'Statistiques administrateur');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/dashboard/top-formations
     ========================================================================== */
  static async topFormations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 5));

      const stats = await DashboardService.getAdminStats();
      const top = stats.topFormations.slice(0, limit);

      return successResponse(res, top);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/dashboard/status
     Vérifier l'état du système
     ========================================================================== */
  static async systemStatus(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      let databaseOk = false;
      try {
        await AppDataSource.query('SELECT 1');
        databaseOk = true;
      } catch {
        databaseOk = false;
      }

      return successResponse(res, {
        database: databaseOk,
        api: true,
        socket: true,
        storage: 45,
        uptime: process.uptime(),
        version: process.env.APP_VERSION ?? '1.0.0',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 Routes par rôle — Utilise byRole()
     ========================================================================== */

  /* -------------------- ADMIN -------------------- */
  static adminStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    return DashboardController.byRole(RoleName.ADMINISTRATEUR)(req, res, next);
  }

  /* -------------------- STAFF -------------------- */
  static staffStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    return DashboardController.byRole(RoleName.STAFF_ODC)(req, res, next);
  }

  /* -------------------- FORMATEUR -------------------- */
  static formateurStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    return DashboardController.byRole(RoleName.FORMATEUR)(req, res, next);
  }

  /* -------------------- PARTICIPANT -------------------- */
  static participantStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    return DashboardController.byRole(RoleName.PARTICIPANT)(req, res, next);
  }

  /* -------------------- PARTENAIRE -------------------- */
  static partenaireStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    return DashboardController.byRole(RoleName.PARTENAIRE)(req, res, next);
  }

  /* ==========================================================================
     🔧 Helper privé — Route par rôle forcé
     ========================================================================== */
  private static byRole(forcedRole: RoleName) {
    return async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      try {
        const userId = getUserId(req);
        const stats = await DashboardService.getStats(forcedRole, userId);
        return successResponse(res, stats);
      } catch (e) {
        next(e);
      }
    };
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }

  /* ==========================================================================
     📊 GET /api/admin/dashboard/stats (alias)
     ========================================================================== */
  static async getStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    return DashboardController.adminDashboard(req, res, next);
  }
}