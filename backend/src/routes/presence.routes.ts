// src/routes/presence.routes.ts
import { Router } from 'express';
import { PresenceController } from '../controllers/presence.controller';
import {
  authMiddleware,
  roleMiddleware,
  paginationMiddleware,
} from '../middlewares';

const router = Router();

/* ============================================================================
   MIDDLEWARE GLOBAL
   ============================================================================ */

router.use(authMiddleware);

/* ============================================================================
   PARTICIPANT
   ============================================================================ */

router.post(
  '/scanner',
  roleMiddleware(['PARTICIPANT']),
  PresenceController.scannerQr,
);

router.get(
  '/me',
  roleMiddleware(['PARTICIPANT']),
  PresenceController.mesPresences,
);

/* ============================================================================
   FORMATEUR / STAFF / ADMIN
   ============================================================================ */

router.post(
  '/manuel',
  roleMiddleware(['FORMATEUR', 'STAFF_ODC', 'ADMINISTRATEUR']),
  PresenceController.marquerManuel,
);

router.post(
  '/qr/generate',
  roleMiddleware(['FORMATEUR', 'STAFF_ODC', 'ADMINISTRATEUR']),
  PresenceController.generateQr,
);

router.put(
  '/session/:sessionId/ouvrir',
  roleMiddleware(['FORMATEUR', 'STAFF_ODC', 'ADMINISTRATEUR']),
  PresenceController.ouvrirPresences,
);

router.put(
  '/session/:sessionId/fermer',
  roleMiddleware(['FORMATEUR', 'STAFF_ODC', 'ADMINISTRATEUR']),
  PresenceController.fermerPresences,
);
router.get(
  '/presences/session/:sessionId',
  roleMiddleware(['PARTICIPANT']),
  PresenceController.getParticipantPresenceDetail,
);


/* ============================================================================
   CONSULTATION (pagination sur listes)
   ============================================================================ */

router.get(
  '/session/:sessionId',
  roleMiddleware(['ADMINISTRATEUR', 'STAFF_ODC', 'FORMATEUR']),
  paginationMiddleware,
  PresenceController.findBySession,
);

router.get(
  '/session/:sessionId/stats',
  roleMiddleware(['ADMINISTRATEUR', 'STAFF_ODC', 'FORMATEUR']),
  PresenceController.stats,
);

router.get(
  '/session/:sessionId/participant/:participantId/taux',
  roleMiddleware(['ADMINISTRATEUR', 'STAFF_ODC', 'FORMATEUR']),
  PresenceController.tauxPresence,
);

export default router;