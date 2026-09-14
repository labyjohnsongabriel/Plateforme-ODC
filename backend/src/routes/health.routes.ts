import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
const router = Router();
router.get('/', HealthController.check);
router.get('/live', HealthController.live);
router.get('/ready', HealthController.ready);
router.get('/db', HealthController.db);
export default router;