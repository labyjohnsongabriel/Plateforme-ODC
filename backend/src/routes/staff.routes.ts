// src/routes/staff.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { RoleName } from '../entities/enums';
import { uploadFormationImage, uploadLogo, uploadDocument } from '../middlewares/upload.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { generateQrSchema, marquerManuelSchema } from '../validators/presence.validator';

import { DashboardController } from '../controllers/dashboard.controller';
import { FormationController } from '../controllers/formation.controller';
import { SessionController } from '../controllers/session.controller';
import { SelectionController } from '../controllers/selection.controller';
import { InscriptionController } from '../controllers/inscription.controller';
import { PresenceController } from '../controllers/presence.controller';
import { AttestationController } from '../controllers/attestation.controller';
import { EvaluationController } from '../controllers/evaluation.controller';
import { NoteController } from '../controllers/note.controller';
import { RessourceController } from '../controllers/ressource.controller';
import { PartenaireController } from '../controllers/partenaire.controller';

const router = Router();

/* 🔒 STAFF_ODC + ADMINISTRATEUR */
router.use(authMiddleware);
router.use(roleMiddleware([RoleName.STAFF_ODC, RoleName.ADMINISTRATEUR]));

/* ═══════════════════════════════════════════════════════════════════════════
   📊 DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/dashboard', DashboardController.staffStats);

/* ═══════════════════════════════════════════════════════════════════════════
   📚 FORMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/formations', FormationController.findAll);
router.post('/formations', FormationController.create);

router.put('/formations/:id/publier', FormationController.publier);
router.post(
  '/formations/:id/image',
  uploadFormationImage.single('image'),
  FormationController.uploadImage
);

router.get('/formations/:id', FormationController.findOne);
router.put('/formations/:id', FormationController.update);
router.delete('/formations/:id', FormationController.delete);

/* ═══════════════════════════════════════════════════════════════════════════
   📅 SESSIONS
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/sessions', SessionController.findAll);
router.post('/sessions', SessionController.create);

router.get('/sessions/:id/participants', SessionController.participants);
router.put('/sessions/:id/statut', SessionController.changerStatut);
router.put('/sessions/:id/publier', SessionController.publier);
router.put('/sessions/:id/ouvrir-presence', SessionController.ouvrirPresence);

router.get('/sessions/:id', SessionController.findOne);
router.put('/sessions/:id', SessionController.update);
router.delete('/sessions/:id', SessionController.delete);

/* ═══════════════════════════════════════════════════════════════════════════
   📋 INSCRIPTIONS
   ⚠️ UNE SEULE route /inscriptions (findAll) — pas de doublon
   ⚠️ /inscriptions/session/:sessionId AVANT /inscriptions/:id
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/inscriptions', InscriptionController.findAll);

router.get('/inscriptions/session/:sessionId', SelectionController.candidatsParSession);

router.get('/inscriptions/:id', InscriptionController.findOne);
router.put('/inscriptions/:id/selectionner', InscriptionController.selectionner);

/* ═══════════════════════════════════════════════════════════════════════════
   📝 SÉLECTIONS (nouvelles routes frontend)
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/selections/session/:sessionId/candidats', SelectionController.findCandidats);
router.put('/selections/:inscriptionId/accepter', SelectionController.accepter);
router.put('/selections/:inscriptionId/refuser', SelectionController.refuser);
router.post('/selections/session/:sessionId/selectionner', SelectionController.selectionnerEnMasse);
router.post('/selections/auto/:sessionId', SelectionController.selectionAutomatique);
router.get('/selections/stats/:sessionId', SelectionController.stats);
router.delete('/selections/session/:sessionId/reset', SelectionController.reset);

/* ═══════════════════════════════════════════════════════════════════════════
   ✅ PRÉSENCES
   ⚠️ statiques AVANT dynamiques
   ═══════════════════════════════════════════════════════════════════════════ */

router.post(
  '/presences/qr/generer',
  validateRequest(generateQrSchema),
  PresenceController.generateQr
);
router.post(
  '/presences/manuelle',
  validateRequest(marquerManuelSchema),
  PresenceController.marquerManuel
);

router.get('/presences/session/:sessionId', PresenceController.findBySession);
router.get('/presences/stats/:sessionId', PresenceController.stats);

/* ═══════════════════════════════════════════════════════════════════════════
   📊 ÉVALUATIONS & NOTES
   ⚠️ /session/:sessionId et /:id/soumissions AVANT /:id
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/evaluations', EvaluationController.findAll);
router.get('/evaluations/session/:sessionId', EvaluationController.findBySession);
router.get('/evaluations/:id/soumissions', EvaluationController.findSubmissions);
router.post('/evaluations/:evaluationId/notes', EvaluationController.saisirNote);
router.get('/evaluations/:id', EvaluationController.findOne);

router.post('/evaluations', EvaluationController.create);
router.put('/evaluations/:id', EvaluationController.update);
router.put('/evaluations/:id/publier', EvaluationController.publier);
router.delete('/evaluations/:id', EvaluationController.delete);

router.get('/notes', NoteController.findAll);
router.delete('/notes/:id', NoteController.delete);

/* ═══════════════════════════════════════════════════════════════════════════
   🎓 ATTESTATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/attestations/stats', AttestationController.stats);
router.get('/attestations/preview-session/:sessionId', AttestationController.previewSession);
router.post('/attestations/generer', AttestationController.genererUne);
router.post('/attestations/generer-session/:sessionId', AttestationController.genererParSession);
router.get('/attestations', AttestationController.findAll);
router.get('/attestations/:id/telecharger', AttestationController.telecharger);
router.get('/attestations/:id', AttestationController.findOne);

/* ═══════════════════════════════════════════════════════════════════════════
   📎 RESSOURCES
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/ressources', RessourceController.findAll);
router.get('/ressources/session/:sessionId', RessourceController.findBySession);
router.post('/ressources', uploadDocument.single('fichier'), RessourceController.create);
router.put('/ressources/:id', RessourceController.update);
router.delete('/ressources/:id', RessourceController.delete);

/* ═══════════════════════════════════════════════════════════════════════════
   🤝 PARTENAIRES
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/partenaires', PartenaireController.findAll);
router.post('/partenaires', PartenaireController.create);
router.post('/partenaires/:id/logo', uploadLogo.single('logo'), PartenaireController.uploadLogo);
router.put('/partenaires/:id', PartenaireController.update);

export default router;
