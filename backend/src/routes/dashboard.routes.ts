<<<<<<< HEAD
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
=======
// src/routes/dashboard.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.use(authMiddleware);

// GET /api/dashboard/me  →  renvoie les stats selon le rôle du JWT
router.get('/me', DashboardController.myStats);

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export default router;