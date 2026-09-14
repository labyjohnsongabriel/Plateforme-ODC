import { AppDataSource } from '../config/database';
import { DeepPartial, ILike } from 'typeorm';
import { Formation } from '../models/Formation.entity';
import { Session, StatutSession } from '../models/Session.entity';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { MESSAGES } from '../constants/messages';
import { logger } from '../config/logger';

export class FormationService {
  private static get repo() {
    return AppDataSource.getRepository(Formation);
  }

  static async create(data: DeepPartial<Formation>) {
    const existing = await this.repo.findOne({ where: { titre: data.titre } });
    if (existing) throw new ConflictError('Formation deja existante');
    const formation = this.repo.create(data);
    await this.repo.save(formation);
    logger.info(`Formation creee : ${formation.titre}`);
    return formation;
  }

  static async findAll(params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);

    const where = {
      actif: true,
      ...(params.domaine ? { domaine: ILike(`%${params.domaine}%`) } : {}),
      ...(params.niveau ? { niveau: params.niveau } : {}),
    };

    const filters = params.search
      ? [
        { ...where, titre: ILike(`%${params.search}%`) },
        { ...where, description: ILike(`%${params.search}%`) },
      ]
      : where;

    const [data, total] = await this.repo.findAndCount({
      where: filters,
      relations: { sessions: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  static async findById(id: string) {
    const formation = await this.repo.findOne({
      where: { id },
      relations: ['sessions', 'sessions.formateur'],
    });
    if (!formation) throw new NotFoundError(MESSAGES.FORMATION.NOT_FOUND);
    return formation;
  }

  static async update(id: string, data: any) {
    const formation = await this.findById(id);
    Object.assign(formation, data);
    await this.repo.save(formation);
    return formation;
  }

  static async delete(id: string) {
    const formation = await this.findById(id);
    formation.actif = false;
    await this.repo.save(formation);
    logger.info(`Formation desactivee : ${id}`);
  }

  static async getTop(limit = 5) {
    return this.repo.createQueryBuilder('f')
      .leftJoin('f.sessions', 's')
      .leftJoin('s.inscriptions', 'i')
      .select('f.titre', 'titre')
      .addSelect('COUNT(i.id)', 'inscriptions')
      .where('i.statut = :statut', { statut: 'ACCEPTEE' })
      .groupBy('f.titre')
      .orderBy('inscriptions', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  static async countByDomaine() {
    return this.repo.createQueryBuilder('f')
      .select('f.domaine', 'domaine')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.actif = true')
      .groupBy('f.domaine')
      .getRawMany();
  }
}