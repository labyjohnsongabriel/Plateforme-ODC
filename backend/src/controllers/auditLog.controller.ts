// src/controllers/AuditLogController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { NotFoundError } from '../errors/AppError';

export class AuditLogController {
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const qb = AppDataSource.getRepository(AuditLog).createQueryBuilder('a');
      if (req.query.userId) qb.andWhere('a.user_id = :uid', { uid: req.query.userId });
      if (req.query.action) qb.andWhere('a.action = :ac', { ac: req.query.action });
      if (req.query.entite) qb.andWhere('a.entite = :en', { en: req.query.entite });

      qb.orderBy('a.created_at', 'DESC').skip(skip).take(limit);
      const [data, total] = await qb.getManyAndCount();

      return paginatedResponse(res, data, total, page, limit, 'Journal d\'audit');
    } catch (e) { next(e); }
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await AppDataSource.getRepository(AuditLog).findOne({ where: { id: req.params.id } });
      if (!log) throw new NotFoundError('Entrée d\'audit introuvable');
      return successResponse(res, log);
    } catch (e) { next(e); }
  }

  static async findByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await AppDataSource.getRepository(AuditLog).find({
        where: { userId: req.params.userId },
        order: { createdAt: 'DESC' },
        take: 200,
      });
      return successResponse(res, logs, 'Historique utilisateur');
    } catch (e) { next(e); }
  }

  static async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const topActions = await AppDataSource.getRepository(AuditLog)
        .createQueryBuilder('a')
        .select('a.action', 'action')
        .addSelect('COUNT(a.id)', 'count')
        .groupBy('a.action')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      return successResponse(res, { topActions });
    } catch (e) { next(e); }
  }

  static async cleanup(req: Request, res: Response, next: NextFunction) {
    try {
      const days = Number(req.query.days) || 365;
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const result = await AppDataSource.getRepository(AuditLog)
        .createQueryBuilder()
        .delete()
        .where('created_at < :cutoff', { cutoff })
        .execute();
      return successResponse(res, { deleted: result.affected ?? 0 }, 'Purge effectuée');
    } catch (e) { next(e); }
  }
}