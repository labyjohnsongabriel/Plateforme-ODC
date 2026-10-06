// src/routes/participant.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { RoleName } from '../entities/enums';
import { uploadImage } from '../middlewares/upload.middleware';

import { DashboardController }    from '../controllers/dashboard.controller';
import { InscriptionController }  from '../controllers/inscription.controller';
import { PresenceController }     from '../controllers/presence.controller';
import { AttestationController }  from '../controllers/attestation.controller';
import { EvaluationController }   from '../controllers/evaluation.controller';
import { NoteController }         from '../controllers/note.controller';
import { RessourceController }    from '../controllers/ressource.controller';
import { ReseautageController }   from '../controllers/reseautage.controller';
import { ProfileController }      from '../controllers/profile.controller';
// src/routes/participant.routes.ts

const router = Router();

// 🔒 PARTICIPANT uniquement
router.use(authMiddleware);
router.use(roleMiddleware([RoleName.PARTICIPANT]));

// =============================================================================
// 📊 TABLEAU DE BORD
// =============================================================================
router.get('/dashboard', DashboardController.participantStats);

// =============================================================================
// 👤 PROFIL
// =============================================================================
router.get ('/profil',              ProfileController.me);
router.put ('/profil',              ProfileController.update);
router.get ('/profil/stats',        ProfileController.stats);
router.get ('/profil/public/:id',   ProfileController.getPublicProfile);
router.put ('/profil/visibilite',   ProfileController.toggleVisibilite);

router.post('/profil/photo',
  uploadImage.single('photo'),
  ProfileController.uploadPhoto,
);
router.delete('/profil/photo',      ProfileController.deletePhoto);

router.post('/profil/couverture',
  uploadImage.single('couverture'),
  ProfileController.uploadCouverture,
);
router.delete('/profil/couverture', ProfileController.deleteCouverture);

// =============================================================================
// 📝 INSCRIPTIONS AUX SESSIONS
// =============================================================================
router.post  ('/inscriptions',      InscriptionController.create);
router.get   ('/inscriptions',      InscriptionController.findAll);
router.get   ('/inscriptions/:id',  InscriptionController.findOne);
router.delete('/inscriptions/:id',  InscriptionController.annuler);

// =============================================================================
// ✅ PRÉSENCE PAR QR CODE
// =============================================================================
router.post('/presences/scanner', PresenceController.scannerQr);
router.get ('/presences',         PresenceController.mesPresences);

// =============================================================================
// 📊 ÉVALUATIONS & NOTES
// =============================================================================
router.get ('/evaluations/session/:sessionId',  EvaluationController.findBySession);
router.get ('/notes',                           NoteController.mesNotes);

// =============================================================================
// 🎓 MES ATTESTATIONS
// =============================================================================
router.get ('/attestations',                 AttestationController.mesAttestations);
router.get ('/attestations/:id/telecharger', AttestationController.telecharger);

// =============================================================================
// 📎 RESSOURCES (consultation)
// =============================================================================
router.get ('/ressources/session/:sessionId', RessourceController.findBySession);
router.post('/ressources/:id/telecharger',    RessourceController.telecharger);

// =============================================================================
// 🤝 RÉSEAUTAGE
// =============================================================================
router.get ('/reseau/annuaire',                     ReseautageController.annuaire);
router.get ('/reseau/suggestions',                  ReseautageController.suggestions);
router.get ('/reseau/connections',                  ReseautageController.mesConnections);
router.get ('/reseau/demandes/en-attente',          ReseautageController.demandesEnAttente);
router.get ('/reseau/demandes/envoyees',            ReseautageController.demandesEnvoyees);
router.post('/reseau/demandes/:destinataireId',     ReseautageController.envoyerDemande);
router.put ('/reseau/demandes/:id',                 ReseautageController.repondre);
router.delete('/reseau/connections/:id',            ReseautageController.supprimerConnection);
router.get ('/reseau/stats',                        ReseautageController.stats);

export default router;