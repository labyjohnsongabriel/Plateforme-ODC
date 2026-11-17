// src/routes/dashboard.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { DashboardController } from '../controllers/dashboard.controller';
import { RoleName } from '../models/Role.entity';

const router = Router();

/* ═══════════════════════════════════════════════════════════════════════════
   MIDDLEWARE GLOBAL
   ═══════════════════════════════════════════════════════════════════════════ */

/** Toutes les routes du dashboard exigent un JWT valide */
router.use(authMiddleware);

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTES UNIFIÉES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * GET /api/dashboard/me
 * Retourne les statistiques selon le rôle de l'utilisateur connecté.
 * Accessible à TOUS les rôles authentifiés.
 */
router.get('/me', DashboardController.myStats);

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTES PAR RÔLE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * GET /api/dashboard/admin
 * Statistiques administrateur.
 */
router.get(
  '/admin',
  roleMiddleware([RoleName.ADMINISTRATEUR]),
  DashboardController.adminStats,
);

/**
 * GET /api/dashboard/staff
 * Statistiques staff ODC.
 */
router.get(
  '/staff',
  roleMiddleware([RoleName.STAFF_ODC, RoleName.ADMINISTRATEUR]),
  DashboardController.staffStats,
);

/**
 * GET /api/dashboard/formateur
 * Statistiques formateur.
 */
router.get(
  '/formateur',
  roleMiddleware([RoleName.FORMATEUR, RoleName.ADMINISTRATEUR]),
  DashboardController.formateurStats,
);

/**
 * GET /api/dashboard/participant
 * Statistiques participant.
 */
router.get(
  '/participant',
  roleMiddleware([RoleName.PARTICIPANT, RoleName.ADMINISTRATEUR]),
  DashboardController.participantStats,
);

/**
 * GET /api/dashboard/partenaire
 * Statistiques partenaire.
 */
router.get(
  '/partenaire',
  roleMiddleware([RoleName.PARTENAIRE, RoleName.ADMINISTRATEUR]),
  DashboardController.partenaireStats,
);

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTES ADMIN SPÉCIFIQUES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * GET /api/dashboard/top-formations
 * Top N formations par inscriptions (admin uniquement).
 */
router.get(
  '/top-formations',
  roleMiddleware([RoleName.ADMINISTRATEUR]),
  DashboardController.topFormations,
);

/**
 * GET /api/dashboard/status
 * État du système (DB, API, uptime…).
 */
router.get(
  '/status',
  roleMiddleware([RoleName.ADMINISTRATEUR]),
  DashboardController.systemStatus,
);

export default router;