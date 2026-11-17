// src/routes/notification.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();

router.use(authMiddleware);

// GET  /api/notifications
router.get ('/',                    NotificationController.mesNotifications);
// GET  /api/notifications/non-lues/count
router.get ('/non-lues/count',      NotificationController.countNonLues);
// PUT  /api/notifications/:id/lue
router.put ('/:id/lue',             NotificationController.marquerLue);
// PUT  /api/notifications/toutes-lues
router.put ('/toutes-lues',         NotificationController.marquerToutesLues);
// DELETE /api/notifications/:id
router.delete('/:id',               NotificationController.delete);

export default router;