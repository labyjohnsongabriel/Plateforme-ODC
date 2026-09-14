import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import formationRoutes from './formation.routes';
import sessionRoutes from './session.routes';
import inscriptionRoutes from './inscription.routes';
import presenceRoutes from './presence.routes';
import attestationRoutes from './attestation.routes';  // ✅
import evaluationRoutes from './evaluation.routes';
import dashboardRoutes from './dashboard.routes';
import notificationRoutes from './notification.routes';
import messagerieRoutes from './messagerie.routes';
import reseautageRoutes from './reseautage.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/formations', formationRoutes);
router.use('/sessions', sessionRoutes);
router.use('/inscriptions', inscriptionRoutes);
router.use('/presences', presenceRoutes);
router.use('/attestations', attestationRoutes);  // ✅ INDISPENSABLE
router.use('/evaluations', evaluationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messagerie', messagerieRoutes);
router.use('/reseautage', reseautageRoutes);

export default router;