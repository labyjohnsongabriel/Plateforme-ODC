<<<<<<< HEAD
import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { Role, RoleName } from '../models/Role.entity';
import { hashPassword } from '../utils/password.util';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { MESSAGES } from '../constants/messages';

export class UserService {
  static async create(data: any) {
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);

    const existing = await userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictError(MESSAGES.AUTH.EMAIL_EXISTS);

    const role = await roleRepo.findOne({ where: { nom: data.roleNom as RoleName } });
    if (!role) throw new NotFoundError('Rôle introuvable');

    const user = userRepo.create({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      motDePasse: await hashPassword(data.motDePasse),
      telephone: data.telephone,
      ville: data.ville,
      roleId: role.id,
      actif: true,
    });

    await userRepo.save(user);
    return this.findOne(user.id);
  }

  static async findAll(page?: string, limit?: string, filters?: any) {
    const { page: p, limit: l, skip } = getPagination(page, limit);
    const repo = AppDataSource.getRepository(User);

    const qb = repo.createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'r');

    if (filters?.role) qb.andWhere('r.nom = :role', { role: filters.role });
    if (filters?.actif !== undefined) qb.andWhere('u.actif = :actif', { actif: filters.actif });
    if (filters?.search) {
      qb.andWhere(
        '(u.nom ILIKE :q OR u.prenom ILIKE :q OR u.email ILIKE :q)',
        { q: `%${filters.search}%` }
      );
    }

    qb.orderBy('u.createdAt', 'DESC').skip(skip).take(l);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: p, limit: l };
  }

  static async findOne(id: string) {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
    return user;
  }

  static async update(id: string, data: any) {
    const user = await this.findOne(id);
    Object.assign(user, data);
    await AppDataSource.getRepository(User).save(user);
    return this.findOne(id);
  }

  static async changeRole(id: string, roleNom: string) {
    const user = await this.findOne(id);
    const roleRepo = AppDataSource.getRepository(Role);
    const role = await roleRepo.findOne({ where: { nom: roleNom as RoleName } });
    if (!role) throw new NotFoundError('Rôle introuvable');

    user.roleId = role.id;
    await AppDataSource.getRepository(User).save(user);
    return this.findOne(id);
  }

  static async toggleActif(id: string, actif: boolean) {
    const user = await this.findOne(id);
    user.actif = actif;
    await AppDataSource.getRepository(User).save(user);
    return user;
  }

  static async delete(id: string) {
    const user = await this.findOne(id);
    await AppDataSource.getRepository(User).softDelete(id);
=======
// src/services/user.service.ts
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository'; // ✅ chemin corrigé
import { roleRepository } from '../repositories/RoleRepository';
import { RoleName } from '../entities/enums';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../errors/AppError';
import { logger } from '../config/logger';

export class UserService {
  static async create(data: any) {
    const { email, motDePasse, nom, prenom, roleNom } = data;
    if (!email || !motDePasse || !nom || !prenom) {
      throw new BadRequestError('Email, mot de passe, nom et prénom requis');
    }
    if (motDePasse.length < 8) {
      throw new BadRequestError('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (await userRepository.exists({ email: email.toLowerCase() } as any)) {
      throw new ConflictError('Email déjà utilisé');
    }

    const role = await roleRepository.findByName(
      (roleNom as RoleName) || RoleName.PARTICIPANT,
    );
    if (!role) throw new NotFoundError('Rôle introuvable');

    const user = await userRepository.create({
      nom,
      prenom,
      email: email.toLowerCase(),
      telephone: data.telephone,
      photoUrl: data.photoUrl,
      bio: data.bio,
      ville: data.ville,
      entreprise: data.entreprise,
      poste: data.poste,
      competences: data.competences,
      actif: data.actif ?? true,
      motDePasse: await bcrypt.hash(motDePasse, 12),
      roleId: role.id,
    });

    logger.info(`👤 Utilisateur créé par admin : ${user.email} (${roleNom ?? RoleName.PARTICIPANT})`);
    return user;
  }

  static async findAll(filters: any, page: number, limit: number) {
    return userRepository.search(
      {
        roleId: filters.roleId,
        actif:
          filters.actif === 'true' ? true :
          filters.actif === 'false' ? false :
          undefined,
        q: filters.q,
      },
      page,
      limit,
    );
  }

  static async findById(id: string) {
    return userRepository.findByIdOrFail(id, ['role']);
  }

  static async update(id: string, data: any) {
    // Protéger les champs sensibles
    delete data.motDePasse;
    delete data.roleId;
    delete data.email; // l'email ne change pas par cette route
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.deletedAt;

    return userRepository.update(id, data);
  }

  static async changeRole(id: string, roleNom: RoleName, requestedByRole: RoleName) {
    // Seul un ADMINISTRATEUR peut nommer ADMINISTRATEUR
    if (roleNom === RoleName.ADMINISTRATEUR && requestedByRole !== RoleName.ADMINISTRATEUR) {
      throw new ForbiddenError('Seul un administrateur peut attribuer ce rôle');
    }
    const role = await roleRepository.findByName(roleNom);
    if (!role) throw new NotFoundError('Rôle introuvable');

    const user = await userRepository.findByIdOrFail(id);
    user.roleId = role.id;
    await userRepository.save(user);

    logger.info(`🔄 Rôle modifié : ${user.email} → ${roleNom}`);
    return user;
  }

  static async toggleActif(id: string, actif: boolean, currentUserId: string) {
    if (id === currentUserId && !actif) {
      throw new ForbiddenError('Vous ne pouvez pas désactiver votre propre compte');
    }
    const user = await userRepository.update(id, { actif });
    logger.info(
      `${actif ? '✅' : '🚫'} Utilisateur ${actif ? 'activé' : 'désactivé'} : ${user.email}`,
    );
    return user;
  }

  static async delete(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenError('Vous ne pouvez pas supprimer votre propre compte');
    }
    await userRepository.softDelete(id);
    logger.info(`🗑️ Utilisateur supprimé : ${id}`);
  }

  static async stats() {
    return userRepository.statsByRole();
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}