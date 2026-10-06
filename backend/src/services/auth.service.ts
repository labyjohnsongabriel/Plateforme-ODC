// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/RoleRepository';
import { User } from '../entities/User.entity';
import { RoleName } from '../entities/enums';
import { UnauthorizedError, ConflictError, NotFoundError, BadRequestError } from '../errors/AppError';
import { emailService } from './mail.service';
import { logger } from '../config/logger';

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
  userId: string;
  email: string;
  role: RoleName;
  roleId: string;
  permissions: string[];
}

export class AuthService {
  /** Inscription — seul PARTICIPANT ou PARTENAIRE autorisé en auto-inscription */
  static async register(input: RegisterInput) {
    if (await userRepository.exists({ email: input.email } as any)) {
      throw new ConflictError('Cet email est déjà utilisé');
    }

    // Sécurité : on n'autorise en auto-inscription que PARTICIPANT/PARTENAIRE
    const roleName =
      input.roleNom === RoleName.PARTENAIRE ? RoleName.PARTENAIRE : RoleName.PARTICIPANT;

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

    // TODO: envoyer email de vérification
    // await emailService.sendWelcome(user);

    logger.info(`👤 Inscription : ${user.email} (${roleName})`);
    return this.buildAuthResponse(user, role);
  }

  /** Connexion */
  static async login(input: LoginInput) {
    const user = await userRepository.findByEmailWithPassword(input.email.toLowerCase());
    if (!user) throw new UnauthorizedError('Email ou mot de passe incorrect');
    if (!user.actif) throw new UnauthorizedError('Compte désactivé');

    const ok = await bcrypt.compare(input.motDePasse, user.motDePasse);
    if (!ok) throw new UnauthorizedError('Email ou mot de passe incorrect');

    user.derniereConnexion = new Date();
    await userRepository.save(user);

    logger.info(`🔓 Connexion : ${user.email} (${user.role.nom})`);
    return this.buildAuthResponse(user, user.role);
  }

  /** Rafraîchir le token */
  static async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const user = await userRepository.findById(payload.userId, ['role', 'role.permissions']);
      if (!user || !user.actif) throw new UnauthorizedError('Utilisateur invalide');
      return this.buildAuthResponse(user, user.role);
    } catch {
      throw new UnauthorizedError('Refresh token invalide ou expiré');
    }
  }

  /** Profil utilisateur */
  static async getProfile(userId: string) {
    const user = await userRepository.findById(userId, ['role', 'role.permissions']);
    if (!user) throw new NotFoundError('Utilisateur introuvable');
    return this.sanitize(user);
  }

  /** Changement de mot de passe */
  static async changePassword(userId: string, ancien: string, nouveau: string) {
    const user = await userRepository.raw
      .createQueryBuilder('u')
      .addSelect('u.motDePasse')
      .where('u.id = :id', { id: userId })
      .getOne();
    if (!user) throw new NotFoundError('Utilisateur introuvable');

    const ok = await bcrypt.compare(ancien, user.motDePasse);
    if (!ok) throw new UnauthorizedError('Ancien mot de passe incorrect');

    if (nouveau.length < 8) throw new BadRequestError('Le mot de passe doit contenir au moins 8 caractères');
    user.motDePasse = await bcrypt.hash(nouveau, 12);
    await userRepository.save(user);

    logger.info(`🔐 Mot de passe modifié : ${user.email}`);
  }

  /** Mot de passe oublié */
  static async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user) return; // Ne pas révéler si l'email existe

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h
    user.resetToken = token;
    user.resetTokenExpires = expires;
    await userRepository.save(user);

    await emailService.sendPasswordReset(user, token);
    logger.info(`📧 Email de réinitialisation envoyé : ${user.email}`);
  }

  /** Réinitialiser le mot de passe */
  static async resetPassword(token: string, nouveau: string) {
    const user = await userRepository.raw
      .createQueryBuilder('u')
      .addSelect('u.resetToken')
      .addSelect('u.resetTokenExpires')
      .where('u.resetToken = :token', { token })
      .getOne();

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestError('Token invalide ou expiré');
    }

    user.motDePasse = await bcrypt.hash(nouveau, 12);
    user.resetToken = null as any;
    user.resetTokenExpires = null as any;
    await userRepository.save(user);

    logger.info(`🔐 Mot de passe réinitialisé : ${user.email}`);
  }

  // =====================================================================
  // HELPERS PRIVÉS
  // =====================================================================
  private static buildAuthResponse(user: User, role: any) {
    const permissions = (role.permissions ?? []).map((p: any) => p.code);

    const payload: JwtPayload = {
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
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      user: this.sanitize(user),
    };
  }

  private static sanitize(user: User) {
    const { motDePasse, resetToken, resetTokenExpires, ...safe } = user as any;
    return safe;
  }
}