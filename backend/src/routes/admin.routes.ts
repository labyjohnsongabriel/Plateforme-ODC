// src/routes/admin.routes.ts
import { Router } from 'express';

/* ============================================================================
   MIDDLEWARES
   ============================================================================ */

import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { uploadImage } from '../middlewares/upload.middleware';

/* ============================================================================
   ENUMS
   ============================================================================ */

import { RoleName } from '../entities/enums';

/* ============================================================================
   CONTROLLERS
   ============================================================================ */

import { DashboardController } from '../controllers/dashboard.controller';
import { UserController } from '../controllers/user.controller';
import { RoleController } from '../controllers/role.controller';
import { FormationController } from '../controllers/formation.controller';
import { SessionController } from '../controllers/session.controller';
import { PartenaireController } from '../controllers/partenaire.controller';
import { AttestationController } from '../controllers/attestation.controller';
import { DomaineController } from '../controllers/domaine.controller';
import { AuditLogController } from '../controllers/auditLog.controller';
import { ExportController } from '../controllers/export.controller';

/* ============================================================================
   VALIDATORS
   ============================================================================ */

import {
  createDomaineSchema,
  updateDomaineSchema,
} from '../validators/domaine.validator';

/* ============================================================================
   ROUTER
   ============================================================================ */

const router = Router();

/* ============================================================================
   🔒 SÉCURITÉ GLOBALE
   ⚠️ Toutes les routes ci-dessous nécessitent :
   - authMiddleware : token JWT valide
   - roleMiddleware : rôle ADMINISTRATEUR
   ============================================================================ */

router.use(authMiddleware);
router.use(roleMiddleware([RoleName.ADMINISTRATEUR]));

/* ============================================================================
   📊 DASHBOARD
   ⚠️ Routes spécifiques AVANT la route principale
   ============================================================================ */

// GET /api/admin/dashboard/status
router.get('/dashboard/status', DashboardController.systemStatus);

// GET /api/admin/dashboard/top-formations
router.get(
  '/dashboard/top-formations',
  DashboardController.topFormations,
);

// GET /api/admin/dashboard
router.get('/dashboard', DashboardController.adminStats);

/* ============================================================================
   👥 UTILISATEURS
   ⚠️ ORDRE CRITIQUE : spécifiques AVANT génériques
   ============================================================================ */

/* -------------------- Statistiques -------------------- */
// GET /api/admin/users/stats/roles
router.get('/users/stats/roles', UserController.stats);

/* -------------------- Liste & création -------------------- */
// GET /api/admin/users
router.get('/users', UserController.findAll);

// POST /api/admin/users
router.post('/users', UserController.create);

/* -------------------- Actions spécifiques -------------------- */
// PUT /api/admin/users/:id/role
router.put('/users/:id/role', UserController.changeRole);

// PUT /api/admin/users/:id/actif
router.put('/users/:id/actif', UserController.toggleActif);

// POST /api/admin/users/:id/reset-password
router.post(
  '/users/:id/reset-password',
  UserController.resetPassword,
);

/* -------------------- Détail & mise à jour -------------------- */
// GET /api/admin/users/:id
router.get('/users/:id', UserController.findOne);

// PUT /api/admin/users/:id
router.put('/users/:id', UserController.update);

/* -------------------- Suppression -------------------- */
// DELETE /api/admin/users/:id
router.delete('/users/:id', UserController.delete);

/* ============================================================================
   🛡️ RÔLES & PERMISSIONS
   ⚠️ ORDRE CRITIQUE : spécifiques AVANT génériques
   ============================================================================ */

/* -------------------- Stats -------------------- */
// GET /api/admin/roles/stats
router.get('/roles/stats', RoleController.getStats);

// GET /api/admin/roles/permissions
router.get('/roles/permissions', RoleController.listPermissions);

/* -------------------- Liste & création -------------------- */
// GET /api/admin/roles
router.get('/roles', RoleController.findAll);

// POST /api/admin/roles
router.post('/roles', RoleController.create);

/* -------------------- Détail & mise à jour -------------------- */
// GET /api/admin/roles/:id
router.get('/roles/:id', RoleController.findOne);

// PUT /api/admin/roles/:id
router.put('/roles/:id', RoleController.update);

/* -------------------- Suppression -------------------- */
// DELETE /api/admin/roles/:id
router.delete('/roles/:id', RoleController.delete);

/* ============================================================================
   🏷️ DOMAINES
   ⚠️ ORDRE CRITIQUE : spécifiques AVANT génériques
   ============================================================================ */

/* -------------------- Stats -------------------- */
// GET /api/admin/domaines/stats/formations
router.get(
  '/domaines/stats/formations',
  DomaineController.statsByDomaine,
);

/* -------------------- Liste & création -------------------- */
// GET /api/admin/domaines
router.get('/domaines', DomaineController.findAll);

// POST /api/admin/domaines
router.post(
  '/domaines',
  validateRequest(createDomaineSchema),
  DomaineController.create,
);

/* -------------------- Actions spécifiques -------------------- */
// PUT /api/admin/domaines/:id/publier
router.put('/domaines/:id/publier', DomaineController.publier);

// POST /api/admin/domaines/:id/image
router.post(
  '/domaines/:id/image',
  uploadImage.single('image'),
  DomaineController.uploadImage,
);

/* -------------------- Détail & mise à jour -------------------- */
// GET /api/admin/domaines/:id
router.get('/domaines/:id', DomaineController.findOne);

// PUT /api/admin/domaines/:id
router.put(
  '/domaines/:id',
  validateRequest(updateDomaineSchema),
  DomaineController.update,
);

/* -------------------- Suppression -------------------- */
// DELETE /api/admin/domaines/:id
router.delete('/domaines/:id', DomaineController.delete);

/* ============================================================================
   📚 FORMATIONS
   ⚠️ ORDRE CRITIQUE : spécifiques AVANT génériques
   ============================================================================ */

/* -------------------- Stats -------------------- */
// GET /api/admin/formations/stats/domaines
router.get(
  '/formations/stats/domaines',
  FormationController.statsByDomaine,
);

/* -------------------- Liste & création -------------------- */
// GET /api/admin/formations
router.get('/formations', FormationController.findAll);

// POST /api/admin/formations
router.post('/formations', FormationController.create);

/* -------------------- Actions spécifiques -------------------- */
// PUT /api/admin/formations/:id/publier
router.put('/formations/:id/publier', FormationController.publier);

// POST /api/admin/formations/:id/image
router.post(
  '/formations/:id/image',
  uploadImage.single('image'),
  FormationController.uploadImage,
);

/* -------------------- Détail & mise à jour -------------------- */
// GET /api/admin/formations/:id
router.get('/formations/:id', FormationController.findOne);

// PUT /api/admin/formations/:id
router.put('/formations/:id', FormationController.update);

/* -------------------- Suppression -------------------- */
// DELETE /api/admin/formations/:id
router.delete('/formations/:id', FormationController.delete);

/* ============================================================================
   📅 SESSIONS
   ⚠️ ORDRE CRITIQUE : spécifiques AVANT génériques
   ============================================================================ */

/* -------------------- Stats -------------------- */
// GET /api/admin/sessions/stats
router.get('/sessions/stats', SessionController.getStats);

/* -------------------- Liste & création -------------------- */
// GET /api/admin/sessions
router.get('/sessions', SessionController.findAll);

// POST /api/admin/sessions
router.post('/sessions', SessionController.create);

/* -------------------- ⭐ Actions spécifiques (AVANT /:id) -------------------- */
// GET /api/admin/sessions/:id/inscriptions
// ⭐⭐ CRITIQUE : doit être AVANT GET /sessions/:id
router.get(
  '/sessions/:id/inscriptions',
  SessionController.getInscriptions,
);

// GET /api/admin/sessions/:id/presences
// ⭐⭐ CRITIQUE : doit être AVANT GET /sessions/:id
router.get(
  '/sessions/:id/presences',
  SessionController.getPresences,
);

// PUT /api/admin/sessions/:id/statut
router.put('/sessions/:id/statut', SessionController.changerStatut);

// PUT /api/admin/sessions/:id/publier
router.put('/sessions/:id/publier', SessionController.publier);

// PUT /api/admin/sessions/:id/ouvrir-presence
router.put(
  '/sessions/:id/ouvrir-presence',
  SessionController.ouvrirPresence,
);

/* -------------------- Détail & mise à jour -------------------- */
// GET /api/admin/sessions/:id
router.get('/sessions/:id', SessionController.findOne);

// PUT /api/admin/sessions/:id
router.put('/sessions/:id', SessionController.update);

/* -------------------- Suppression -------------------- */
// DELETE /api/admin/sessions/:id
router.delete('/sessions/:id', SessionController.delete);

/* ============================================================================
   🤝 PARTENAIRES
   ⚠️ ORDRE CRITIQUE : spécifiques AVANT génériques
   ============================================================================ */

/* -------------------- Liste & création -------------------- */
// GET /api/admin/partenaires
router.get('/partenaires', PartenaireController.findAll);

// POST /api/admin/partenaires
router.post('/partenaires', PartenaireController.create);

/* -------------------- Actions spécifiques -------------------- */
// POST /api/admin/partenaires/:id/logo
router.post(
  '/partenaires/:id/logo',
  uploadImage.single('logo'),
  PartenaireController.uploadLogo,
);

// PUT /api/admin/partenaires/:id/publier
router.put(
  '/partenaires/:id/publier',
  PartenaireController.publier,
);

/* -------------------- Détail & mise à jour -------------------- */
// GET /api/admin/partenaires/:id
router.get('/partenaires/:id', PartenaireController.findOne);

// PUT /api/admin/partenaires/:id
router.put('/partenaires/:id', PartenaireController.update);

/* -------------------- Suppression -------------------- */
// DELETE /api/admin/partenaires/:id
router.delete('/partenaires/:id', PartenaireController.delete);

/* ============================================================================
   🎓 ATTESTATIONS
   ⚠️ ORDRE CRITIQUE : spécifiques AVANT génériques
   ============================================================================ */

/* -------------------- Stats & Aperçu -------------------- */
// GET /api/admin/attestations/stats
router.get('/attestations/stats', AttestationController.stats);

// GET /api/admin/attestations/preview-session/:sessionId
router.get(
  '/attestations/preview-session/:sessionId',
  AttestationController.previewSession,
);

// GET /api/admin/attestations/eligibilite/:sessionId/:participantId
router.get(
  '/attestations/eligibilite/:sessionId/:participantId',
  AttestationController.verifierEligibilite,
);

/* -------------------- Génération -------------------- */
// POST /api/admin/attestations/generer-une
router.post(
  '/attestations/generer-une',
  AttestationController.genererUne,
);

// POST /api/admin/attestations/generer-session/:sessionId
router.post(
  '/attestations/generer-session/:sessionId',
  AttestationController.genererParSession,
);

/* -------------------- Liste -------------------- */
// GET /api/admin/attestations
router.get('/attestations', AttestationController.findAll);

/* -------------------- Actions spécifiques -------------------- */
// PUT /api/admin/attestations/:id/invalider
router.put(
  '/attestations/:id/invalider',
  AttestationController.invalider,
);

// PUT /api/admin/attestations/:id/reactiver
router.put(
  '/attestations/:id/reactiver',
  AttestationController.reactiver,
);

// GET /api/admin/attestations/:id/telecharger
router.get(
  '/attestations/:id/telecharger',
  AttestationController.telecharger,
);

// GET /api/admin/attestations/:id/voir
router.get('/attestations/:id/voir', AttestationController.voir);

/* -------------------- Détail -------------------- */
// GET /api/admin/attestations/:id
// ⚠️ EN DERNIER pour ne pas capturer les routes ci-dessus
router.get('/attestations/:id', AttestationController.findOne);

/* ============================================================================
   📜 AUDIT LOGS
   ⚠️ ORDRE CRITIQUE : spécifiques AVANT génériques
   ============================================================================ */

/* -------------------- Stats -------------------- */
// GET /api/admin/audit-logs/stats
router.get('/audit-logs/stats', AuditLogController.stats);

/* -------------------- Par utilisateur -------------------- */
// GET /api/admin/audit-logs/user/:userId
router.get(
  '/audit-logs/user/:userId',
  AuditLogController.findByUser,
);

/* -------------------- Liste -------------------- */
// GET /api/admin/audit-logs
router.get('/audit-logs', AuditLogController.findAll);

/* -------------------- Détail -------------------- */
// GET /api/admin/audit-logs/:id
// ⚠️ EN DERNIER
router.get('/audit-logs/:id', AuditLogController.findOne);

/* ============================================================================
   📤 EXPORTS
   ⚠️ ORDRE CRITIQUE : spécifiques AVANT génériques
   ============================================================================ */

/* -------------------- Stats -------------------- */
// GET /api/admin/exports/stats
router.get('/exports/stats', ExportController.stats);

/* -------------------- Utilisateurs -------------------- */
// GET /api/admin/exports/utilisateurs/csv
router.get(
  '/exports/utilisateurs/csv',
  ExportController.utilisateursCSV,
);

// GET /api/admin/exports/utilisateurs/pdf
router.get(
  '/exports/utilisateurs/pdf',
  ExportController.utilisateursPDF,
);

/* -------------------- Formations -------------------- */
// GET /api/admin/exports/formations/csv
router.get(
  '/exports/formations/csv',
  ExportController.formationsCSV,
);

// GET /api/admin/exports/formations/pdf
router.get(
  '/exports/formations/pdf',
  ExportController.formationsPDF,
);

router.get('/formations/:id', FormationController.findOne);

// PUT /api/admin/formations/:id
router.put('/formations/:id', FormationController.update);

// DELETE /api/admin/formations/:id
router.delete('/formations/:id', FormationController.delete);

/* -------------------- Inscriptions -------------------- */
// GET /api/admin/exports/inscriptions/csv
router.get(
  '/exports/inscriptions/csv',
  ExportController.inscriptionsCSV,
);

// GET /api/admin/exports/inscriptions/pdf
router.get(
  '/exports/inscriptions/pdf',
  ExportController.inscriptionsPDF,
);

/* -------------------- Attestations -------------------- */
// GET /api/admin/exports/attestations/csv
router.get(
  '/exports/attestations/csv',
  ExportController.attestationsCSV,
);

// GET /api/admin/exports/attestations/pdf
router.get(
  '/exports/attestations/pdf',
  ExportController.attestationsPDF,
);

/* -------------------- Sessions -------------------- */
// GET /api/admin/exports/sessions/csv
router.get('/exports/sessions/csv', ExportController.sessionsCSV);

// GET /api/admin/exports/sessions/pdf
router.get('/exports/sessions/pdf', ExportController.sessionsPDF);

/* -------------------- Partenaires -------------------- */
// GET /api/admin/exports/partenaires/csv
router.get(
  '/exports/partenaires/csv',
  ExportController.partenairesCSV,
);

// GET /api/admin/exports/partenaires/pdf
router.get(
  '/exports/partenaires/pdf',
  ExportController.partenairesPDF,
);

/* -------------------- Domaines -------------------- */
// GET /api/admin/exports/domaines/csv
router.get('/exports/domaines/csv', ExportController.domainesCSV);

// GET /api/admin/exports/domaines/pdf
router.get('/exports/domaines/pdf', ExportController.domainesPDF);

/* -------------------- Audit Logs -------------------- */
// GET /api/admin/exports/audit-logs/csv
router.get(
  '/exports/audit-logs/csv',
  ExportController.auditLogsCSV,
);

// GET /api/admin/exports/audit-logs/pdf
router.get(
  '/exports/audit-logs/pdf',
  ExportController.auditLogsPDF,
);

/* -------------------- Export complet (ZIP) -------------------- */
// GET /api/admin/exports/complet
router.get('/exports/complet', ExportController.complet);

/* -------------------- Export personnalisé -------------------- */
// POST /api/admin/exports/custom
router.post('/exports/custom', ExportController.custom);

/* ============================================================================
   EXPORT
   ============================================================================ */

export default router;