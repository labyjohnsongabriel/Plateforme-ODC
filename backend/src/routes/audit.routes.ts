import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { AuditLog } from '../models/AuditLog.entity';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { successResponse, paginatedResponse } from '../utils/response.util';

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const repo = AppDataSource.getRepository(AuditLog);

    const [data, total] = await repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginatedResponse(res, data, total, page, limit);
  } catch (e) { next(e); }
});

export default router;