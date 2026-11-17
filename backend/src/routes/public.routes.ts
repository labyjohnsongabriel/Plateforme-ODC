// src/routes/public.routes.ts
import { Router } from 'express';
import rateLimit from 'express-rate-limit';   // ⭐ IMPORT MANQUANT — cause du crash

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROLLERS
   ⚠️ CASSE EXACTE des noms de fichiers (PascalCase)
   ═══════════════════════════════════════════════════════════════════════════ */

import { FormationController } from '../controllers/formation.controller';
import { SessionController } from '../controllers/session.controller';
import { PartenaireController } from '../controllers/partenaire.controller';
import { AttestationController } from '../controllers/attestation.controller';
import { InscriptionController } from '../controllers/inscription.controller';
import { PublicTeamController } from '../controllers/publicTeam.controller';
import { DomaineController } from '../controllers/domaine.controller';
import { PublicFormationController } from '../controllers/publicFormation.controller';
import { PublicController } from '../controllers/public.controller';
import { PublicContactController } from '../controllers/public-contact.controller';

const router = Router();

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ RATE LIMITER CONTACT — déclaré AVANT son utilisation
   ═══════════════════════════════════════════════════════════════════════════ */

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,                    // 5 messages max par IP par heure
  message: {
    success: false,
    message: 'Trop de messages envoyés. Réessayez dans une heure.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ═══════════════════════════════════════════════════════════════════════════
   📊 STATS GLOBALES
   ⚠️ Routes STATIQUES AVANT les routes dynamiques
   ═══════════════════════════════════════════════════════════════════════════ */

// GET /api/public/stats
router.get('/stats', PublicController.stats);

// GET /api/public/users/count?role=PARTICIPANT
router.get('/users/count', PublicController.usersCount);

// GET /api/public/attestations/count  ⚠️ AVANT /attestations/verifier/:numero
router.get('/attestations/count', PublicController.attestationsCount);

/* ═══════════════════════════════════════════════════════════════════════════
   📬 CONTACT
   ═══════════════════════════════════════════════════════════════════════════ */

// POST /api/public/contact
router.post('/contact', contactLimiter, PublicContactController.send);

/* ═══════════════════════════════════════════════════════════════════════════
   📚 FORMATIONS
   ⚠️ /formations/top AVANT /formations/:slug
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/formations/top', FormationController.topPublic);
router.get('/formations', FormationController.listPublic);
router.get(
  '/formations/:id/temoignages',
  PublicFormationController.getTemoignages,
);
router.get('/formations/:slug', FormationController.detailPublic);

/* ═══════════════════════════════════════════════════════════════════════════
   📅 SESSIONS
   ⚠️ /sessions/formation/:id AVANT /sessions/:codeSession
   ═══════════════════════════════════════════════════════════════════════════ */

router.get(
  '/sessions/formation/:formationId',
  SessionController.listPublicByFormation,
);
router.get('/sessions', SessionController.listPublic);
router.get('/sessions/:codeSession', SessionController.detailPublic);

/* ═══════════════════════════════════════════════════════════════════════════
   🏷️ DOMAINES
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/domaines', DomaineController.listPublic);
router.get('/domaines/:slug', DomaineController.detailPublic);

/* ═══════════════════════════════════════════════════════════════════════════
   🎓 ÉQUIPE
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/team', PublicTeamController.findAll);

/* ═══════════════════════════════════════════════════════════════════════════
   🤝 PARTENAIRES
   ═══════════════════════════════════════════════════════════════════════════ */

router.get('/partenaires', PartenaireController.listPublic);
router.get('/partenaires/:slug', PartenaireController.detailPublic);

/* ═══════════════════════════════════════════════════════════════════════════
   🎓 VÉRIFICATION D'ATTESTATION
   ═══════════════════════════════════════════════════════════════════════════ */

// GET /api/public/attestations/verifier/ATT-2026-000123
router.get(
  '/attestations/verifier/:numero',
  AttestationController.verifyPublic,
);

/* ═══════════════════════════════════════════════════════════════════════════
   📝 INSCRIPTION PUBLIQUE
   ═══════════════════════════════════════════════════════════════════════════ */

router.post('/inscriptions', InscriptionController.createPublic);

export default router;