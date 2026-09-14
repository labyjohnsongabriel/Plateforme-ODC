import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';

export class ReseautageController {
  static async annuaire(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
      const qb = AppDataSource.getRepository(User).createQueryBuilder('u')
        .leftJoinAndSelect('u.role', 'r')
        .where('u.id != :uid', { uid: req.userId! })
        .andWhere('u.actif = true')
        .orderBy('u.created_at', 'DESC').skip(skip).take(limit);
      const [data, total] = await qb.getManyAndCount();
      const cleaned = data.map(({ motDePasse, ...rest }) => rest);
      return paginatedResponse(res, cleaned, total, page, limit);
    } catch (e) { next(e); }
  }
  static async envoyerDemande(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, {}, 'Demande envoyee', 201); } catch (e) { next(e); }
  }
  static async repondre(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, {}, 'Reponse enregistree'); } catch (e) { next(e); }
  }
  static async mesConnections(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, []); } catch (e) { next(e); }
  }
  static async demandesEnAttente(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, []); } catch (e) { next(e); }
  }
  static async suggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AppDataSource.getRepository(User).createQueryBuilder('u')
        .leftJoinAndSelect('u.role', 'r')
        .where('u.id != :uid', { uid: req.userId! })
        .andWhere('u.actif = true')
        .orderBy('RANDOM()').limit(Number(req.query.limit) || 10).getMany();
      return successResponse(res, users.map(({ motDePasse, ...r }) => r));
    } catch (e) { next(e); }
  }
}