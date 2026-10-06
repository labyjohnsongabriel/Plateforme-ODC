// src/routes/public.routes.ts
import { Router } from 'express';

import { FormationController }    from '../controllers/formation.controller';
import { SessionController }      from '../controllers/session.controller';
import { PartenaireController }   from '../controllers/partenaire.controller';
import { AttestationController }  from '../controllers/attestation.controller';
import { InscriptionController }  from '../controllers/inscription.controller';
import { DomaineController }      from '../controllers/domaine.controller';

const router = Router();

/* ============================================================
 *  📚 CATALOGUE DE FORMATIONS (cahier des charges)
 * ============================================================ */

// Liste des formations publiées + actives (pagination, filtres)
// GET /api/public/formations?page=1&limit=10&domaine=web&niveau=DEBUTANT&q=react
router.get('/formations',        FormationController.listPublic);

// Top formations mises en avant (page d'accueil)
// GET /api/public/formations/top?limit=6
router.get('/formations/top',    FormationController.topPublic);

// Détail d'une formation par slug (page publique dédiée)
// GET /api/public/formations/developpement-web-react
router.get('/formations/:slug',  FormationController.detailPublic);

/* ============================================================
 *  📅 SESSIONS PUBLIQUES
 * ============================================================ */

// Sessions ouvertes et publiées (planning public)
// GET /api/public/sessions?page=1&limit=10&statut=OUVERTE
router.get('/sessions',                SessionController.listPublic);

// Détail d'une session par codeSession
// GET /api/public/sessions/ODC-2025-001
router.get('/sessions/:codeSession',   SessionController.detailPublic);

/* ============================================================
 *  🏷️ DOMAINES (catégories de formation)
 * ============================================================ */

// Liste des domaines actifs avec icône/image
// GET /api/public/domaines
router.get('/domaines',           DomaineController.listPublic);

// Détail d'un domaine par slug
// GET /api/public/domaines/developpement-web
router.get('/domaines/:slug',     DomaineController.detailPublic);

/* ============================================================
 *  🤝 PARTENAIRES PUBLICS
 * ============================================================ */

// Partenaires publiés avec logo
// GET /api/public/partenaires
router.get('/partenaires',         PartenaireController.listPublic);

// Détail d'un partenaire
// GET /api/public/partenaires/orange
router.get('/partenaires/:slug',   PartenaireController.detailPublic);

/* ============================================================
 *  🎓 VÉRIFICATION D'ATTESTATION (scan QR)
 * ============================================================ */

// Vérification publique d'une attestation par numéro
// GET /api/public/attestations/verifier/ODC-ATT-2025-000123
router.get('/attestations/verifier/:numero', AttestationController.verifyPublic);

/* ============================================================
 *  📝 INSCRIPTION PUBLIQUE EN LIGNE
 * ============================================================ */

// Inscription en ligne sans compte (création auto d'un participant)
// POST /api/public/inscriptions
router.post('/inscriptions', InscriptionController.createPublic);

export default router;