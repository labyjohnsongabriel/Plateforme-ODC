import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, roleMiddleware, paginationMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);
router.use(paginationMiddleware);

router.get('/', roleMiddleware(['ADMIN', 'STAFF']), UserController.findAll);
router.get('/stats', roleMiddleware(['ADMIN']), UserController.stats);
router.get('/:id', UserController.findOne);
router.put('/:id', UserController.update);
router.post('/', roleMiddleware(['ADMIN']), UserController.create);
router.patch('/:id/role', roleMiddleware(['ADMIN']), UserController.changeRole);
router.patch('/:id/actif', roleMiddleware(['ADMIN']), UserController.toggleActif);
router.delete('/:id', roleMiddleware(['ADMIN']), UserController.delete);

export default router;