import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Role } from '../models/Role.entity';
import { Permission } from '../models/Permission.entity';
import { authMiddleware, roleMiddleware, invalidatePermissionCache } from '../middlewares';
import { successResponse } from '../utils/response.util';
import { NotFoundError } from '../errors/AppError';

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/', async (_req, res, next) => {
  try {
    const roles = await AppDataSource.getRepository(Role).find({
      relations: ['permissions'],
      order: { nom: 'ASC' },
    });
    return successResponse(res, roles);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const role = await AppDataSource.getRepository(Role).findOne({
      where: { id: req.params.id },
      relations: ['permissions', 'users'],
    });
    if (!role) throw new NotFoundError('Rôle introuvable');
    return successResponse(res, role);
  } catch (e) { next(e); }
});

router.get('/:id/permissions', async (req, res, next) => {
  try {
    const role = await AppDataSource.getRepository(Role).findOne({
      where: { id: req.params.id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundError('Rôle introuvable');
    return successResponse(res, role.permissions || []);
  } catch (e) { next(e); }
});

router.post('/:id/permissions', async (req, res, next) => {
  try {
    const { permissionIds } = req.body;
    const roleRepo = AppDataSource.getRepository(Role);

    const role = await roleRepo.findOne({
      where: { id: req.params.id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundError('Rôle introuvable');

    const permissions = await AppDataSource.getRepository(Permission).findByIds(permissionIds);
    role.permissions = permissions;
    await roleRepo.save(role);

    invalidatePermissionCache();
    return successResponse(res, role, 'Permissions mises à jour');
  } catch (e) { next(e); }
});

router.get('/permissions/all', async (_req, res, next) => {
  try {
    const permissions = await AppDataSource.getRepository(Permission).find({
      order: { categorie: 'ASC', code: 'ASC' },
    });
    return successResponse(res, permissions);
  } catch (e) { next(e); }
});

export default router;