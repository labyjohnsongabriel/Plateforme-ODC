// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/RoleRepository';
import { User } from '../entities/User.entity';
import { RoleName } from '../entities/enums';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../errors/AppError';
// ⭐ CORRECTION : import de la classe statique, pas d'instance
import { MailService } from './mail.service';
import { logger } from '../config/logger';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface RegisterInput {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  roleNom?: RoleName;
}

export interface LoginInput {
  email: string;
  motDePasse: string;
}

export interface JwtPayload {
  sub: string;
  userId: string;
  email: string;
  role: RoleName;
  roleId: string;
  permissions: string[];
}

export class AuthService {
  /* ==========================================================================
     REGISTER
     ========================================================================== */
  static async register(input: RegisterInput) {
    if (await userRepository.exists({ email: input.email } as any)) {
      throw new ConflictError('Cet email est déjà utilisé');
    }

    const roleName =
      input.roleNom === RoleName.PARTENAIRE
        ? RoleName.PARTENAIRE
        : RoleName.PARTICIPANT;

    const role = await roleRepository.findByName(roleName);
    if (!role) throw new NotFoundError(`Rôle ${roleName} non initialisé`);

    const hashed = await bcrypt.hash(input.motDePasse, 12);
    const user = await userRepository.create({
      nom: input.nom,
      prenom: input.prenom,
      email: input.email.toLowerCase(),
      motDePasse: hashed,
      telephone: input.telephone,
      roleId: role.id,
    });

    logger.info(`👤 Inscription : ${user.email} (${roleName})`);

    const fullUser = await userRepository.findById(user.id, [
      'role',
      'role.permissions',
    ]);

    if (!fullUser?.role) {
      throw new NotFoundError('Rôle non trouvé après inscription');
    }

    // ⭐ Envoyer email de bienvenue (non bloquant)
    MailService.envoyerBienvenue({
      destinataire: fullUser.email,
      nomParticipant: `${fullUser.prenom} ${fullUser.nom}`,
    }).catch((err) => {
      logger.warn(`⚠️ Email de bienvenue non envoyé : ${err.message}`);
    });

    return this.buildAuthResponse(fullUser, fullUser.role);
  }

  /* ==========================================================================
     LOGIN
     ========================================================================== */
  static async login(input: LoginInput) {
    const user = await userRepository.findByEmailWithPassword(
      input.email.toLowerCase(),
    );

    if (!user) {
      throw new UnauthorizedError('Email ou mot de passe incorrect');
    }
    if (!user.actif) {
      throw new UnauthorizedError('Compte désactivé');
    }

    if (!user.role) {
      logger.error('[LOGIN] Utilisateur sans rôle', {
        userId: user.id,
        email: user.email,
      });
      throw new UnauthorizedError(
        'Utilisateur sans rôle — contactez l\'administrateur',
      );
    }

    const ok = await bcrypt.compare(input.motDePasse, user.motDePasse);
    if (!ok) {
      throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    user.derniereConnexion = new Date();
    await userRepository.save(user);

    logger.info(`🔓 Connexion : ${user.email} (${user.role.nom})`);

    return this.buildAuthResponse(user, user.role);
  }

  /* ==========================================================================
     REFRESH
     ========================================================================== */
  static async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as { sub?: string; userId?: string };

      const userId = payload.sub ?? payload.userId;
      if (!userId) {
        throw new UnauthorizedError('Payload invalide');
      }

      const user = await userRepository.findById(userId, [
        'role',
        'role.permissions',
      ]);
      if (!user || !user.actif) {
        throw new UnauthorizedError('Utilisateur invalide');
      }
      if (!user.role) {
        throw new UnauthorizedError('Utilisateur sans rôle');
      }

      return this.buildAuthResponse(user, user.role);
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Refresh token invalide ou expiré');
    }
  }

  /* ==========================================================================
     PROFIL / MOT DE PASSE / RESET
     ========================================================================== */
  static async getProfile(userId: string) {
    const user = await userRepository.findById(userId, [
      'role',
      'role.permissions',
    ]);
    if (!user) throw new NotFoundError('Utilisateur introuvable');
    return this.sanitize(user);
  }

  static async changePassword(userId: string, ancien: string, nouveau: string) {
    const user = await userRepository.raw
      .createQueryBuilder('u')
      .addSelect('u.motDePasse')
      .where('u.id = :id', { id: userId })
      .getOne();
    if (!user) throw new NotFoundError('Utilisateur introuvable');

    const ok = await bcrypt.compare(ancien, user.motDePasse);
    if (!ok) throw new UnauthorizedError('Ancien mot de passe incorrect');

    if (nouveau.length < 8) {
      throw new BadRequestError(
        'Le mot de passe doit contenir au moins 8 caractères',
      );
    }

    user.motDePasse = await bcrypt.hash(nouveau, 12);
    await userRepository.save(user);

    logger.info(`🔐 Mot de passe modifié : ${user.email}`);

    // ⭐ Notification email (non bloquant)
    MailService.envoyerEmailGenerique({
      destinataire: user.email,
      sujet: '🔐 Votre mot de passe a été modifié',
      contenuHtml: `
        <p>Bonjour ${user.prenom},</p>
        <p>Votre mot de passe a été modifié avec succès.</p>
        <p>Si vous n'êtes pas à l'origine de cette action, contactez-nous immédiatement.</p>
      `,
    }).catch((err) => {
      logger.warn(`⚠️ Email de notification non envoyé : ${err.message}`);
    });
  }

  /* ==========================================================================
     ⭐ FORGOT PASSWORD — CORRIGÉ
     ========================================================================== */
  static async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email.toLowerCase());

    // ⚠️ Sécurité : ne pas révéler si l'email existe
    if (!user) {
      logger.debug(`[FORGOT] Email inconnu : ${email}`);
      return;
    }

    // Génération du token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h
    user.resetToken = token;
    user.resetTokenExpires = expires;
    await userRepository.save(user);

    // ⭐ CORRECTION : appel correct de MailService (classe statique)
    try {
      await MailService.envoyerResetPassword({
        destinataire: user.email,
        nom: user.prenom || user.nom || 'Utilisateur',
        resetToken: token,
      });
      logger.info(`📧 Email de réinitialisation envoyé : ${user.email}`);
    } catch (err: any) {
      logger.error(`❌ Échec envoi email reset : ${err.message}`);
      // ⚠️ On ne propage pas l'erreur pour ne pas révéler l'email
      // En production, tu peux logger dans Sentry
    }
  }

  static async resetPassword(token: string, nouveau: string) {
    const user = await userRepository.raw
      .createQueryBuilder('u')
      .addSelect('u.resetToken')
      .addSelect('u.resetTokenExpires')
      .where('u.resetToken = :token', { token })
      .getOne();

    if (
      !user ||
      !user.resetTokenExpires ||
      user.resetTokenExpires < new Date()
    ) {
      throw new BadRequestError('Token invalide ou expiré');
    }

    if (nouveau.length < 8) {
      throw new BadRequestError(
        'Le mot de passe doit contenir au moins 8 caractères',
      );
    }

    user.motDePasse = await bcrypt.hash(nouveau, 12);
    user.resetToken = null as any;
    user.resetTokenExpires = null as any;
    await userRepository.save(user);

    logger.info(`🔐 Mot de passe réinitialisé : ${user.email}`);

    // ⭐ Notification email (non bloquant)
    MailService.envoyerEmailGenerique({
      destinataire: user.email,
      sujet: '🔐 Votre mot de passe a été réinitialisé',
      contenuHtml: `
        <p>Bonjour ${user.prenom},</p>
        <p>Votre mot de passe a été réinitialisé avec succès.</p>
        <p>Vous pouvez vous connecter dès maintenant.</p>
      `,
    }).catch((err) => {
      logger.warn(`⚠️ Email de notification non envoyé : ${err.message}`);
    });
  }

  /* ==========================================================================
     HELPERS PRIVÉS
     ========================================================================== */

  private static buildAuthResponse(user: User, role: any) {
    if (!role || !role.nom) {
      logger.error('[AUTH] Rôle manquant lors de la génération du JWT', {
        userId: user.id,
        email: user.email,
      });
      throw new UnauthorizedError(
        'Rôle utilisateur introuvable — contactez l\'administrateur',
      );
    }

    const permissions: string[] = Array.isArray(role.permissions)
      ? role.permissions.map((p: any) => p.code).filter(Boolean)
      : [];

    const payload: JwtPayload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: role.nom,
      roleId: role.id,
      permissions,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    const refreshToken = jwt.sign(
      { sub: user.id, userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
    );

    logger.debug('[AUTH] JWT généré', {
      userId: user.id,
      email: user.email,
      role: role.nom,
      roleId: role.id,
      permissionsCount: permissions.length,
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      user: this.sanitize(user),
    };
  }

  private static sanitize(user: User) {
    const {
      motDePasse,
      resetToken,
      resetTokenExpires,
      ...safe
    } = user as any;
    return safe;
  }
}