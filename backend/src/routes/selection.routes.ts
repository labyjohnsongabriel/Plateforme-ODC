import { Router } from 'express';
import { SelectionController } from '../controllers/selection.controller';
import { authMiddleware, roleMiddleware, validate, paginationMiddleware } from '../middlewares';
import { selectionSchema, selectionMasseSchema } from '../validators/selection.validator';

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'STAFF']));

router.get('/session/:sessionId/candidats', paginationMiddleware, SelectionController.candidatsParSession);
router.get('/stats/:sessionId', SelectionController.stats);

router.post(
  '/session/:sessionId/selectionner',
  validate(selectionMasseSchema),
  SelectionController.selectionnerEnMasse
);
router.post('/auto/:sessionId', SelectionController.selectionAutomatique);
router.delete('/session/:sessionId/reset', SelectionController.reset);

export default router;