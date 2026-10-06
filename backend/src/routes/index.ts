// src/routes/index.ts
/**
 * =============================================================================
 * 📦 ROUTEUR PRINCIPAL
 * =============================================================================
 * Montage de toutes les routes sous /api
 *
 * ⚠️ ORDRE CRITIQUE :
 *   1. Healthchecks
 *   2. Routes publiques
 *   3. Routes authentifiées par rôle
 *   4. Routes communes authentifiées
 * =============================================================================
 */
import { Router } from 'express';

// =============================================================================
// 📥 ROUTEURS
// =============================================================================
import publicRoutes       from './public.routes';
import authRoutes         from './auth.routes';

// Routes par rôle
import adminRoutes        from './admin.routes';      // ⚠️ contient /admin/roles en interne
import staffRoutes        from './staff.routes';
import formateurRoutes    from './formateur.routes';
import participantRoutes  from './participant.routes';
import partenaireRoutes   from './partenaire.routes';

// Routes communes (tous rôles authentifiés)
import dashboardRoutes    from './dashboard.routes';
import messagerieRoutes   from './messagerie.routes';
import notificationRoutes from './notification.routes';
import uploadRoutes       from './upload.routes';

// =============================================================================
// 📥 CONTRÔLEURS
// =============================================================================
import { HealthController } from '../controllers/health.controller'; // ✅ PascalCase

const router = Router();

// =============================================================================
// 🩺 HEALTHCHECKS (publics, pour Docker / K8s / CI)
// =============================================================================
router.get('/health',       HealthController.check);
router.get('/health/live',  HealthController.live);
router.get('/health/ready', HealthController.ready);
router.get('/health/db',    HealthController.db);

// =============================================================================
// 🌐 ROUTES PUBLIQUES (sans authentification)
// =============================================================================
router.use('/public', publicRoutes);

// =============================================================================
// 🔑 AUTHENTIFICATION (mixte : register/login/refresh publics,
//     /me et /change-password protégés en interne)
// =============================================================================
router.use('/auth', authRoutes);

// =============================================================================
// 🔒 ROUTES PAR RÔLE
// =============================================================================
// ⚠️ Les routes /admin/roles sont définies DANS admin.routes.ts
//    (voir admin.routes.ts → section "🎭 RÔLES & PERMISSIONS")
router.use('/admin',       adminRoutes);       // ADMINISTRATEUR (contient /roles, /domaines, etc.)
router.use('/staff',       staffRoutes);       // STAFF_ODC + ADMIN
router.use('/formateur',   formateurRoutes);   // FORMATEUR + STAFF + ADMIN
router.use('/participant', participantRoutes); // PARTICIPANT
router.use('/partenaire',  partenaireRoutes);  // PARTENAIRE + ADMIN

// =============================================================================
// 🔒 ROUTES COMMUNES À TOUS LES RÔLES AUTHENTIFIÉS
// =============================================================================
router.use('/dashboard',     dashboardRoutes);
router.use('/messagerie',    messagerieRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads',       uploadRoutes);

export default router;