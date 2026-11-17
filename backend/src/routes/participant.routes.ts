// src/routes/participant.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { RoleName } from '../entities/enums';
import {
  uploadAvatar,
  uploadCouverture,
} from '../middlewares/upload.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { scanQrSchema } from '../validators/presence.validator';

import { DashboardController } from '../controllers/dashboard.controller';
import { InscriptionController } from '../controllers/inscription.controller';
import { PresenceController } from '../controllers/presence.controller';
import { AttestationController } from '../controllers/attestation.controller';
import { EvaluationController } from '../controllers/evaluation.controller';
import { NoteController } from '../controllers/note.controller';
import { RessourceController } from '../controllers/ressource.controller';
import { ReseautageController } from '../controllers/reseautage.controller';
import { ProfileController } from '../controllers/profile.controller';

const router = Router();

/* 🔒 PARTICIPANT uniquement */
router.use(authMiddleware);
router.use(roleMiddleware([RoleName.PARTICIPANT]));

/* ═══════════════════════════════════════════════════════════════════════════
   📊 DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/dashboard', DashboardController.participantStats);

/* ═══════════════════════════════════════════════════════════════════════════
   👤 PROFIL
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/profil', ProfileController.me);
router.put('/profil', ProfileController.update);
router.patch('/profil', ProfileController.update);
router.get('/profil/stats', ProfileController.stats);
router.get('/profil/public/:id', ProfileController.getPublicProfile);
router.put('/profil/visibilite', ProfileController.toggleVisibilite);

router.post(
  '/profil/photo',
  uploadAvatar.single('photo'),
  ProfileController.uploadPhoto,
);
router.delete('/profil/photo', ProfileController.deletePhoto);

router.post(
  '/profil/couverture',
  uploadCouverture.single('couverture'),
  ProfileController.uploadCouverture,
);
router.delete('/profil/couverture', ProfileController.deleteCouverture);

/* ═══════════════════════════════════════════════════════════════════════════
   📝 INSCRIPTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/inscriptions', InscriptionController.mesInscriptions);
router.post('/inscriptions', InscriptionController.create);
router.get('/inscriptions/:id', InscriptionController.findOne);
router.delete('/inscriptions/:id', InscriptionController.annuler);

/* ═══════════════════════════════════════════════════════════════════════════
   ✅ PRÉSENCES
   ═══════════════════════════════════════════════════════════════════════════ */

router.post(
  '/presences/scanner',
  validateRequest(scanQrSchema),
  PresenceController.scannerQr,
);
router.get('/presences', PresenceController.mesPresences);
router.get(
  '/presences/session/:sessionId',
  PresenceController.getParticipantPresenceDetail,
);

/* ═══════════════════════════════════════════════════════════════════════════
   📊 ÉVALUATIONS & NOTES
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/evaluations', EvaluationController.findAll);
router.get(
  '/evaluations/session/:sessionId',
  EvaluationController.findBySession,
);
router.get('/evaluations/:id', EvaluationController.findOne);
router.post('/evaluations/:id/soumettre', EvaluationController.soumettre);

router.get('/notes', NoteController.mesNotes);

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ ATTESTATIONS
   ⚠️ ORDRE CRITIQUE : routes spécifiques AVANT dynamiques
   ═══════════════════════════════════════════════════════════════════════════ */

// GET /api/participant/attestations — liste
router.get('/attestations', AttestationController.mesAttestations);

// GET /api/participant/attestations/:id/telecharger — PDF
router.get(
  '/attestations/:id/telecharger',
  AttestationController.telecharger,
);

// GET /api/participant/attestations/:id/voir — PDF inline
router.get(
  '/attestations/:id/voir',
  AttestationController.voir,
);

router.post(
  '/attestations/:id/envoyer',
  AttestationController.envoyerParEmail,
);
// GET /api/participant/attestations/:id — détail (avec vérification propriété)
router.get(
  '/attestations/:id',
  AttestationController.findOneForParticipant,
);

/* ═══════════════════════════════════════════════════════════════════════════
   📎 RESSOURCES
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/ressources', RessourceController.findForParticipant);
router.get(
  '/ressources/session/:sessionId',
  RessourceController.findBySession,
);
router.post(
  '/ressources/:id/telecharger',
  RessourceController.telecharger,
);

/* ═══════════════════════════════════════════════════════════════════════════
   🤝 RÉSEAUTAGE
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/reseau/annuaire', ReseautageController.annuaire);
router.get('/reseau/suggestions', ReseautageController.suggestions);
router.get('/reseau/connections', ReseautageController.mesConnections);

router.get('/reseau/profil/:id', ReseautageController.getProfil);

router.get(
  '/reseau/demandes/en-attente',
  ReseautageController.demandesEnAttente,
);
router.get(
  '/reseau/demandes/envoyees',
  ReseautageController.demandesEnvoyees,
);
router.post(
  '/reseau/demandes/:destinataireId',
  ReseautageController.envoyerDemande,
);
router.put('/reseau/demandes/:id', ReseautageController.repondre);

router.delete(
  '/reseau/connections/:id',
  ReseautageController.supprimerConnection,
);

router.get('/reseau/stats', ReseautageController.stats);

export default router;