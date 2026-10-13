<<<<<<< HEAD
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
=======
// src/routes/messagerie.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { MessagerieController } from '../controllers/messagerie.controller';

const router = Router();

router.use(authMiddleware);

/* ============================================================
 *  💬 CONVERSATIONS
 * ============================================================ */
// GET  /api/messagerie/conversations
router.get ('/conversations',          MessagerieController.mesConversations);
// POST /api/messagerie/conversations/privee
router.post('/conversations/privee',   MessagerieController.createPrivate);
// POST /api/messagerie/conversations/groupe
router.post('/conversations/groupe',   MessagerieController.createGroupe);
// GET  /api/messagerie/conversations/:id
router.get ('/conversations/:id',      MessagerieController.getConversation);

/* ============================================================
 *  ✉️ MESSAGES
 * ============================================================ */
// GET  /api/messagerie/conversations/:id/messages
router.get ('/conversations/:id/messages', MessagerieController.getMessages);
// POST /api/messagerie/conversations/:id/messages
router.post('/conversations/:id/messages', MessagerieController.envoyer);
// PUT  /api/messagerie/conversations/:id/lus
router.put ('/conversations/:id/lus',      MessagerieController.marquerLus);
// DELETE /api/messagerie/messages/:id
router.delete('/messages/:id',             MessagerieController.supprimerMessage);

/* ============================================================
 *  🔔 COMPTEURS
 * ============================================================ */
// GET /api/messagerie/non-lus/count
router.get('/non-lus/count', MessagerieController.countNonLus);

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export default router;