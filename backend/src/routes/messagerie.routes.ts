import { Router } from 'express';
import { MessagerieController } from '../controllers/messagerie.controller';
import { authMiddleware, paginationMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);
router.get('/conversations', MessagerieController.mesConversations);
router.post('/conversations/private', MessagerieController.createPrivate);
router.post('/conversations/groupe', MessagerieController.createGroupe);
router.get('/conversations/:conversationId/messages', paginationMiddleware, MessagerieController.getMessages);
router.post('/conversations/:conversationId/messages', MessagerieController.envoyer);
router.patch('/conversations/:conversationId/lire', MessagerieController.marquerLus);
router.get('/non-lus/count', MessagerieController.countNonLus);
export default router;