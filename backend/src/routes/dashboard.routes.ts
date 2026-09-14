import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);
router.get('/my-stats', DashboardController.myStats);
router.get('/admin', DashboardController.adminStats);
router.get('/staff', DashboardController.staffStats);
router.get('/formateur', DashboardController.formateurStats);
router.get('/participant', DashboardController.participantStats);
router.get('/partenaire', DashboardController.partenaireStats);
export default router;