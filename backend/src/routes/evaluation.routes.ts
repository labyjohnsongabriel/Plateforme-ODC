import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluation.controller';
import { authMiddleware, roleMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);

router.get('/', EvaluationController.findAll);
router.post('/', roleMiddleware(['FORMATEUR', 'ADMIN']), EvaluationController.create);
router.get('/session/:sessionId', EvaluationController.findBySession);
router.post('/:evaluationId/notes', roleMiddleware(['FORMATEUR', 'ADMIN']), EvaluationController.saisirNote);
router.get('/session/:sessionId/participant/:participantId/moyenne', EvaluationController.moyenne);

export default router;