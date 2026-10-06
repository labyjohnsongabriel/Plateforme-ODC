// src/routes/dashboard.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.use(authMiddleware);

// GET /api/dashboard/me  →  renvoie les stats selon le rôle du JWT
router.get('/me', DashboardController.myStats);

export default router;