// src/controllers/ProfileController.ts
import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service';
import { successResponse } from '../utils/response.util';
import { BadRequestError, ForbiddenError } from '../errors/AppError';
import { RoleName } from '../entities/enums';
import { logger } from '../config/logger';

export class ProfileController {
  // ==========================================================================
  // 👤 CONSULTATION
  // ==========================================================================

  /**
   * GET /api/participant/profil
   * GET /api/partenaire/profil
   * GET /api/formateur/profil
   * GET /api/staff/profil
   * → Renvoie le profil complet de l'utilisateur connecté
   */
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.getProfile(req.userId!);
      return successResponse(res, profile, 'Profil récupéré');
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/participant/profil/public/:id
   * → Profil public d'un autre utilisateur (si profilPublic = true)
   */
  static async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.getPublicProfile(req.params.id);
      return successResponse(res, profile, 'Profil public');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // ✍️ MISE À JOUR
  // ==========================================================================

  /**
   * PUT /api/participant/profil
   * → Met à jour les infos de profil (nom, prénom, bio, ville, etc.)
   * ⚠️ N'autorise PAS la modification du rôle, email, mot de passe
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.updateProfile(req.userId!, req.body);
      logger.info(`📝 Profil mis à jour : ${profile.email}`);
      return successResponse(res, profile, 'Profil mis à jour');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // 🖼️ UPLOADS D'IMAGES
  // ==========================================================================

  /**
   * POST /api/participant/profil/photo
   * → Upload de la photo de profil (avatar)
   * Body : multipart/form-data avec champ `photo`
   */
  static async uploadPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('Aucun fichier fourni');

      const url = `/uploads/avatars/${req.file.filename}`;
      const profile = await profileService.setPhoto(req.userId!, url);

      logger.info(`🖼️ Photo de profil mise à jour : ${profile.email}`);
      return successResponse(res, profile, 'Photo mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/participant/profil/couverture
   * → Upload de la photo de couverture
   * Body : multipart/form-data avec champ `couverture`
   */
  static async uploadCouverture(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('Aucun fichier fourni');

      const url = `/uploads/couvertures/${req.file.filename}`;
      const profile = await profileService.setCouverture(req.userId!, url);

      logger.info(`🖼️ Couverture mise à jour : ${profile.email}`);
      return successResponse(res, profile, 'Couverture mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/partenaire/profil/logo
   * → Upload du logo (réservé au rôle PARTENAIRE)
   * Body : multipart/form-data avec champ `logo`
   */
  static async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('Aucun fichier fourni');
      if (req.userRole !== RoleName.PARTENAIRE && req.userRole !== RoleName.ADMINISTRATEUR) {
        throw new ForbiddenError('Réservé aux partenaires');
      }

      const url = `/uploads/logos/${req.file.filename}`;
      const profile = await profileService.setLogo(req.userId!, url);

      logger.info(`🏷️ Logo partenaire mis à jour : ${profile.email}`);
      return successResponse(res, profile, 'Logo mis à jour');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // 🗑️ SUPPRESSION D'IMAGES
  // ==========================================================================

  /**
   * DELETE /api/participant/profil/photo
   */
  static async deletePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.deletePhoto(req.userId!);
      return successResponse(res, profile, 'Photo supprimée');
    } catch (e) {
      next(e);
    }
  }

  /**
   * DELETE /api/participant/profil/couverture
   */
  static async deleteCouverture(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.deleteCouverture(req.userId!);
      return successResponse(res, profile, 'Couverture supprimée');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // 🔐 SÉCURITÉ DU PROFIL
  // ==========================================================================

  /**
   * PUT /api/participant/profil/visibilite
   * → Active/désactive le profil public (annuaire de réseautage)
   */
  static async toggleVisibilite(req: Request, res: Response, next: NextFunction) {
    try {
      const profilPublic = !!req.body.profilPublic;
      const profile = await profileService.toggleVisibilite(req.userId!, profilPublic);

      logger.info(
        `${profilPublic ? '👁️' : '🔒'} Profil ${profilPublic ? 'public' : 'privé'} : ${profile.email}`,
      );

      return successResponse(
        res,
        profile,
        profilPublic ? 'Profil rendu public' : 'Profil rendu privé',
      );
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/participant/profil/email
   * → Demande de changement d'email (envoie un lien de confirmation)
   */
  static async requestEmailChange(req: Request, res: Response, next: NextFunction) {
    try {
      const { nouvelEmail } = req.body;
      if (!nouvelEmail) throw new BadRequestError('nouvelEmail requis');

      await profileService.requestEmailChange(req.userId!, nouvelEmail);
      return successResponse(res, null, 'Email de confirmation envoyé');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // 📊 STATISTIQUES DE PROFIL (bonus)
  // ==========================================================================

  /**
   * GET /api/participant/profil/stats
   * → Statistiques du profil (nb formations, attestations, connexions)
   */
  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await profileService.getStats(req.userId!, req.userRole!);
      return successResponse(res, stats, 'Statistiques du profil');
    } catch (e) {
      next(e);
    }
  }
}