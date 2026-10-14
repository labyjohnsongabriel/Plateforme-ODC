// src/routes/messagerie.routes.ts
import { Router } from 'express';
import { MessagerieController } from '../controllers/messagerie.controller';  // ⭐ LIGNE CRITIQUE
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadImage } from '../middlewares/upload.middleware';

const router = Router();

/* ============================================================================
   🔒 SÉCURITÉ GLOBALE
   ============================================================================ */

router.use(authMiddleware);

/* ============================================================================
   💬 CONVERSATIONS
   ============================================================================ */

// GET /api/messagerie/conversations
router.get('/conversations', MessagerieController.mesConversations);

// POST /api/messagerie/conversations/privee
router.post(
  '/conversations/privee',
  MessagerieController.createPrivate,
);

// POST /api/messagerie/conversations/groupe
router.post(
  '/conversations/groupe',
  uploadImage.single('photo'),
  MessagerieController.createGroupe,
);

// GET /api/messagerie/conversations/:id
router.get('/conversations/:id', MessagerieController.getConversation);

// GET /api/messagerie/conversations/:id/messages
router.get(
  '/conversations/:id/messages',
  MessagerieController.getMessages,
);

// POST /api/messagerie/conversations/:id/messages
router.post(
  '/conversations/:id/messages',
  MessagerieController.envoyer,
);

// PUT /api/messagerie/conversations/:id/lu
router.put(
  '/conversations/:id/lu',
  MessagerieController.marquerLus,
);

/* ============================================================================
   📩 NOTIFICATIONS
   ============================================================================ */

// GET /api/messagerie/non-lus
router.get('/non-lus', MessagerieController.countNonLus);

export default router;