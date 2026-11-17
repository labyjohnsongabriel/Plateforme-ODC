// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import {
  authMiddleware,
  roleMiddleware,
  paginationMiddleware,
} from '../middlewares';
import { uploadAvatar } from '../middlewares/upload.middleware';

const router = Router();

/* Toutes les routes nécessitent une authentification */
router.use(authMiddleware);

/* ═══════════════════════════════════════════════════════════════════════════
   ⚠️  Routes /me — DOIVENT être déclarées AVANT /:id
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/me', UserController.getMe);
router.put('/me', UserController.updateMe);
router.patch('/me', UserController.updateMe); // alias

router.post(
  '/me/avatar',
  uploadAvatar.single('photo'),   // ⚠️ champ "photo" — UNE SEULE FOIS
  UserController.uploadAvatar,
);

router.put('/me/password', UserController.changeMyPassword);
router.patch('/me/password', UserController.changeMyPassword);

/* ═══════════════════════════════════════════════════════════════════════════
   Routes admin / staff (avec pagination + rôles)
   ═══════════════════════════════════════════════════════════════════════════ */

router.use(paginationMiddleware);

/* ⚠️ /stats AVANT /:id */
router.get('/stats', roleMiddleware(['ADMIN']), UserController.stats);

router.get('/', roleMiddleware(['ADMIN', 'STAFF']), UserController.findAll);
router.post('/', roleMiddleware(['ADMIN']), UserController.create);

router.get('/:id', UserController.findOne);
router.put('/:id', UserController.update);

router.patch('/:id/role', roleMiddleware(['ADMIN']), UserController.changeRole);
router.patch('/:id/actif', roleMiddleware(['ADMIN']), UserController.toggleActif);

router.delete('/:id', roleMiddleware(['ADMIN']), UserController.delete);

export default router;