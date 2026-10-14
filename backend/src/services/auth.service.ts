<<<<<<< HEAD
import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { Role, RoleName } from '../models/Role.entity';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.util';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../errors/AppError';
import { MESSAGES } from '../constants/messages';
import { logger } from '../config/logger';

export interface RegisterData {
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
<<<<<<< HEAD
  roleNom?: string;
}

export interface LoginData {
=======
  roleNom?: RoleName;
}

export interface LoginInput {
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  email: string;
  motDePasse: string;
}

<<<<<<< HEAD
// 🔒 Rôles autorisés à l'inscription (ADMIN exclu volontairement)
const ROLES_AUTORISES_INSCRIPTION: RoleName[] = [
  RoleName.PARTICIPANT,
  RoleName.FORMATEUR,
  RoleName.STAFF_ODC,
  RoleName.PARTENAIRE,
];

export class AuthService {
  static async register(data: RegisterData) {
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);

    // Vérifier email unique
    const existing = await userRepo.findOne({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError(MESSAGES.AUTH.EMAIL_EXISTS);
    }

    // Filtrer le rôle (sécurité)
    const roleNomDemande = (data.roleNom as RoleName) || RoleName.PARTICIPANT;
    const roleNom = ROLES_AUTORISES_INSCRIPTION.includes(roleNomDemande)
      ? roleNomDemande
      : RoleName.PARTICIPANT;

    if (data.roleNom && data.roleNom !== roleNom) {
      logger.warn(
        `🚨 Tentative d'inscription avec rôle interdit : ${data.roleNom} (${data.email})`
      );
    }

    // Récupérer le rôle
    const role = await roleRepo.findOne({ where: { nom: roleNom } });
    if (!role) {
      throw new NotFoundError('Rôle introuvable');
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(data.motDePasse);

    // Créer l'utilisateur
    const user = userRepo.create({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      motDePasse: hashedPassword,
      telephone: data.telephone,
      roleId: role.id,
      actif: true,
      emailVerifie: false,
    });

    await userRepo.save(user);

    const createdUser = await userRepo.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    if (!createdUser) {
      throw new NotFoundError('Utilisateur introuvable après création');
    }

    logger.info(` Nouvel utilisateur inscrit : ${user.email} (rôle: ${roleNom})`);

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: roleNom,
    });

    return {
      user: this.sanitizeUser(createdUser),
      ...tokens,
    };
  }

  static async login(data: LoginData) {
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo
      .createQueryBuilder('user')
      .addSelect('user.motDePasse')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email: data.email })
      .getOne();

    if (!user) {
      throw new UnauthorizedError(MESSAGES.AUTH.LOGIN_FAILED);
    }

    if (!user.actif) {
      throw new UnauthorizedError('Compte désactivé. Contactez l\'administrateur.');
    }

    const valid = await comparePassword(data.motDePasse, user.motDePasse);
    if (!valid) {
      throw new UnauthorizedError(MESSAGES.AUTH.LOGIN_FAILED);
    }

    user.derniereConnexion = new Date();
    await userRepo.save(user);

    logger.info(`✅ Connexion réussie : ${user.email} (${user.role.nom})`);

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.nom,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  static async refresh(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: payload.userId },
        relations: ['role'],
      });

      if (!user || !user.actif) {
        throw new UnauthorizedError(MESSAGES.AUTH.UNAUTHORIZED);
      }

      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role.nom,
      });

      return tokens;
    } catch {
      throw new UnauthorizedError(MESSAGES.AUTH.TOKEN_INVALID);
    }
  }

  static async getProfile(userId: string) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) throw new NotFoundError(MESSAGES.USER.NOT_FOUND);

    return this.sanitizeUser(user);
  }

  static async changePassword(
    userId: string,
    ancienMotDePasse: string,
    nouveauMotDePasse: string
  ) {
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo
      .createQueryBuilder('user')
      .addSelect('user.motDePasse')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) throw new NotFoundError(MESSAGES.USER.NOT_FOUND);

    const valid = await comparePassword(ancienMotDePasse, user.motDePasse);
    if (!valid) {
      throw new UnauthorizedError('Ancien mot de passe incorrect');
    }

    user.motDePasse = await hashPassword(nouveauMotDePasse);
    await userRepo.save(user);

    logger.info(` Mot de passe changé pour : ${user.email}`);
  }

  private static sanitizeUser(user: User) {
    const { motDePasse, ...rest } = user;
    return rest;
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}