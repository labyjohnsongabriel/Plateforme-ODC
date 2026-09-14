import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { authMiddleware, roleMiddleware, validate, paginationMiddleware } from '../middlewares';
import { createSessionSchema } from '../validators/session.validator';

const router = Router();
router.use(authMiddleware);
router.use(paginationMiddleware);

router.get('/', SessionController.findAll);
router.get('/mes-sessions', roleMiddleware(['FORMATEUR']), SessionController.mesSessions);
router.get('/:id', SessionController.findOne);

router.post('/', roleMiddleware(['ADMIN', 'STAFF']), validate(createSessionSchema), SessionController.create);
router.put('/:id', roleMiddleware(['ADMIN', 'STAFF']), SessionController.update);
router.patch('/:id/statut', roleMiddleware(['ADMIN', 'STAFF']), SessionController.changerStatut);
router.delete('/:id', roleMiddleware(['ADMIN']), SessionController.delete);

export default router;