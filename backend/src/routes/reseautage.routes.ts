// src/routes/reseau.routes.ts
import { Router } from 'express';
import { ReseautageController } from '../controllers/reseautage.controller';
import { authMiddleware, paginationMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);

// Annuaire
router.get('/annuaire', paginationMiddleware, ReseautageController.annuaire);

// ⭐ NOUVEAU : Profil d'un membre
router.get('/profil/:id', ReseautageController.getProfil);

// Suggestions
router.get('/suggestions', ReseautageController.suggestions);

// Connexions
router.get('/connections', ReseautageController.mesConnections);
router.delete('/connections/:id', ReseautageController.supprimerConnection);

// Demandes
router.get('/demandes/en-attente', ReseautageController.demandesEnAttente);
router.get('/demandes/envoyees', ReseautageController.demandesEnvoyees);
router.post('/demandes/:destinataireId', ReseautageController.envoyerDemande);
router.patch('/demandes/:id/repondre', ReseautageController.repondre);
// Compatibilité avec le frontend qui envoie PUT /demandes/:id
router.put('/demandes/:id', ReseautageController.repondre);
// Alias pour /demandes (reçues)
router.get('/demandes', ReseautageController.demandesEnAttente);

// Stats
router.get('/stats', ReseautageController.stats);

export default router;