// src/routes/staff.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { RoleName } from '../entities/enums';
import { uploadImage, uploadDocument } from '../middlewares/upload.middleware';

import { DashboardController }    from '../controllers/dashboard.controller';
import { FormationController }    from '../controllers/formation.controller';
import { SessionController }      from '../controllers/session.controller';
import { SelectionController }    from '../controllers/selection.controller';
import { InscriptionController }  from '../controllers/inscription.controller';
import { PresenceController }     from '../controllers/presence.controller';
import { AttestationController }  from '../controllers/attestation.controller';
import { EvaluationController }   from '../controllers/evaluation.controller';
import { NoteController }         from '../controllers/note.controller';
import { RessourceController }    from '../controllers/ressource.controller';
import { PartenaireController }   from '../controllers/partenaire.controller';

const router = Router();

// 🔒 STAFF_ODC + ADMINISTRATEUR
router.use(authMiddleware);
router.use(roleMiddleware([RoleName.STAFF_ODC, RoleName.ADMINISTRATEUR]));

/* ============================================================
 *  📊 TABLEAU DE BORD
 * ============================================================ */
// GET /api/staff/dashboard
router.get('/dashboard', DashboardController.staffStats);

/* ============================================================
 *  📚 FORMATIONS (création / modification / publication)
 * ============================================================ */
// GET    /api/staff/formations
router.get   ('/formations',               FormationController.findAll);
// GET    /api/staff/formations/:id
router.get   ('/formations/:id',           FormationController.findOne);
// POST   /api/staff/formations
router.post  ('/formations',               FormationController.create);
// PUT    /api/staff/formations/:id
router.put   ('/formations/:id',           FormationController.update);
// PUT    /api/staff/formations/:id/publier
router.put   ('/formations/:id/publier',   FormationController.publier);
// POST   /api/staff/formations/:id/image
router.post  ('/formations/:id/image',
  uploadImage.single('image'),
  FormationController.uploadImage,
);
// DELETE /api/staff/formations/:id
router.delete('/formations/:id',           FormationController.delete);

/* ============================================================
 *  📅 SESSIONS
 * ============================================================ */
// GET    /api/staff/sessions
router.get   ('/sessions',                     SessionController.findAll);
// GET    /api/staff/sessions/:id
router.get   ('/sessions/:id',                 SessionController.findOne);
// POST   /api/staff/sessions
router.post  ('/sessions',                     SessionController.create);
// PUT    /api/staff/sessions/:id
router.put   ('/sessions/:id',                 SessionController.update);
// PUT    /api/staff/sessions/:id/statut
router.put   ('/sessions/:id/statut',          SessionController.changerStatut);
// PUT    /api/staff/sessions/:id/publier
router.put   ('/sessions/:id/publier',         SessionController.publier);
// PUT    /api/staff/sessions/:id/ouvrir-presence
router.put   ('/sessions/:id/ouvrir-presence', SessionController.ouvrirPresence);
// DELETE /api/staff/sessions/:id
router.delete('/sessions/:id',                 SessionController.delete);

/* ============================================================
 *  📝 INSCRIPTIONS & SÉLECTION DES CANDIDATS
 * ============================================================ */
// GET    /api/staff/inscriptions/session/:sessionId
router.get ('/inscriptions/session/:sessionId',
  SelectionController.candidatsParSession,
);
// PUT    /api/staff/inscriptions/:id/selectionner
router.put ('/inscriptions/:id/selectionner', InscriptionController.selectionner);
// POST   /api/staff/selections/session/:sessionId/selectionner (en masse)
router.post('/selections/session/:sessionId/selectionner',
  SelectionController.selectionnerEnMasse,
);
// POST   /api/staff/selections/auto/:sessionId (sélection automatique)
router.post('/selections/auto/:sessionId',    SelectionController.selectionAutomatique);
// GET    /api/staff/selections/stats/:sessionId
router.get ('/selections/stats/:sessionId',   SelectionController.stats);
// DELETE /api/staff/selections/session/:sessionId/reset
router.delete('/selections/session/:sessionId/reset', SelectionController.reset);

/* ============================================================
 *  ✅ PRÉSENCES (QR + manuel)
 * ============================================================ */
// GET    /api/staff/presences/session/:sessionId
router.get ('/presences/session/:sessionId', PresenceController.findBySession);
// GET    /api/staff/presences/stats/:sessionId
router.get ('/presences/stats/:sessionId',   PresenceController.stats);
// POST   /api/staff/presences/manuelle
router.post('/presences/manuelle',           PresenceController.marquerManuel);

/* ============================================================
 *  📊 ÉVALUATIONS & NOTES
 * ============================================================ */
// GET    /api/staff/evaluations
router.get ('/evaluations',                  EvaluationController.findAll);
// POST   /api/staff/evaluations
router.post('/evaluations',                  EvaluationController.create);
// PUT    /api/staff/evaluations/:id
router.put ('/evaluations/:id',              EvaluationController.update);
// PUT    /api/staff/evaluations/:id/publier
router.put ('/evaluations/:id/publier',      EvaluationController.publier);
// POST   /api/staff/evaluations/:evaluationId/notes
router.post('/evaluations/:evaluationId/notes', EvaluationController.saisirNote);
// DELETE /api/staff/evaluations/:id
router.delete('/evaluations/:id',            EvaluationController.delete);

// GET    /api/staff/notes
router.get ('/notes',                        NoteController.findAll);
// DELETE /api/staff/notes/:id
router.delete('/notes/:id',                  NoteController.delete);

/* ============================================================
 *  🎓 ATTESTATIONS (génération)
 * ============================================================ */
// POST   /api/staff/attestations/generer
router.post('/attestations/generer',                    AttestationController.genererUne);
// POST   /api/staff/attestations/generer-session/:sessionId
router.post('/attestations/generer-session/:sessionId', AttestationController.genererParSession);
// GET    /api/staff/attestations
router.get ('/attestations',                            AttestationController.findAll);

/* ============================================================
 *  📎 RESSOURCES PÉDAGOGIQUES
 * ============================================================ */
// GET    /api/staff/ressources/session/:sessionId
router.get ('/ressources/session/:sessionId', RessourceController.findBySession);
// POST   /api/staff/ressources
router.post('/ressources',
  uploadDocument.single('fichier'),
  RessourceController.create,
);
// PUT    /api/staff/ressources/:id
router.put ('/ressources/:id',                RessourceController.update);
// DELETE /api/staff/ressources/:id
router.delete('/ressources/:id',              RessourceController.delete);

/* ============================================================
 *  🤝 PARTENAIRES (gestion)
 * ============================================================ */
// GET    /api/staff/partenaires
router.get ('/partenaires',              PartenaireController.findAll);
// POST   /api/staff/partenaires
router.post('/partenaires',              PartenaireController.create);
// PUT    /api/staff/partenaires/:id
router.put ('/partenaires/:id',          PartenaireController.update);
// POST   /api/staff/partenaires/:id/logo
router.post('/partenaires/:id/logo',
  uploadImage.single('logo'),
  PartenaireController.uploadLogo,
);

export default router;