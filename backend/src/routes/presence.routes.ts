import { Router } from 'express';
import { PresenceController } from '../controllers/presence.controller';
import { authMiddleware, roleMiddleware, paginationMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);
router.use(paginationMiddleware);

router.post('/scan', roleMiddleware(['PARTICIPANT']), PresenceController.scannerQr);
router.post('/manuel', roleMiddleware(['FORMATEUR', 'ADMIN', 'STAFF']), PresenceController.marquerManuel);
router.post('/qr/generate', roleMiddleware(['FORMATEUR', 'ADMIN', 'STAFF']), PresenceController.generateQr);
router.get('/session/:sessionId', roleMiddleware(['ADMIN', 'STAFF', 'FORMATEUR']), PresenceController.findBySession);
router.get('/session/:sessionId/stats', roleMiddleware(['ADMIN', 'STAFF', 'FORMATEUR']), PresenceController.stats);
router.get('/session/:sessionId/participant/:participantId/taux', PresenceController.tauxPresence);

export default router;