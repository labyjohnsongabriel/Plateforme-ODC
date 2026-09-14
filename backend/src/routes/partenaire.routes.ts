import { Router } from 'express';
import { PartenaireController } from '../controllers/partenaire.controller';
import { authMiddleware, roleMiddleware, paginationMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);
router.use(paginationMiddleware);
router.get('/', PartenaireController.findAll);
router.get('/:id', PartenaireController.findOne);
router.post('/', roleMiddleware(['ADMIN']), PartenaireController.create);
router.put('/:id', roleMiddleware(['ADMIN']), PartenaireController.update);
router.delete('/:id', roleMiddleware(['ADMIN']), PartenaireController.delete);
export default router;