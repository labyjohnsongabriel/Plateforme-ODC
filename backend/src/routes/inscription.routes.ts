import { Router } from 'express';
import { InscriptionController } from '../controllers/inscription.controller';
import { authMiddleware, roleMiddleware, validate, paginationMiddleware } from '../middlewares';
import { createInscriptionSchema } from '../validators/inscription.validator';

const router = Router();
router.use(authMiddleware);
router.use(paginationMiddleware);

router.get('/', InscriptionController.findAll);
router.get('/:id', InscriptionController.findOne);
router.post('/', roleMiddleware(['PARTICIPANT']), validate(createInscriptionSchema), InscriptionController.create);
router.patch('/:id/selectionner', roleMiddleware(['ADMIN', 'STAFF']), InscriptionController.selectionner);
router.delete('/:id', roleMiddleware(['PARTICIPANT']), InscriptionController.annuler);

export default router;