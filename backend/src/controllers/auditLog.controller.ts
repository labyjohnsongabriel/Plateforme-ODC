// src/controllers/AuditLogController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { NotFoundError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { IsNull } from 'typeorm';

/* ============================================================================
   REPOSITORY
   ============================================================================ */

const auditRepo = () => AppDataSource.getRepository(AuditLog);

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class AuditLogController {
  /* ==========================================================================
     GET /api/admin/audit-logs
     ========================================================================== */
  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, skip } = getPagination(
        typeof req.query.page === 'string' ? req.query.page : undefined,
        typeof req.query.limit === 'string' ? req.query.limit : undefined
      );

      const qb = auditRepo()
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.user', 'u') // ⭐ Fonctionne avec la relation
        .where('a.deletedAt IS NULL'); // ⭐ Propriété TS

      /* -------------------- Filtres -------------------- */

      if (req.query.userId) {
        qb.andWhere('a.userId = :uid', { uid: req.query.userId });
      }

      if (typeof req.query.action === 'string' && req.query.action.trim()) {
        qb.andWhere('a.action ILIKE :ac', {
          ac: `%${req.query.action.trim()}%`,
        });
      }

      if (req.query.entite) {
        qb.andWhere('a.entite = :en', { en: req.query.entite });
      }

      if (req.query.entiteId) {
        qb.andWhere('a.entiteId = :eid', { eid: req.query.entiteId });
      }

      if (typeof req.query.from === 'string') {
        qb.andWhere('a.createdAt >= :from', { from: req.query.from });
      }

      if (typeof req.query.to === 'string') {
        qb.andWhere('a.createdAt <= :to', { to: req.query.to });
      }

      const severity =
        typeof req.query.severite === 'string' ? req.query.severite.toUpperCase() : undefined;
      if (severity === 'CRITICAL') {
        qb.andWhere(
          "(a.action ILIKE '%DELETE%' OR a.action ILIKE '%REMOVE%' OR a.action ILIKE '%REVOKE%' OR a.action ILIKE '%BAN%')"
        );
      } else if (severity === 'WARNING') {
        qb.andWhere(
          "(a.action ILIKE '%UPDATE%' OR a.action ILIKE '%EDIT%' OR a.action ILIKE '%PATCH%' OR a.action ILIKE '%SUSPEND%')"
        ).andWhere(
          "a.action NOT ILIKE '%DELETE%' AND a.action NOT ILIKE '%REMOVE%' AND a.action NOT ILIKE '%REVOKE%' AND a.action NOT ILIKE '%BAN%'"
        );
      } else if (severity === 'INFO') {
        qb.andWhere(
          "a.action NOT ILIKE '%DELETE%' AND a.action NOT ILIKE '%REMOVE%' AND a.action NOT ILIKE '%REVOKE%' AND a.action NOT ILIKE '%BAN%' AND a.action NOT ILIKE '%UPDATE%' AND a.action NOT ILIKE '%EDIT%' AND a.action NOT ILIKE '%PATCH%' AND a.action NOT ILIKE '%SUSPEND%'"
        );
      }

      /* -------------------- Tri + Pagination -------------------- */
      qb.orderBy('a.createdAt', 'DESC').skip(skip).take(limit);

      const [data, total] = await qb.getManyAndCount();

      paginatedResponse(res, data, total, page, limit, "Journal d'audit");
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/audit-logs/:id
     ========================================================================== */
  static async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const log = await auditRepo().findOne({
        where: { id: req.params.id },
        relations: ['user'],
      });

      if (!log) throw new NotFoundError("Entrée d'audit introuvable");

      successResponse(res, log);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/audit-logs/user/:userId
     ========================================================================== */
  static async findByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await auditRepo().find({
        where: { userId: req.params.userId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: 200,
      });

      successResponse(res, logs, 'Historique utilisateur');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/audit-logs/stats
     ========================================================================== */
  static async stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sinceToday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const sinceWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [topActions, topUsers, total, today, thisWeek, criticals, parEntite] =
        await Promise.all([
          auditRepo()
            .createQueryBuilder('a')
            .select('a.action', 'action')
            .addSelect('COUNT(a.id)', 'count')
            .where('a.deletedAt IS NULL')
            .groupBy('a.action')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany(),

          auditRepo()
            .createQueryBuilder('a')
            .leftJoin('a.user', 'u')
            .select('u.id', 'userId')
            .addSelect('u.email', 'email')
            .addSelect('u.nom', 'nom')
            .addSelect('u.prenom', 'prenom')
            .addSelect('COUNT(a.id)', 'count')
            .where('a.userId IS NOT NULL')
            .andWhere('a.deletedAt IS NULL')
            .groupBy('u.id')
            .addGroupBy('u.email')
            .addGroupBy('u.nom')
            .addGroupBy('u.prenom')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany(),

          auditRepo().count({ where: { deletedAt: IsNull() } }),
          auditRepo()
            .createQueryBuilder('a')
            .where('a.deletedAt IS NULL')
            .andWhere('a.createdAt >= :sinceToday', { sinceToday })
            .getCount(),
          auditRepo()
            .createQueryBuilder('a')
            .where('a.deletedAt IS NULL')
            .andWhere('a.createdAt >= :sinceWeek', { sinceWeek })
            .getCount(),
          auditRepo()
            .createQueryBuilder('a')
            .where('a.deletedAt IS NULL')
            .andWhere(
              "(a.action ILIKE '%DELETE%' OR a.action ILIKE '%REMOVE%' OR a.action ILIKE '%REVOKE%' OR a.action ILIKE '%BAN%')"
            )
            .getCount(),
          auditRepo()
            .createQueryBuilder('a')
            .select('a.entite', 'entite')
            .addSelect('COUNT(a.id)', 'count')
            .where('a.deletedAt IS NULL')
            .andWhere('a.entite IS NOT NULL')
            .groupBy('a.entite')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany(),
        ]);

      successResponse(res, {
        total,
        today,
        thisWeek,
        criticals,
        topActions: topActions.map((a) => ({
          action: a.action,
          count: Number(a.count),
        })),
        parAction: topActions.map((a) => ({
          action: a.action,
          count: Number(a.count),
        })),
        parEntite: parEntite.map((a) => ({
          entite: a.entite,
          count: Number(a.count),
        })),
        topUsers: topUsers.map((u) => ({
          userId: u.userId,
          email: u.email,
          nom: u.nom,
          prenom: u.prenom,
          count: Number(u.count),
        })),
      });
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     DELETE /api/admin/audit-logs/cleanup
     ========================================================================== */
  static async cleanup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = Math.max(1, Number(req.query.days) || 365);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const result = await auditRepo()
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoff', { cutoff })
        .execute();

      successResponse(
        res,
        { deleted: result.affected ?? 0, cutoff },
        `Purge effectuée (${result.affected ?? 0} entrées supprimées)`
      );
    } catch (e) {
      next(e);
    }
  }
}
