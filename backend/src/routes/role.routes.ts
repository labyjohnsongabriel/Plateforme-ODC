// src/routes/role.routes.ts
// ⚠️ Monté sous /api/admin/roles (voir index.ts)
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { RoleName } from '../entities/enums';
import { RoleController } from '../controllers/RoleController';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware([RoleName.ADMINISTRATEUR]));

// GET /api/admin/roles
router.get   ('/',             RoleController.findAll);
// GET /api/admin/roles/permissions (catalogue complet des permissions)
router.get   ('/permissions',  RoleController.listPermissions);
// GET /api/admin/roles/:id
router.get   ('/:id',          RoleController.findOne);
// POST /api/admin/roles
router.post  ('/',             RoleController.create);
// PUT /api/admin/roles/:id
router.put   ('/:id',          RoleController.update);
// DELETE /api/admin/roles/:id   (rôles système non supprimables)
router.delete('/:id',          RoleController.delete);

export default router;