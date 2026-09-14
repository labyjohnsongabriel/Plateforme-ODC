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
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  roleNom?: string;
}

export interface LoginData {
  email: string;
  motDePasse: string;
}

export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(data: RegisterData) {
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);

    // Vérifier email unique
    const existing = await userRepo.findOne({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError(MESSAGES.AUTH.EMAIL_EXISTS);
    }

    // Récupérer le rôle
    const roleNom = data.roleNom || RoleName.PARTICIPANT;
    const role = await roleRepo.findOne({ where: { nom: roleNom as RoleName } });
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

    // Recharger avec le rôle
    const createdUser = await userRepo.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    logger.info(`✅ Nouvel utilisateur inscrit : ${user.email}`);

    // Générer tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: roleNom,
    });

    return {
      user: this.sanitizeUser(createdUser!),
      ...tokens,
    };
  }

  /**
   * Connexion utilisateur
   */
  static async login(data: LoginData) {
    const userRepo = AppDataSource.getRepository(User);

    // Récupérer l'utilisateur avec mot de passe
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

    // Comparer mot de passe
    const valid = await comparePassword(data.motDePasse, user.motDePasse);
    if (!valid) {
      throw new UnauthorizedError(MESSAGES.AUTH.LOGIN_FAILED);
    }

    // Mettre à jour dernière connexion
    user.derniereConnexion = new Date();
    await userRepo.save(user);

    logger.info(`✅ Connexion réussie : ${user.email}`);

    // Générer tokens
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

  /**
   * Rafraîchir le token d'accès
   */
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

  /**
   * Récupérer le profil courant
   */
  static async getProfile(userId: string) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) throw new NotFoundError(MESSAGES.USER.NOT_FOUND);

    return this.sanitizeUser(user);
  }

  /**
   * Changer le mot de passe
   */
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

    logger.info(`✅ Mot de passe changé pour : ${user.email}`);
  }

  /**
   * Retire les champs sensibles
   */
  private static sanitizeUser(user: User) {
    const { motDePasse, ...rest } = user;
    return rest;
  }
}