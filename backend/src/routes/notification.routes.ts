import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authMiddleware, paginationMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);
router.get('/', paginationMiddleware, NotificationController.mesNotifications);
router.get('/count', NotificationController.countNonLues);
router.patch('/:id/lire', NotificationController.marquerLue);
router.patch('/lire-tout', NotificationController.marquerToutesLues);
export default router;