import { Router } from 'express';
import { ReseautageController } from '../controllers/reseautage.controller';
import { authMiddleware, paginationMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);
router.get('/annuaire', paginationMiddleware, ReseautageController.annuaire);
router.get('/suggestions', ReseautageController.suggestions);
router.get('/connections', ReseautageController.mesConnections);
router.get('/demandes', ReseautageController.demandesEnAttente);
router.post('/demandes', ReseautageController.envoyerDemande);
router.patch('/demandes/:id/repondre', ReseautageController.repondre);
export default router;