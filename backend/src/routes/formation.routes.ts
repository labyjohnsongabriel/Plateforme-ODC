import { Router } from 'express';
import { FormationController } from '../controllers/formation.controller';
import {
  authMiddleware,
  roleMiddleware,
  validate,
  paginationMiddleware,
} from '../middlewares';
import {
  createFormationSchema,
  updateFormationSchema,
} from '../validators/formation.validator';

const router = Router();

router.use(authMiddleware);
router.use(paginationMiddleware);

router.get('/', FormationController.findAll);
router.get('/top', FormationController.top);
router.get('/stats/domaines', roleMiddleware(['ADMIN', 'STAFF']), FormationController.statsByDomaine);
router.get('/:id', FormationController.findOne);

router.post(
  '/',
  roleMiddleware(['ADMIN', 'STAFF']),
  validate(createFormationSchema),
  FormationController.create
);
router.put(
  '/:id',
  roleMiddleware(['ADMIN', 'STAFF']),
  validate(updateFormationSchema),
  FormationController.update
);
router.delete('/:id', roleMiddleware(['ADMIN']), FormationController.delete);

export default router;