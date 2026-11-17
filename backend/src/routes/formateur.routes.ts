// src/routes/formateur.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { RoleName } from '../entities/enums';
import { uploadDocument } from '../middlewares/upload.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  generateQrSchema,
  marquerManuelSchema,
} from '../validators/presence.validator';

import { DashboardController } from '../controllers/dashboard.controller';
import { SessionController } from '../controllers/session.controller';
import { PresenceController } from '../controllers/presence.controller';
import { EvaluationController } from '../controllers/evaluation.controller';
import { NoteController } from '../controllers/note.controller';
import { RessourceController } from '../controllers/ressource.controller';

const router = Router();

/* 🔒 SÉCURITÉ GLOBALE */
router.use(authMiddleware);
router.use(
  roleMiddleware([
    RoleName.FORMATEUR,
    RoleName.STAFF_ODC,
    RoleName.ADMINISTRATEUR,
  ]),
);

/* ═══════════════════════════════════════════════════════════════════════════
   📊 DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/dashboard', DashboardController.formateurStats);

/* ═══════════════════════════════════════════════════════════════════════════
   📅 SESSIONS
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/sessions', SessionController.mesSessions);
router.get('/sessions/:id/participants', SessionController.participants);
router.put('/sessions/:id/ouvrir-presence', SessionController.ouvrirPresence);
router.get('/sessions/:id', SessionController.findOne);

/* ═══════════════════════════════════════════════════════════════════════════
   ✅ PRÉSENCES
   ⚠️ static AVANT dynamique
   ═══════════════════════════════════════════════════════════════════════════ */

router.post(
  '/presences/qr/generer',
  validateRequest(generateQrSchema),
  PresenceController.generateQr,
);

router.post(
  '/presences/manuelle',
  validateRequest(marquerManuelSchema),
  PresenceController.marquerManuel,
);

router.put(
  '/presences/session/:sessionId/ouvrir',
  PresenceController.ouvrirPresences,
);
router.put(
  '/presences/session/:sessionId/fermer',
  PresenceController.fermerPresences,
);
router.get(
  '/presences/session/:sessionId',
  PresenceController.findBySession,
);

router.get('/presences/stats/:sessionId', PresenceController.stats);
router.get(
  '/presences/taux/:sessionId/:participantId',
  PresenceController.tauxPresence,
);

/* ═══════════════════════════════════════════════════════════════════════════
   📊 ÉVALUATIONS
   ⚠️ ORDRE CRITIQUE : statiques → /session/:sessionId → /:id/sous-route → /:id
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/evaluations', EvaluationController.findAll);
router.get(
  '/evaluations/session/:sessionId',
  EvaluationController.findBySession,
);

/* ⚠️ /:id/soumissions AVANT /:id */
router.get(
  '/evaluations/:id/soumissions',
  EvaluationController.findSubmissions,
);
router.post(
  '/evaluations/:evaluationId/notes',
  EvaluationController.saisirNote,
);

router.get('/evaluations/:id', EvaluationController.findOne);

router.post('/evaluations', EvaluationController.create);
router.put('/evaluations/:id', EvaluationController.update);
router.put('/evaluations/:id/publier', EvaluationController.publier);
router.delete('/evaluations/:id', EvaluationController.delete);

/* ═══════════════════════════════════════════════════════════════════════════
   🖊️ NOTES
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/notes', NoteController.findAll);
router.get(
  '/notes/session/:sessionId/participant/:participantId',
  NoteController.findBySessionAndParticipant,
);
router.get('/notes/:id', NoteController.findOne);
router.delete('/notes/:id', NoteController.delete);

/* ═══════════════════════════════════════════════════════════════════════════
   📎 RESSOURCES
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/ressources', RessourceController.findAll);
router.get(
  '/ressources/session/:sessionId',
  RessourceController.findBySession,
);
router.post(
  '/ressources',
  uploadDocument.single('fichier'),
  RessourceController.create,
);
router.put('/ressources/:id', RessourceController.update);
router.delete('/ressources/:id', RessourceController.delete);

export default router;