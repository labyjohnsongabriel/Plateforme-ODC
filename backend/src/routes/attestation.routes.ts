// src/routes/attestation.routes.ts
import { Router } from 'express';
import { AttestationController } from '../controllers/attestation.controller';
import { authMiddleware, roleMiddleware } from '../middlewares';

const router = Router();

/* ============================================================================
   RÔLES
   ============================================================================ */

const ADMIN = 'ADMINISTRATEUR';
const STAFF = 'STAFF_ODC';
const FORMATEUR = 'FORMATEUR';

const ADMIN_OR_STAFF = roleMiddleware([ADMIN, STAFF]);
const ADMIN_OR_STAFF_OR_FORMATEUR = roleMiddleware([ADMIN, STAFF, FORMATEUR]);

/* ============================================================================
   🌐 ROUTES PUBLIQUES
   ⚠️ Déclarées AVANT router.use(authMiddleware)
   ============================================================================ */

router.get('/verifier/:numero', AttestationController.verifyPublic);
router.get('/verify/:numero', AttestationController.verifyPublic);

/* ============================================================================
   🔒 ROUTES PROTÉGÉES
   ============================================================================ */
router.use(authMiddleware);

/* ----------------------------------------------------------------------------
   PARTICIPANT
   ---------------------------------------------------------------------------- */
router.get('/mes-attestations', AttestationController.mesAttestations);

/* ----------------------------------------------------------------------------
   ⭐ ROUTES STATIQUES — AVANT /:id
   ---------------------------------------------------------------------------- */

// GET /api/admin/attestations/stats
router.get('/stats', ADMIN_OR_STAFF, AttestationController.stats);

// GET /api/admin/attestations/preview-session/:sessionId
router.get(
  '/preview-session/:sessionId',
  ADMIN_OR_STAFF_OR_FORMATEUR,
  AttestationController.previewSession,
);

// GET /api/admin/attestations/eligibilite/:sessionId/:participantId
router.get(
  '/eligibilite/:sessionId/:participantId',
  ADMIN_OR_STAFF_OR_FORMATEUR,
  AttestationController.verifierEligibilite,
);

/* ----------------------------------------------------------------------------
   ⭐ GÉNÉRATION — AVANT /:id
   ---------------------------------------------------------------------------- */

// POST /api/admin/attestations/generer  (une seule)
router.post(
  '/generer',
  ADMIN_OR_STAFF,
  AttestationController.genererUne,
);

// ⭐ POST /api/admin/attestations/session/:sessionId/generer-tout  (batch)
router.post(
  '/session/:sessionId/generer-tout',
  ADMIN_OR_STAFF,
  AttestationController.genererParSession,
);

/* ----------------------------------------------------------------------------
   ADMIN / STAFF — invalider / réactiver
   ---------------------------------------------------------------------------- */
router.patch(
  '/:id/invalider',
  ADMIN_OR_STAFF,
  AttestationController.invalider,
);

router.patch(
  '/:id/reactiver',
  ADMIN_OR_STAFF,
  AttestationController.reactiver,
);

/* ----------------------------------------------------------------------------
   TÉLÉCHARGEMENT
   ---------------------------------------------------------------------------- */
router.get('/:id/telecharger', AttestationController.telecharger);
router.get('/:id/voir', AttestationController.voir);

/* ----------------------------------------------------------------------------
   Liste + détail — EN DERNIER
   ---------------------------------------------------------------------------- */
router.get('/', ADMIN_OR_STAFF, AttestationController.findAll);
router.get('/:id', ADMIN_OR_STAFF, AttestationController.findOne);

export default router;