import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Notification } from '../models/Notification.entity';
import { successResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';

export class NotificationController {
  static async mesNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
      const [data, total] = await AppDataSource.getRepository(Notification).findAndCount({
        where: { userId: req.userId! }, skip, take: limit, order: { createdAt: 'DESC' },
      });
      return successResponse(res, { data, total, page, limit });
    } catch (e) { next(e); }
  }
  static async countNonLues(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await AppDataSource.getRepository(Notification).count({ where: { userId: req.userId!, lue: false } });
      return successResponse(res, { count });
    } catch (e) { next(e); }
  }
  static async marquerLue(req: Request, res: Response, next: NextFunction) {
    try {
      await AppDataSource.getRepository(Notification).update({ id: req.params.id, userId: req.userId! }, { lue: true });
      return successResponse(res, null, 'Notification lue');
    } catch (e) { next(e); }
  }
  static async marquerToutesLues(req: Request, res: Response, next: NextFunction) {
    try {
      await AppDataSource.getRepository(Notification).update({ userId: req.userId!, lue: false }, { lue: true });
      return successResponse(res, null, 'Toutes lues');
    } catch (e) { next(e); }
  }
}