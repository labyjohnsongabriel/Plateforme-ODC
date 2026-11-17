// src/routes/index.ts
/**
 * =============================================================================
 * 📦 ROUTEUR PRINCIPAL
 * =============================================================================
 */
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadAvatar } from '../middlewares/upload.middleware';
import { ProfileController } from '../controllers/profile.controller';

// =============================================================================
// 📥 ROUTEURS
// =============================================================================
import publicRoutes from './public.routes';
import authRoutes from './auth.routes';
import sessionRoutes from './session.routes';

// ⭐ NOUVEAU — routes /users/me (profil de l'utilisateur connecté)
import userRoutes from './user.routes';

// Routes par rôle
import adminRoutes from './admin.routes';
import staffRoutes from './staff.routes';
import formateurRoutes from './formateur.routes';
import participantRoutes from './participant.routes';
import partenaireRoutes from './partenaire.routes';

// Routes communes (tous rôles authentifiés)
import dashboardRoutes from './dashboard.routes';
import messagerieRoutes from './messagerie.routes';
import notificationRoutes from './notification.routes';
import uploadRoutes from './upload.routes';
import reseautageRoutes from './reseautage.routes';

// ⭐ PRÉSENCES
import presenceRoutes from './presence.routes';

// =============================================================================
// 📥 CONTRÔLEURS
// =============================================================================
import { HealthController } from '../controllers/health.controller';

const router = Router();

// =============================================================================
// 🩺 HEALTHCHECKS (publics)
// =============================================================================
router.get('/health', HealthController.check);
router.get('/health/live', HealthController.live);
router.get('/health/ready', HealthController.ready);
router.get('/health/db', HealthController.db);

// =============================================================================
// 🌐 ROUTES PUBLIQUES (sans authentification)
// =============================================================================
router.use('/public', publicRoutes);
router.use('/sessions', sessionRoutes);

// =============================================================================
// 🔑 AUTHENTIFICATION
// =============================================================================
router.use('/auth', authRoutes);

// ⭐ ROUTES /users/me — profil personnel (tous rôles authentifiés)
//    → GET    /api/users/me
//    → PUT    /api/users/me
//    → PATCH  /api/users/me
//    → POST   /api/users/me/avatar
//    → PUT    /api/users/me/password
router.use('/users', userRoutes);

// =============================================================================
// 🔒 ROUTES PAR RÔLE
// =============================================================================
router.use('/admin', adminRoutes);
router.use('/staff', staffRoutes);
router.use('/formateur', formateurRoutes);
router.use('/participant', participantRoutes);
router.use('/partenaire', partenaireRoutes);

// ⭐ PRÉSENCES — URL = /api/presences/*
router.use('/presences', presenceRoutes);

// =============================================================================
// 🔒 ROUTES COMMUNES À TOUS LES RÔLES AUTHENTIFIÉS
// =============================================================================
router.use('/dashboard', dashboardRoutes);
router.use('/messagerie', messagerieRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads', uploadRoutes);
router.use('/reseau', reseautageRoutes);

export default router;
