// src/controllers/UserController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { Role } from '../entities/Role.entity';
import { RoleName } from '../entities/enums';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/AppError';
import bcrypt from 'bcrypt';

export class UserController {
  /** POST /api/users — Admin */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, motDePasse, nom, prenom, roleNom } = req.body;
      if (!email || !motDePasse || !nom || !prenom) {
        throw new BadRequestError('Email, mot de passe, nom et prénom requis');
      }
      const repo = AppDataSource.getRepository(User);
      if (await repo.findOne({ where: { email } })) throw new ConflictError('Email déjà utilisé');

      const role = await AppDataSource.getRepository(Role).findOne({
        where: { nom: (roleNom as RoleName) || RoleName.PARTICIPANT },
      });
      if (!role) throw new NotFoundError('Rôle introuvable');

      const user = repo.create({
        ...req.body,
        motDePasse: await bcrypt.hash(motDePasse, 12),
        roleId: role.id,
      });
      await repo.save(user);
      return successResponse(res, user, 'Utilisateur créé', 201);
    } catch (e) { next(e); }
  }

  /** GET /api/users — Admin */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
      const qb = AppDataSource.getRepository(User).createQueryBuilder('u')
        .leftJoinAndSelect('u.role', 'r');
      if (req.query.roleId) qb.andWhere('u.role_id = :rid', { rid: req.query.roleId });
      if (req.query.actif !== undefined) qb.andWhere('u.actif = :a', { a: req.query.actif === 'true' });
      if (req.query.q) {
        qb.andWhere('(u.nom ILIKE :q OR u.prenom ILIKE :q OR u.email ILIKE :q)', { q: `%${req.query.q}%` });
      }
      qb.orderBy('u.created_at', 'DESC').skip(skip).take(limit);
      const [data, total] = await qb.getManyAndCount();
      return paginatedResponse(res, data, total, page, limit);
    } catch (e) { next(e); }
  }

  /** GET /api/users/:id — Admin */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const u = await AppDataSource.getRepository(User).findOne({
        where: { id: req.params.id }, relations: ['role'],
      });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      return successResponse(res, u);
    } catch (e) { next(e); }
  }

  /** PUT /api/users/:id — Admin */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const u = await repo.findOne({ where: { id: req.params.id } });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      delete req.body.motDePasse;
      delete req.body.roleId;
      Object.assign(u, req.body);
      await repo.save(u);
      return successResponse(res, u, 'Utilisateur mis à jour');
    } catch (e) { next(e); }
  }

  /** PUT /api/users/:id/role — Admin */
  static async changeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const u = await repo.findOne({ where: { id: req.params.id } });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      const role = await AppDataSource.getRepository(Role).findOne({ where: { nom: req.body.roleNom as RoleName } });
      if (!role) throw new NotFoundError('Rôle introuvable');
      u.roleId = role.id;
      await repo.save(u);
      return successResponse(res, u, 'Rôle modifié');
    } catch (e) { next(e); }
  }

  /** PUT /api/users/:id/actif — Admin */
  static async toggleActif(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const u = await repo.findOne({ where: { id: req.params.id } });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      u.actif = !!req.body.actif;
      await repo.save(u);
      return successResponse(res, u, u.actif ? 'Utilisateur activé' : 'Utilisateur désactivé');
    } catch (e) { next(e); }
  }

  /** DELETE /api/users/:id — Admin */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await AppDataSource.getRepository(User).softDelete(req.params.id);
      return successResponse(res, null, 'Utilisateur supprimé');
    } catch (e) { next(e); }
  }

  /** GET /api/users/stats/roles — Admin */
  static async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await AppDataSource.getRepository(User).createQueryBuilder('u')
        .leftJoin('u.role', 'r')
        .select('r.nom', 'role')
        .addSelect('COUNT(u.id)', 'count')
        .where('u.actif = true')
        .groupBy('r.nom')
        .getRawMany();
      return successResponse(res, roles);
    } catch (e) { next(e); }
  }
}