import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Partenaire } from '../models/Partenaire.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { NotFoundError } from '../errors/AppError';

export class PartenaireController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Partenaire);
      const p = repo.create(req.body);
      await repo.save(p);
      return successResponse(res, p, 'Partenaire cree', 201);
    } catch (e) { next(e); }
  }
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
      const [data, total] = await AppDataSource.getRepository(Partenaire).findAndCount({
        where: { actif: true }, skip, take: limit, order: { nom: 'ASC' },
      });
      return paginatedResponse(res, data, total, page, limit);
    } catch (e) { next(e); }
  }
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await AppDataSource.getRepository(Partenaire).findOne({ where: { id: req.params.id } });
      if (!p) throw new NotFoundError('Partenaire introuvable');
      return successResponse(res, p);
    } catch (e) { next(e); }
  }
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Partenaire);
      const p = await repo.findOne({ where: { id: req.params.id } });
      if (!p) throw new NotFoundError('Partenaire introuvable');
      Object.assign(p, req.body);
      await repo.save(p);
      return successResponse(res, p, 'Partenaire mis a jour');
    } catch (e) { next(e); }
  }
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await AppDataSource.getRepository(Partenaire).softDelete(req.params.id);
      return successResponse(res, null, 'Partenaire supprime');
    } catch (e) { next(e); }
  }
}