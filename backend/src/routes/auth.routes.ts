// src/routes/auth.routes.ts
import { Router } from 'express';                         // ✅ CORRECT
import { AuthController } from '../controllers/auth.controller'; // ✅ CORRECT
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

/* ============================================================
 *  🌐 PUBLIC
 * ============================================================ */

// Inscription
// POST /api/auth/register
router.post(
  '/register',
  validateRequest(registerSchema),
  AuthController.register,
);

// Connexion
// POST /api/auth/login
router.post(
  '/login',
  validateRequest(loginSchema),
  AuthController.login,
);

// Rafraîchir les tokens
// POST /api/auth/refresh
router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  AuthController.refresh,
);

// Mot de passe oublié
// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword,
);

// Réinitialisation du mot de passe
// POST /api/auth/reset-password
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword,
);

/* ============================================================
 *  🔒 AUTHENTIFIÉ
 * ============================================================ */

// Profil courant
// GET /api/auth/me
router.get('/me', authMiddleware, AuthController.me);

// Changement de mot de passe
// POST /api/auth/change-password
router.post(
  '/change-password',
  authMiddleware,
  validateRequest(changePasswordSchema),
  AuthController.changePassword,
);

export default router;