// src/controllers/RoleController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Role } from '../entities/Role.entity';
import { Permission } from '../entities/Permission.entity';
import { RoleName } from '../entities/enums';
import { successResponse } from '../utils/response.util';
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from '../errors/AppError';
import { In } from 'typeorm';

export class RoleController {
  static async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await AppDataSource.getRepository(Role).find({
        relations: ['permissions'],
        order: { niveauHierarchie: 'DESC' },
      });
      return successResponse(res, roles, 'Liste des rôles');
    } catch (e) { next(e); }
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await AppDataSource.getRepository(Role).findOne({
        where: { id: req.params.id },
        relations: ['permissions'],
      });
      if (!role) throw new NotFoundError('Rôle introuvable');
      return successResponse(res, role);
    } catch (e) { next(e); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { nom, libelle, description, niveauHierarchie, permissionCodes } = req.body;
      if (!nom || !libelle) throw new BadRequestError('nom et libelle requis');
      if (!Object.values(RoleName).includes(nom)) throw new BadRequestError('Nom de rôle invalide');

      const repo = AppDataSource.getRepository(Role);
      if (await repo.findOne({ where: { nom } })) throw new ConflictError('Rôle déjà existant');

      let permissions: Permission[] = [];
      if (Array.isArray(permissionCodes) && permissionCodes.length) {
        permissions = await AppDataSource.getRepository(Permission).find({
          where: { code: In(permissionCodes) },
        });
      }

      const role = repo.create({ nom, libelle, description, niveauHierarchie, permissions });
      await repo.save(role);
      return successResponse(res, role, 'Rôle créé', 201);
    } catch (e) { next(e); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Role);
      const role = await repo.findOne({ where: { id: req.params.id }, relations: ['permissions'] });
      if (!role) throw new NotFoundError('Rôle introuvable');
      if (role.estSysteme && req.body.nom && req.body.nom !== role.nom) {
        throw new ForbiddenError('Le nom d\'un rôle système ne peut pas être modifié');
      }

      const { libelle, description, niveauHierarchie, actif, permissionCodes } = req.body;
      if (libelle !== undefined) role.libelle = libelle;
      if (description !== undefined) role.description = description;
      if (niveauHierarchie !== undefined) role.niveauHierarchie = niveauHierarchie;
      if (actif !== undefined) role.actif = actif;

      if (Array.isArray(permissionCodes)) {
        role.permissions = await AppDataSource.getRepository(Permission).find({
          where: { code: In(permissionCodes) },
        });
      }

      await repo.save(role);
      return successResponse(res, role, 'Rôle mis à jour');
    } catch (e) { next(e); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Role);
      const role = await repo.findOne({ where: { id: req.params.id } });
      if (!role) throw new NotFoundError('Rôle introuvable');
      if (role.estSysteme) throw new ForbiddenError('Rôle système non supprimable');
      await repo.softDelete(req.params.id);
      return successResponse(res, null, 'Rôle supprimé');
    } catch (e) { next(e); }
  }

  static async listPermissions(_req: Request, res: Response, next: NextFunction) {
    try {
      const perms = await AppDataSource.getRepository(Permission).find({
        order: { categorie: 'ASC', code: 'ASC' },
      });
      return successResponse(res, perms, 'Liste des permissions');
    } catch (e) { next(e); }
  }
}