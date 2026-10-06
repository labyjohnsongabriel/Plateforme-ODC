// src/routes/formateur.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { RoleName } from '../entities/enums';
import { uploadDocument } from '../middlewares/upload.middleware';

// =============================================================================
// CONTRÔLEURS (PascalCase — chemins corrigés ✅)
// =============================================================================
import { DashboardController }   from '../controllers/dashboard.controller';
import { SessionController }     from '../controllers/session.controller';
import { PresenceController }    from '../controllers/presence.controller';
import { EvaluationController }  from '../controllers/evaluation.controller';
import { NoteController }        from '../controllers/note.controller';
import { RessourceController }   from '../controllers/ressource.controller';

const router = Router();

// =============================================================================
// 🔒 SÉCURITÉ
// =============================================================================
router.use(authMiddleware);
router.use(roleMiddleware([
  RoleName.FORMATEUR,
  RoleName.STAFF_ODC,
  RoleName.ADMINISTRATEUR,
]));

// =============================================================================
// 📊 TABLEAU DE BORD
// =============================================================================
router.get('/dashboard', DashboardController.formateurStats);

// =============================================================================
// 📅 MES SESSIONS
// =============================================================================
router.get ('/sessions',                  SessionController.mesSessions);
router.get ('/sessions/:id',              SessionController.findOne);
router.get ('/sessions/:id/participants', SessionController.participants);

// =============================================================================
// ✅ PRÉSENCES (QR + manuel)
// =============================================================================
router.post('/presences/qr/generer',         PresenceController.generateQr);
router.get ('/presences/session/:sessionId', PresenceController.findBySession);
router.post('/presences/manuelle',           PresenceController.marquerManuel);
router.get ('/presences/stats/:sessionId',   PresenceController.stats);
router.get ('/presences/taux/:sessionId/:participantId', PresenceController.tauxPresence);

// =============================================================================
// 📊 ÉVALUATIONS
// =============================================================================
router.get   ('/evaluations',                    EvaluationController.findAll);
router.get   ('/evaluations/session/:sessionId', EvaluationController.findBySession);
router.get   ('/evaluations/:id',                EvaluationController.findOne);
router.post  ('/evaluations',                    EvaluationController.create);
router.put   ('/evaluations/:id',                EvaluationController.update);
router.put   ('/evaluations/:id/publier',        EvaluationController.publier);
router.delete('/evaluations/:id',                EvaluationController.delete);

// =============================================================================
// 🖊️ NOTES
// =============================================================================
router.post  ('/evaluations/:evaluationId/notes', EvaluationController.saisirNote);
router.get   ('/notes',                            NoteController.findAll);
router.get   ('/notes/:id',                        NoteController.findOne);
router.get   ('/notes/session/:sessionId/participant/:participantId',
  NoteController.findBySessionAndParticipant,
);
router.delete('/notes/:id',                        NoteController.delete);

// =============================================================================
// 📎 RESSOURCES
// =============================================================================
router.get   ('/ressources/session/:sessionId', RessourceController.findBySession);
router.post  ('/ressources',
  uploadDocument.single('fichier'),
  RessourceController.create,
);
router.put   ('/ressources/:id',                RessourceController.update);
router.delete('/ressources/:id',                RessourceController.delete);

export default router;