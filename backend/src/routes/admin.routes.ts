// src/routes/admin.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { RoleName } from '../entities/enums';
import { uploadImage } from '../middlewares/upload.middleware';

import { validateRequest } from '../middlewares/validation.middleware';

import { DashboardController }   from '../controllers/dashboard.controller';
import { UserController }        from '../controllers/user.controller';
import { FormationController }   from '../controllers/formation.controller';
import { SessionController }     from '../controllers/session.controller';
import { PartenaireController }  from '../controllers/partenaire.controller';
import { AttestationController } from '../controllers/attestation.controller';
import { DomaineController }     from '../controllers/domaine.controller';
import { AuditLogController }    from '../controllers/auditLog.controller';

const router = Router();

// =============================================================================
// 🔒 SÉCURITÉ GLOBALE — ADMINISTRATEUR uniquement
// =============================================================================
router.use(authMiddleware);

router.use(roleMiddleware([RoleName.ADMINISTRATEUR]));

import {
  createDomaineSchema,
  updateDomaineSchema,
} from '../validators/domaine.validator';

/* ============================================================================
 *  📊 TABLEAU DE BORD
 * ============================================================================ */
// GET /api/admin/dashboard
router.get('/dashboard', DashboardController.adminStats);

/* ============================================================================
 *  👥 GESTION DES UTILISATEURS
 *  ⚠️ /stats/* AVANT /:id
 * ============================================================================ */
// GET    /api/admin/users?role=PARTICIPANT&actif=true&q=...
router.get   ('/users',              UserController.findAll);
// POST   /api/admin/users
router.post  ('/users',              UserController.create);
// GET    /api/admin/users/stats/roles  ← ⚠️ AVANT /users/:id
router.get   ('/users/stats/roles',  UserController.stats);
// GET    /api/admin/users/:id
router.get   ('/users/:id',          UserController.findOne);
// PUT    /api/admin/users/:id
router.put   ('/users/:id',          UserController.update);
// PUT    /api/admin/users/:id/role
router.put   ('/users/:id/role',     UserController.changeRole);
// PUT    /api/admin/users/:id/actif
router.put   ('/users/:id/actif',    UserController.toggleActif);
// DELETE /api/admin/users/:id
router.delete('/users/:id',          UserController.delete);

/* ============================================================================
 *  🏷️ DOMAINES (catégories de formation)
 *  ⚠️ /stats/* AVANT /:id
 * ============================================================================ */
// GET    /api/admin/domaines
router.get   ('/domaines',                   DomaineController.findAll);
// GET    /api/admin/domaines/stats/formations  ← ⚠️ AVANT /domaines/:id
router.get   ('/domaines/stats/formations',  DomaineController.statsByDomaine);
// GET    /api/admin/domaines/:id
router.get   ('/domaines/:id',               DomaineController.findOne);
// POST   /api/admin/domaines
router.post  ('/domaines',validateRequest(createDomaineSchema),
  DomaineController.create,
);
// PUT    /api/admin/domaines/:id
router.put   ('/domaines/:id',validateRequest(updateDomaineSchema),
  DomaineController.update,
);
// PUT    /api/admin/domaines/:id/publier
router.put   ('/domaines/:id/publier',       DomaineController.publier);
// POST   /api/admin/domaines/:id/image
router.post  ('/domaines/:id/image',
  uploadImage.single('image'),
  DomaineController.uploadImage,
);
// DELETE /api/admin/domaines/:id
router.delete('/domaines/:id',               DomaineController.delete);

/* ============================================================================
 *  📚 FORMATIONS (administration totale)
 *  ⚠️ /stats/* AVANT /:id
 * ============================================================================ */
// GET    /api/admin/formations
router.get   ('/formations',                 FormationController.findAll);
// GET    /api/admin/formations/stats/domaines  ← ⚠️ AVANT /formations/:id
router.get   ('/formations/stats/domaines',  FormationController.statsByDomaine);
// GET    /api/admin/formations/:id
router.get   ('/formations/:id',             FormationController.findOne);
// POST   /api/admin/formations
router.post  ('/formations',                 FormationController.create);
// PUT    /api/admin/formations/:id
router.put   ('/formations/:id',             FormationController.update);
// PUT    /api/admin/formations/:id/publier
router.put   ('/formations/:id/publier',     FormationController.publier);
// POST   /api/admin/formations/:id/image
router.post  ('/formations/:id/image',
  uploadImage.single('image'),
  FormationController.uploadImage,
);
// DELETE /api/admin/formations/:id
router.delete('/formations/:id',             FormationController.delete);

/* ============================================================================
 *  📅 SESSIONS
 * ============================================================================ */
// GET    /api/admin/sessions
router.get   ('/sessions',                     SessionController.findAll);
// GET    /api/admin/sessions/:id
router.get   ('/sessions/:id',                 SessionController.findOne);
// POST   /api/admin/sessions
router.post  ('/sessions',                     SessionController.create);
// PUT    /api/admin/sessions/:id
router.put   ('/sessions/:id',                 SessionController.update);
// PUT    /api/admin/sessions/:id/statut
router.put   ('/sessions/:id/statut',          SessionController.changerStatut);
// PUT    /api/admin/sessions/:id/publier
router.put   ('/sessions/:id/publier',         SessionController.publier);
// PUT    /api/admin/sessions/:id/ouvrir-presence
router.put   ('/sessions/:id/ouvrir-presence', SessionController.ouvrirPresence);
// DELETE /api/admin/sessions/:id
router.delete('/sessions/:id',                 SessionController.delete);

/* ============================================================================
 *  🤝 PARTENAIRES
 * ============================================================================ */
// GET    /api/admin/partenaires
router.get   ('/partenaires',              PartenaireController.findAll);
// GET    /api/admin/partenaires/:id
router.get   ('/partenaires/:id',          PartenaireController.findOne);
// POST   /api/admin/partenaires
router.post  ('/partenaires',              PartenaireController.create);
// PUT    /api/admin/partenaires/:id
router.put   ('/partenaires/:id',          PartenaireController.update);
// POST   /api/admin/partenaires/:id/logo
router.post  ('/partenaires/:id/logo',
  uploadImage.single('logo'),
  PartenaireController.uploadLogo,
);
// DELETE /api/admin/partenaires/:id
router.delete('/partenaires/:id',          PartenaireController.delete);

/* ============================================================================
 *  🎓 ATTESTATIONS
 * ============================================================================ */
// GET    /api/admin/attestations
router.get   ('/attestations',                                       AttestationController.findAll);
// POST   /api/admin/attestations/generer
router.post  ('/attestations/generer',                               AttestationController.genererUne);
// POST   /api/admin/attestations/generer-session/:sessionId
router.post  ('/attestations/generer-session/:sessionId',            AttestationController.genererParSession);
// GET    /api/admin/attestations/eligibilite/:sessionId/:participantId
router.get   ('/attestations/eligibilite/:sessionId/:participantId', AttestationController.verifierEligibilite);

/* ============================================================================
 *  📜 AUDIT LOGS
 *  ⚠️ ORDRE CRITIQUE : routes spécifiques AVANT /:id
 * ============================================================================ */
// GET    /api/admin/audit-logs
router.get   ('/audit-logs',              AuditLogController.findAll);
// GET    /api/admin/audit-logs/stats        ← ⚠️ AVANT /:id
router.get   ('/audit-logs/stats',        AuditLogController.stats);
// GET    /api/admin/audit-logs/user/:userId ← ⚠️ AVANT /:id
router.get   ('/audit-logs/user/:userId', AuditLogController.findByUser);
// GET    /api/admin/audit-logs/:id          ← ⚠️ EN DERNIER
router.get   ('/audit-logs/:id',          AuditLogController.findOne);

export default router;