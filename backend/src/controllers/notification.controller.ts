// src/controllers/NotificationController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { emitToUser, isSocketInitialized } from '../sockets';

async function notifyUnreadCount(userId: string): Promise<void> {
  if (!isSocketInitialized()) return;
  const count = await AppDataSource.getRepository(Notification).count({
    where: { userId, lue: false },
  });
  emitToUser(userId, 'notifications:count', { count });
}

export class NotificationController {
  /** GET /api/notifications */
  static async mesNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(
        typeof req.query.page === 'string' ? req.query.page : undefined,
        typeof req.query.limit === 'string' ? req.query.limit : undefined,
      );
      const where: { userId: string; lue?: boolean } = { userId: req.userId! };
      if (req.query.lue === 'true') where.lue = true;
      if (req.query.lue === 'false') where.lue = false;
      const [data, total] = await AppDataSource.getRepository(Notification).findAndCount({
        where,
        skip, take: limit,
        order: { createdAt: 'DESC' },
      });
      return paginatedResponse(res, data, total, page, limit);
    } catch (e) { next(e); }
  }

  /** GET /api/notifications/non-lues/count */
  static async countNonLues(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await AppDataSource.getRepository(Notification).count({
        where: { userId: req.userId!, lue: false },
      });
      return successResponse(res, { count });
    } catch (e) { next(e); }
  }

  /** PUT /api/notifications/:id/lue */
  static async marquerLue(req: Request, res: Response, next: NextFunction) {
    try {
      await AppDataSource.getRepository(Notification).update(
        { id: req.params.id, userId: req.userId! },
        { lue: true, dateLecture: new Date() }
      );
      await notifyUnreadCount(req.userId!);
      return successResponse(res, null, 'Notification lue');
    } catch (e) { next(e); }
  }

  /** PUT /api/notifications/toutes-lues */
  static async marquerToutesLues(req: Request, res: Response, next: NextFunction) {
    try {
      await AppDataSource.getRepository(Notification).update(
        { userId: req.userId!, lue: false },
        { lue: true, dateLecture: new Date() }
      );
      await notifyUnreadCount(req.userId!);
      return successResponse(res, null, 'Toutes les notifications lues');
    } catch (e) { next(e); }
  }

  /** DELETE /api/notifications/:id */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await AppDataSource.getRepository(Notification).softDelete({
        id: req.params.id, userId: req.userId!,
      });
      await notifyUnreadCount(req.userId!);
      return successResponse(res, null, 'Notification supprimée');
    } catch (e) { next(e); }
  }
}