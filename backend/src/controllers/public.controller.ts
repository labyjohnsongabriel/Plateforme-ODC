// src/controllers/public.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { successResponse } from '../utils/response.util';
import { logger } from '../config/logger';

export class PublicController {
  static async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [formations, sessions, apprenants, attestations] = await Promise.all([
        AppDataSource.query(
          `SELECT COUNT(*)::int AS count FROM formations
           WHERE est_publiee = true AND deleted_at IS NULL`,
        ),
        AppDataSource.query(
          `SELECT COUNT(*)::int AS count FROM sessions
           WHERE statut IN ('OUVERTE', 'EN_COURS', 'PLANIFIEE')
             AND deleted_at IS NULL`,
        ),
        AppDataSource.query(
          `SELECT COUNT(DISTINCT i.participant_id)::int AS count
           FROM inscriptions i
           INNER JOIN users u ON u.id = i.participant_id
           WHERE i.statut = 'ACCEPTEE'
             AND i.deleted_at IS NULL AND u.deleted_at IS NULL`,
        ),
        AppDataSource.query(
          `SELECT COUNT(*)::int AS count FROM attestations
           WHERE valide = true AND deleted_at IS NULL`,
        ),
      ]);

      return successResponse(res, {
        formations: formations[0]?.count ?? 0,
        sessions: sessions[0]?.count ?? 0,
        apprenants: apprenants[0]?.count ?? 0,
        attestations: attestations[0]?.count ?? 0,
      }, 'Statistiques publiques');
    } catch (e) {
      logger.error('[PUBLIC STATS]', e);
      next(e);
    }
  }

  static async usersCount(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.query.role as string) ?? 'PARTICIPANT';
      const rows = await AppDataSource.query(
        `SELECT COUNT(*)::int AS total FROM users u
         INNER JOIN roles r ON r.id = u.role_id
         WHERE r.nom = $1 AND u.actif = true AND u.deleted_at IS NULL`,
        [role],
      );
      return successResponse(res, { total: rows[0]?.total ?? 0 }, 'OK');
    } catch (e) { next(e); }
  }

  static async attestationsCount(_req: Request, res: Response, next: NextFunction) {
    try {
      const rows = await AppDataSource.query(
        `SELECT COUNT(*)::int AS total FROM attestations
         WHERE valide = true AND deleted_at IS NULL`,
      );
      return successResponse(res, { total: rows[0]?.total ?? 0 }, 'OK');
    } catch (e) { next(e); }
  }
}