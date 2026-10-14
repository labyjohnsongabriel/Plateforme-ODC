<<<<<<< HEAD
import { Router } from 'express';
import { PartenaireController } from '../controllers/partenaire.controller';
import { authMiddleware, roleMiddleware, paginationMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);
router.use(paginationMiddleware);
router.get('/', PartenaireController.findAll);
router.get('/:id', PartenaireController.findOne);
router.post('/', roleMiddleware(['ADMIN']), PartenaireController.create);
router.put('/:id', roleMiddleware(['ADMIN']), PartenaireController.update);
router.delete('/:id', roleMiddleware(['ADMIN']), PartenaireController.delete);
=======
// src/routes/partenaire.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { RoleName } from '../entities/enums';
import { uploadImage } from '../middlewares/upload.middleware';

import { DashboardController }    from '../controllers/dashboard.controller';
import { FormationController }    from '../controllers/formation.controller';
import { SessionController }      from '../controllers/session.controller';
import { PartenaireController }   from '../controllers/partenaire.controller';
import { ProfileController }      from '../controllers/profile.controller';

const router = Router();

// 🔒 PARTENAIRE + ADMINISTRATEUR
router.use(authMiddleware);
router.use(roleMiddleware([RoleName.PARTENAIRE, RoleName.ADMINISTRATEUR]));

/* ============================================================
 *  📊 TABLEAU DE BORD
 * ============================================================ */
// GET /api/partenaire/dashboard
router.get('/dashboard', DashboardController.partenaireStats);

/* ============================================================
 *  👤 PROFIL PARTENAIRE
 * ============================================================ */
// GET  /api/partenaire/profil
router.get ('/profil',     ProfileController.me);
// PUT  /api/partenaire/profil
router.put ('/profil',     ProfileController.update);
// POST /api/partenaire/profil/logo
router.post('/profil/logo',
  uploadImage.single('logo'),
  ProfileController.uploadLogo,
);

/* ============================================================
 *  📚 CONSULTATION DES FORMATIONS PUBLIQUES
 * ============================================================ */
// GET /api/partenaire/formations
router.get ('/formations',      FormationController.listPublic);
// GET /api/partenaire/formations/:slug
router.get ('/formations/:slug', FormationController.detailPublic);

/* ============================================================
 *  📅 CONSULTATION DES SESSIONS PUBLIQUES
 * ============================================================ */
// GET /api/partenaire/sessions
router.get ('/sessions',              SessionController.listPublic);
// GET /api/partenaire/sessions/:codeSession
router.get ('/sessions/:codeSession', SessionController.detailPublic);

/* ============================================================
 *  🤝 PARTENARIATS (consultation + mise à jour de sa fiche)
 * ============================================================ */
// GET  /api/partenaire/fiche
router.get ('/fiche',           PartenaireController.moi);
// PUT  /api/partenaire/fiche
router.put ('/fiche',           PartenaireController.updateMoi);

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export default router;