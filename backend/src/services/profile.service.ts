// src/services/profile.service.ts
import { userRepository } from '../repositories/user.repository';
import { inscriptionRepository } from '../repositories/inscription.repository';
import { attestationRepository } from '../repositories/attestation.repository';
import { connectionRepository } from '../repositories/ConnectionRepository';
import { RoleName } from '../entities/enums';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../errors/AppError';
import { logger } from '../config/logger';
import { uploadService } from './upload.service';

// Champs autorisés à la modification par l'utilisateur lui-même
const EDITABLE_FIELDS = [
  'nom',
  'prenom',
  'telephone',
  'bio',
  'ville',
  'linkedin',
  'siteWeb',
  'entreprise',
  'poste',
  'competences',
  'photoCouvertureUrl',
] as const;

export class ProfileService {
  // ==========================================================================
  // 👤 CONSULTATION
  // ==========================================================================

  /** Profil complet de l'utilisateur connecté */
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId, [
      'role',
      'role.permissions',
    ]);
    if (!user) throw new NotFoundError('Utilisateur introuvable');
    return user;
  }

  /** Profil public d'un autre utilisateur (uniquement si profilPublic = true) */
  async getPublicProfile(userId: string) {
    const user = await userRepository.findById(userId, ['role']);
    if (!user) throw new NotFoundError('Utilisateur introuvable');
    if (!user.actif) throw new NotFoundError('Utilisateur introuvable');
    if (!user.profilPublic) throw new ForbiddenError('Ce profil est privé');

    // Ne jamais exposer email/tel sur un profil public
    const { email, telephone, resetToken, resetTokenExpires, motDePasse, ...publicProfile } =
      user as any;

    return publicProfile;
  }

  // ==========================================================================
  // ✍️ MISE À JOUR
  // ==========================================================================

  /** Met à jour les champs autorisés du profil */
  async updateProfile(userId: string, data: any) {
    const user = await userRepository.findByIdOrFail(userId);

    // Filtrer : ne garder que les champs autorisés
    const cleaned: Record<string, any> = {};
    for (const field of EDITABLE_FIELDS) {
      if (data[field] !== undefined) cleaned[field] = data[field];
    }

    // Validation minimale
    if (cleaned.nom && cleaned.nom.trim().length < 2) {
      throw new BadRequestError('Nom trop court');
    }
    if (cleaned.prenom && cleaned.prenom.trim().length < 2) {
      throw new BadRequestError('Prénom trop court');
    }
    if (cleaned.telephone && !/^\+?[0-9\s().-]{6,20}$/.test(cleaned.telephone)) {
      throw new BadRequestError('Numéro de téléphone invalide');
    }

    // Empêcher la modification des champs sensibles
    delete data.roleId;
    delete data.email;
    delete data.motDePasse;
    delete data.actif;
    delete data.emailVerifie;

    Object.assign(user, cleaned);
    const saved = await userRepository.save(user);

    logger.info(`📝 Profil mis à jour : ${saved.email}`);
    return saved;
  }

  // ==========================================================================
  // 🖼️ IMAGES
  // ==========================================================================

  async setPhoto(userId: string, photoUrl: string) {
    const user = await userRepository.findByIdOrFail(userId);

    // Supprimer l'ancienne photo (si fichier local)
    if (user.photoUrl && user.photoUrl.startsWith('/uploads/')) {
      await uploadService.deleteFile(user.photoUrl).catch(() => null);
    }

    user.photoUrl = photoUrl;
    return userRepository.save(user);
  }

  async setCouverture(userId: string, couvertureUrl: string) {
    const user = await userRepository.findByIdOrFail(userId);

    if (user.photoCouvertureUrl && user.photoCouvertureUrl.startsWith('/uploads/')) {
      await uploadService.deleteFile(user.photoCouvertureUrl).catch(() => null);
    }

    user.photoCouvertureUrl = couvertureUrl;
    return userRepository.save(user);
  }

  async setLogo(userId: string, logoUrl: string) {
    const user = await userRepository.findByIdOrFail(userId);

    // Utilise photoUrl pour stocker le logo du partenaire
    if (user.photoUrl && user.photoUrl.startsWith('/uploads/')) {
      await uploadService.deleteFile(user.photoUrl).catch(() => null);
    }

    user.photoUrl = logoUrl;
    return userRepository.save(user);
  }

  async deletePhoto(userId: string) {
    const user = await userRepository.findByIdOrFail(userId);

    if (user.photoUrl && user.photoUrl.startsWith('/uploads/')) {
      await uploadService.deleteFile(user.photoUrl).catch(() => null);
    }

    user.photoUrl = null as any;
    return userRepository.save(user);
  }

  async deleteCouverture(userId: string) {
    const user = await userRepository.findByIdOrFail(userId);

    if (user.photoCouvertureUrl && user.photoCouvertureUrl.startsWith('/uploads/')) {
      await uploadService.deleteFile(user.photoCouvertureUrl).catch(() => null);
    }

    user.photoCouvertureUrl = null as any;
    return userRepository.save(user);
  }

  // ==========================================================================
  // 🔐 SÉCURITÉ DU PROFIL
  // ==========================================================================

  async toggleVisibilite(userId: string, profilPublic: boolean) {
    const user = await userRepository.findByIdOrFail(userId);
    user.profilPublic = profilPublic;
    return userRepository.save(user);
  }

  async requestEmailChange(userId: string, nouvelEmail: string) {
    const user = await userRepository.findByIdOrFail(userId);

    if (user.email === nouvelEmail) {
      throw new BadRequestError('Le nouvel email est identique à l\'ancien');
    }

    const existing = await userRepository.findByEmail(nouvelEmail.toLowerCase());
    if (existing) throw new ConflictError('Cet email est déjà utilisé');

    // TODO: générer un token + envoyer un email de confirmation
    // const token = crypto.randomBytes(32).toString('hex');
    // user.resetToken = token;
    // user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    // await userRepository.save(user);
    // await emailService.sendEmailChangeConfirmation(user, nouvelEmail, token);

    logger.info(`📧 Demande de changement d'email : ${user.email} → ${nouvelEmail}`);
  }

  // ==========================================================================
  // 📊 STATISTIQUES
  // ==========================================================================

  async getStats(userId: string, role: RoleName) {
    switch (role) {
      case RoleName.PARTICIPANT: {
        const [inscriptions, attestations] = await Promise.all([
          inscriptionRepository.count({ participantId: userId } as any),
          attestationRepository.count({ participantId: userId, valide: true } as any),
        ]);
        return { inscriptions, attestations };
      }

      case RoleName.FORMATEUR: {
        const sessions = await inscriptionRepository.raw
          .createQueryBuilder('i')
          .leftJoin('i.session', 's')
          .where('s.formateur_id = :uid', { uid: userId })
          .getCount();
        return { participantsSuivis: sessions };
      }

      case RoleName.PARTENAIRE: {
        return { type: 'partenaire' };
      }

      default:
        return {};
    }
  }
}

export const profileService = new ProfileService();