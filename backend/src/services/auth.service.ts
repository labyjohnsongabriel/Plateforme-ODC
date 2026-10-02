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
  }
}