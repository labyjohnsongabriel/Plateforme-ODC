// src/controllers/DashboardController.ts
import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { successResponse } from '../utils/response.util';
import { BadRequestError } from '../errors/AppError';
import { RoleName } from '../entities/enums';
import { AppDataSource } from '../config/database';

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
     ========================================================================== */
  static async myStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const role = getUserRole(req);

      const stats = await DashboardService.getStats(role, userId);

      return successResponse(res, stats, 'Statistiques du tableau de bord');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐ GET /api/admin/dashboard
     ========================================================================== */
  static async adminDashboard(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await DashboardService.getAdminStats();
      return successResponse(res, stats);
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
      const limit = Math.min(10, Number(req.query.limit) || 5);

      const stats = await DashboardService.getAdminStats();
      const top = stats.topFormations.slice(0, limit);

      return successResponse(res, top);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/dashboard/status
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
      });
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 Routes par rôle (utilise le service)
     ========================================================================== */

  static adminStats(req: Request, res: Response, next: NextFunction) {
    return DashboardController.byRole(RoleName.ADMINISTRATEUR)(req, res, next);
  }

  static staffStats(req: Request, res: Response, next: NextFunction) {
    return DashboardController.byRole(RoleName.STAFF_ODC)(req, res, next);
  }

  static formateurStats(req: Request, res: Response, next: NextFunction) {
    return DashboardController.byRole(RoleName.FORMATEUR)(req, res, next);
  }

  static participantStats(req: Request, res: Response, next: NextFunction) {
    return DashboardController.byRole(RoleName.PARTICIPANT)(req, res, next);
  }

  static partenaireStats(req: Request, res: Response, next: NextFunction) {
    return DashboardController.byRole(RoleName.PARTENAIRE)(req, res, next);
  }

  /* ==========================================================================
     Helper — Route par rôle forcé
     ========================================================================== */
  private static byRole(forcedRole: RoleName) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = getUserId(req);
        const stats = await DashboardService.getStats(forcedRole, userId);
        return successResponse(res, stats);
      } catch (e) {
        next(e);
      }
    };
  }
}