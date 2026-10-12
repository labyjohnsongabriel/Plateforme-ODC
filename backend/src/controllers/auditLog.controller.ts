// src/controllers/AuditLogController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { NotFoundError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';

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
  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page, limit, skip } = getPagination(
        req.query.page,
        req.query.limit,
      );

      const qb = auditRepo()
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.user', 'u')       // ⭐ Fonctionne avec la relation
        .where('a.deletedAt IS NULL');          // ⭐ Propriété TS

      /* -------------------- Filtres -------------------- */

      if (req.query.userId) {
        qb.andWhere('a.userId = :uid', { uid: req.query.userId });
      }

      if (req.query.action) {
        qb.andWhere('a.action = :ac', { ac: req.query.action });
      }

      if (req.query.entite) {
        qb.andWhere('a.entite = :en', { en: req.query.entite });
      }

      if (req.query.entiteId) {
        qb.andWhere('a.entiteId = :eid', { eid: req.query.entiteId });
      }

      if (req.query.from) {
        qb.andWhere('a.createdAt >= :from', { from: req.query.from });
      }

      if (req.query.to) {
        qb.andWhere('a.createdAt <= :to', { to: req.query.to });
      }

      /* -------------------- Tri + Pagination -------------------- */
      qb.orderBy('a.createdAt', 'DESC').skip(skip).take(limit);

      const [data, total] = await qb.getManyAndCount();

      return paginatedResponse(
        res,
        data,
        total,
        page,
        limit,
        'Journal d\'audit',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/audit-logs/:id
     ========================================================================== */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const log = await auditRepo().findOne({
        where: { id: req.params.id },
        relations: ['user'],
      });

      if (!log) throw new NotFoundError('Entrée d\'audit introuvable');

      return successResponse(res, log);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/audit-logs/user/:userId
     ========================================================================== */
  static async findByUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const logs = await auditRepo().find({
        where: { userId: req.params.userId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: 200,
      });

      return successResponse(res, logs, 'Historique utilisateur');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/audit-logs/stats
     ========================================================================== */
  static async stats(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const [topActions, topUsers, total] = await Promise.all([
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

        auditRepo().count({ where: { deletedAt: null as any } }),
      ]);

      return successResponse(res, {
        total,
        topActions: topActions.map((a) => ({
          action: a.action,
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
  static async cleanup(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const days = Math.max(1, Number(req.query.days) || 365);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const result = await auditRepo()
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoff', { cutoff })
        .execute();

      return successResponse(
        res,
        { deleted: result.affected ?? 0, cutoff },
        `Purge effectuée (${result.affected ?? 0} entrées supprimées)`,
      );
    } catch (e) {
      next(e);
    }
  }
}