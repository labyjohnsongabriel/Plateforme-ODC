import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluation.controller';
import { authMiddleware, roleMiddleware } from '../middlewares';
import { RoleName } from '../entities/enums';

const router = Router();
router.use(authMiddleware);

router.get('/', EvaluationController.findAll);
router.get('/session/:sessionId', EvaluationController.findBySession);
router.get('/:id', EvaluationController.findOne);
router.get('/:id/soumissions', EvaluationController.findSubmissions);
router.post(
  '/',
  roleMiddleware([RoleName.FORMATEUR, RoleName.STAFF_ODC, RoleName.ADMINISTRATEUR]),
  EvaluationController.create,
);
router.put(
  '/:id',
  roleMiddleware([RoleName.FORMATEUR, RoleName.STAFF_ODC, RoleName.ADMINISTRATEUR]),
  EvaluationController.update,
);
router.put(
  '/:id/publier',
  roleMiddleware([RoleName.FORMATEUR, RoleName.STAFF_ODC, RoleName.ADMINISTRATEUR]),
  EvaluationController.publier,
);
router.post(
  '/:id/soumettre',
  EvaluationController.soumettre,
);
router.post(
  '/:id/notes',
  roleMiddleware([RoleName.FORMATEUR, RoleName.STAFF_ODC, RoleName.ADMINISTRATEUR]),
  EvaluationController.saisirNote,
);
router.delete(
  '/:id',
  roleMiddleware([RoleName.FORMATEUR, RoleName.STAFF_ODC, RoleName.ADMINISTRATEUR]),
  EvaluationController.delete,
);
router.get('/session/:sessionId/participant/:participantId/moyenne', EvaluationController.moyenne);

export default router;