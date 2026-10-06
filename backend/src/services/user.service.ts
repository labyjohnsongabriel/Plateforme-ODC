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
  }
}