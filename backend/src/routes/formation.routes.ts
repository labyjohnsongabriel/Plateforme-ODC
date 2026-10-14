import { Router } from 'express';
import { FormationController } from '../controllers/formation.controller';
import {
  authMiddleware,
<<<<<<< HEAD
  optionalAuthMiddleware,
  roleMiddleware,
  validate,
  paginationMiddleware,
  moderateLimiter,
  auditMiddleware,
  asyncHandler,
=======
  roleMiddleware,
  validate,
  paginationMiddleware,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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
<<<<<<< HEAD
  moderateLimiter,
  validate(createFormationSchema),
  auditMiddleware('CREAT_FORMATION'),
  asyncHandler(FormationController.create)
=======
  validate(createFormationSchema),
  FormationController.create
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
);
router.put(
  '/:id',
  roleMiddleware(['ADMIN', 'STAFF']),
  validate(updateFormationSchema),
  FormationController.update
);
router.delete('/:id', roleMiddleware(['ADMIN']), FormationController.delete);

export default router;