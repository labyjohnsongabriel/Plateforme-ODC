import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { Role, RoleName } from '../models/Role.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { NotFoundError, ConflictError } from '../errors/AppError';
import bcrypt from 'bcrypt';

export class UserController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const existing = await repo.findOne({ where: { email: req.body.email } });
      if (existing) throw new ConflictError('Email deja utilise');
      const role = await AppDataSource.getRepository(Role).findOne({ where: { nom: req.body.roleNom as RoleName } });
      if (!role) throw new NotFoundError('Role introuvable');
      const user = repo.create({
        ...req.body,
        motDePasse: await bcrypt.hash(req.body.motDePasse, 12),
        roleId: role.id,
      });
      await repo.save(user);
      return successResponse(res, user, 'Utilisateur cree', 201);
    } catch (e) { next(e); }
  }
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
      const [data, total] = await AppDataSource.getRepository(User).findAndCount({
        relations: ['role'], skip, take: limit, order: { createdAt: 'DESC' },
      });
      return paginatedResponse(res, data, total, page, limit);
    } catch (e) { next(e); }
  }
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const u = await AppDataSource.getRepository(User).findOne({ where: { id: req.params.id }, relations: ['role'] });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      return successResponse(res, u);
    } catch (e) { next(e); }
  }
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const u = await repo.findOne({ where: { id: req.params.id } });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      Object.assign(u, req.body);
      await repo.save(u);
      return successResponse(res, u, 'Utilisateur mis a jour');
    } catch (e) { next(e); }
  }
  static async changeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const u = await repo.findOne({ where: { id: req.params.id } });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      const role = await AppDataSource.getRepository(Role).findOne({ where: { nom: req.body.roleNom as RoleName } });
      if (!role) throw new NotFoundError('Role introuvable');
      u.roleId = role.id;
      await repo.save(u);
      return successResponse(res, u, 'Role modifie');
    } catch (e) { next(e); }
  }
  static async toggleActif(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const u = await repo.findOne({ where: { id: req.params.id } });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      u.actif = req.body.actif;
      await repo.save(u);
      return successResponse(res, u, 'Statut modifie');
    } catch (e) { next(e); }
  }
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await AppDataSource.getRepository(User).softDelete(req.params.id);
      return successResponse(res, null, 'Utilisateur supprime');
    } catch (e) { next(e); }
  }
  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await AppDataSource.getRepository(User).createQueryBuilder('u')
        .leftJoin('u.role', 'r').select('r.nom', 'role').addSelect('COUNT(u.id)', 'count')
        .where('u.actif = true').groupBy('r.nom').getRawMany();
      return successResponse(res, roles);
    } catch (e) { next(e); }
  }
}