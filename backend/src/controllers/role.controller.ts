// src/controllers/RoleController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Role } from '../entities/Role.entity';
import { Permission } from '../entities/Permission.entity';
import { RoleName } from '../entities/enums';
import { User } from '../entities/User.entity';
import { successResponse } from '../utils/response.util';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
} from '../errors/AppError';
import { In } from 'typeorm';

export class RoleController {
  /* ==========================================================================
     GET /api/admin/roles
     Liste tous les rôles avec leurs permissions et le compteur d'utilisateurs
     ========================================================================== */
  static async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const roleRepo = AppDataSource.getRepository(Role);
      const userRepo = AppDataSource.getRepository(User);

      const roles = await roleRepo.find({
        relations: ['permissions'],
        order: { niveauHierarchie: 'DESC' },
      });

      // Ajouter le compteur d'utilisateurs pour chaque rôle
      const rolesWithCounts = await Promise.all(
        roles.map(async (role) => {
          const usersCount = await userRepo.count({
            where: { roleId: role.id },
          });
          return { ...role, usersCount };
        }),
      );

      return successResponse(res, rolesWithCounts, 'Liste des rôles');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/roles/stats
     ⭐ Statistiques globales des rôles
     ⚠️ DOIT ÊTRE DÉCLARÉE AVANT /:id
     ========================================================================== */
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const roleRepo = AppDataSource.getRepository(Role);
      const userRepo = AppDataSource.getRepository(User);
      const permissionRepo = AppDataSource.getRepository(Permission);

      const [total, systemes, totalUtilisateurs, totalPermissions] =
        await Promise.all([
          roleRepo.count(),
          roleRepo.count({ where: { estSysteme: true } }),
          userRepo.count(),
          permissionRepo.count(),
        ]);

      return successResponse(
        res,
        {
          total,
          systemes,
          personnalises: total - systemes,
          totalUtilisateurs,
          totalPermissions,
        },
        'Statistiques des rôles',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/roles/permissions
     ⭐ Liste de toutes les permissions disponibles
     ⚠️ DOIT ÊTRE DÉCLARÉE AVANT /:id
     ========================================================================== */
  static async listPermissions(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const perms = await AppDataSource.getRepository(Permission).find({
        order: { categorie: 'ASC', code: 'ASC' },
      });
      return successResponse(res, perms, 'Liste des permissions');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/roles/:id
     Détail d'un rôle
     ========================================================================== */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await AppDataSource.getRepository(Role).findOne({
        where: { id: req.params.id },
        relations: ['permissions'],
      });

      if (!role) throw new NotFoundError('Rôle introuvable');

      const usersCount = await AppDataSource.getRepository(User).count({
        where: { roleId: role.id },
      });

      return successResponse(res, { ...role, usersCount });
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     POST /api/admin/roles
     Créer un nouveau rôle
     ========================================================================== */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        nom,
        libelle,
        description,
        niveauHierarchie,
        couleur,
        permissionCodes,
      } = req.body;

      if (!nom || !libelle) {
        throw new BadRequestError('Les champs nom et libelle sont requis');
      }

      // ⚠️ Vérifier que le nom respecte les règles (MAJUSCULES)
      if (!/^[A-Z][A-Z0-9_]*$/.test(nom)) {
        throw new BadRequestError(
          'Le nom doit être en MAJUSCULES (ex: SUPERVISEUR)',
        );
      }

      const repo = AppDataSource.getRepository(Role);

      // Vérifier l'unicité
      if (await repo.findOne({ where: { nom } })) {
        throw new ConflictError(`Le rôle "${nom}" existe déjà`);
      }

      // Charger les permissions
      let permissions: Permission[] = [];
      if (Array.isArray(permissionCodes) && permissionCodes.length) {
        permissions = await AppDataSource.getRepository(Permission).find({
          where: { code: In(permissionCodes) },
        });
      }

      const role = repo.create({
        nom,
        libelle,
        description,
        niveauHierarchie: niveauHierarchie ?? 0,
        couleur: couleur ?? '#FF7900',
        permissions,
        estSysteme: false,
      });

      await repo.save(role);

      return successResponse(res, role, 'Rôle créé', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     PUT /api/admin/roles/:id
     Mettre à jour un rôle
     ========================================================================== */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Role);
      const role = await repo.findOne({
        where: { id: req.params.id },
        relations: ['permissions'],
      });

      if (!role) throw new NotFoundError('Rôle introuvable');

      // Protection : ne pas modifier le nom d'un rôle système
      if (role.estSysteme && req.body.nom && req.body.nom !== role.nom) {
        throw new ForbiddenError(
          "Le nom d'un rôle système ne peut pas être modifié",
        );
      }

      const {
        nom,
        libelle,
        description,
        niveauHierarchie,
        couleur,
        permissionCodes,
      } = req.body;

      // Mise à jour des champs simples
      if (!role.estSysteme && nom !== undefined) role.nom = nom;
      if (libelle !== undefined) role.libelle = libelle;
      if (description !== undefined) role.description = description;
      if (niveauHierarchie !== undefined)
        role.niveauHierarchie = niveauHierarchie;
      if (couleur !== undefined) role.couleur = couleur;

      // Mise à jour des permissions
      if (Array.isArray(permissionCodes)) {
        role.permissions = await AppDataSource.getRepository(Permission).find({
          where: { code: In(permissionCodes) },
        });
      }

      await repo.save(role);

      return successResponse(res, role, 'Rôle mis à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     DELETE /api/admin/roles/:id
     Supprimer un rôle (soft delete)
     ========================================================================== */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Role);
      const userRepo = AppDataSource.getRepository(User);

      const role = await repo.findOne({ where: { id: req.params.id } });

      if (!role) throw new NotFoundError('Rôle introuvable');

      if (role.estSysteme) {
        throw new ForbiddenError('Un rôle système ne peut pas être supprimé');
      }

      // Vérifier qu'aucun utilisateur n'a ce rôle
      const usersCount = await userRepo.count({
        where: { roleId: role.id },
      });

      if (usersCount > 0) {
        throw new ConflictError(
          `${usersCount} utilisateur(s) ont ce rôle. Réassignez-les d'abord.`,
        );
      }

      await repo.softDelete(req.params.id);

      return successResponse(res, null, 'Rôle supprimé');
    } catch (e) {
      next(e);
    }
  }
}