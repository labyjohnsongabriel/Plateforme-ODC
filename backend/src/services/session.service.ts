import { AppDataSource } from '../config/database';
import { Session, StatutSession } from '../models/Session.entity';
import { Formation } from '../models/Formation.entity';
import { User } from '../models/User.entity';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { logger } from '../config/logger';

export class SessionService {
  private static get repo() { return AppDataSource.getRepository(Session); }

  static async create(data: any) {
    const formation = await AppDataSource.getRepository(Formation).findOne({ where: { id: data.formationId } });
    if (!formation) throw new NotFoundError('Formation introuvable');
    if (new Date(data.dateDebut) >= new Date(data.dateFin)) throw new ConflictError('Date debut >= date fin');
    const session = this.repo.create({ ...data, statut: StatutSession.OUVERTE }) as Session;
    await this.repo.save(session);
    logger.info(`Session creee : ${session.id}`);
    return this.findById(session.id);
  }

  static async findAll(params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);
    const qb = this.repo.createQueryBuilder('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('s.formateur', 'fo');
    if (params.statut) qb.andWhere('s.statut = :st', { st: params.statut });
    if (params.formationId) qb.andWhere('s.formation_id = :fid', { fid: params.formationId });
    if (params.formateurId) qb.andWhere('s.formateur_id = :foid', { foid: params.formateurId });
    qb.orderBy('s.dateDebut', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  static async findById(id: string) {
    const s = await this.repo.findOne({ where: { id }, relations: ['formation', 'formateur', 'inscriptions'] });
    if (!s) throw new NotFoundError('Session introuvable');
    return s;
  }

  static async update(id: string, data: any) {
    const s = await this.findById(id);
    Object.assign(s, data);
    await this.repo.save(s);
    return s;
  }

  static async changerStatut(id: string, statut: StatutSession) {
    const s = await this.findById(id);
    s.statut = statut;
    await this.repo.save(s);
    return s;
  }

  static async delete(id: string) {
    await this.findById(id);
    await this.repo.softDelete(id);
  }

  static async findMesSessions(formateurId: string) {
    return this.repo.find({ where: { formateurId }, relations: ['formation'], order: { dateDebut: 'DESC' } });
  }
}