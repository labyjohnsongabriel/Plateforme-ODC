import { Router } from 'express';
import { AttestationController } from '../controllers/attestation.controller';
import { authMiddleware, roleMiddleware } from '../middlewares';

const router = Router();

// PUBLIC
router.get('/verify/:numero', AttestationController.verifier);

// PROTEGE
router.use(authMiddleware);
router.get('/', roleMiddleware(['ADMIN', 'STAFF']), AttestationController.findAll);
router.get('/mes-attestations', AttestationController.mesAttestations);
router.get('/eligibilite/:sessionId/:participantId', roleMiddleware(['ADMIN', 'STAFF', 'FORMATEUR']), AttestationController.verifierEligibilite);
router.post('/generer', roleMiddleware(['ADMIN', 'STAFF']), AttestationController.genererUne);
router.post('/session/:sessionId/generer-tout', roleMiddleware(['ADMIN', 'STAFF']), AttestationController.genererParSession);

export default router;