// src/controllers/DashboardController.ts
import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { RoleName } from '../entities/enums';
import { AppDataSource } from '../config/database';
import { logger } from '../config/logger';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function getUserId(req: Request): string | null {
  return (req as any).user?.sub ?? (req as any).user?.id ?? (req as any).userId ?? null;
}

function getUserRole(req: Request): RoleName | null {
  return ((req as any).user?.role ?? (req as any).userRole) as RoleName | null;
}

function respond(res: Response, data: unknown, message?: string) {
  return res.status(200).json({
    success: true,
    message: message ?? 'OK',
    data,
  });
}

function respondError(res: Response, error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  logger.error(`[DashboardController] ${fallbackMessage}: ${message}`);
  return res.status(200).json({
    success: false,
    message: fallbackMessage,
    data: null,
    error: message,
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROLLER
   ═══════════════════════════════════════════════════════════════════════════ */

export class DashboardController {
  /* ══════════════════════════════════════════════════════════════════════════
     GET /api/dashboard/me
     ══════════════════════════════════════════════════════════════════════════ */
  static async myStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserId(req);
      const role = getUserRole(req);

      if (!userId) {
        res.status(401).json({ success: false, message: 'Non authentifié', data: null });
        return;
      }
      if (!role) {
        res.status(400).json({ success: false, message: 'Rôle manquant', data: null });
        return;
      }

      logger.info(`📊 myStats — user=${userId} role=${role}`);

      try {
        const stats = await DashboardService.getStats(role, userId);
        respond(res, stats, 'Statistiques du tableau de bord');
      } catch (e) {
        respondError(res, e, 'Impossible de charger les statistiques');
      }
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     GET /api/admin/dashboard
     ══════════════════════════════════════════════════════════════════════════ */
  static async adminDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      try {
        const stats = await DashboardService.getAdminStats();
        respond(res, stats, 'Statistiques administrateur');
      } catch (e) {
        respondError(res, e, 'Impossible de charger le dashboard admin');
      }
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     GET /api/admin/dashboard/top-formations
     ══════════════════════════════════════════════════════════════════════════ */
  static async topFormations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 5));
      try {
        const stats = await DashboardService.getAdminStats();
        respond(res, stats.topFormations.slice(0, limit));
      } catch (e) {
        respondError(res, e, 'Impossible de charger le top formations');
      }
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     GET /api/admin/dashboard/status
     ══════════════════════════════════════════════════════════════════════════ */
  static async systemStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let databaseOk = false;
      try {
        await AppDataSource.query('SELECT 1');
        databaseOk = true;
      } catch {
        databaseOk = false;
      }

      respond(res, {
        database: databaseOk,
        api: true,
        uptime: process.uptime(),
        version: process.env.APP_VERSION ?? '1.0.0',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ROUTES PAR RÔLE
     ══════════════════════════════════════════════════════════════════════════ */

  static adminStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    return DashboardController.byRole(RoleName.ADMINISTRATEUR)(req, res, next);
  }

  static staffStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    return DashboardController.byRole(RoleName.STAFF_ODC)(req, res, next);
  }

  static formateurStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    return DashboardController.byRole(RoleName.FORMATEUR)(req, res, next);
  }

  static participantStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    return DashboardController.byRole(RoleName.PARTICIPANT)(req, res, next);
  }

  static partenaireStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    return DashboardController.byRole(RoleName.PARTENAIRE)(req, res, next);
  }

  private static byRole(forcedRole: RoleName) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          res.status(401).json({ success: false, message: 'Non authentifié', data: null });
          return;
        }
        try {
          const stats = await DashboardService.getStats(forcedRole, userId);
          respond(res, stats, `Statistiques ${forcedRole}`);
        } catch (e) {
          respondError(res, e, `Impossible de charger les statistiques ${forcedRole}`);
        }
      } catch (e) {
        next(e);
      }
    };
  }

  static getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    return DashboardController.adminDashboard(req, res, next);
  }
}