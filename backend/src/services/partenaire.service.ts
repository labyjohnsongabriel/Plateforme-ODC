import { AppDataSource } from '../config/database';
import { Partenaire } from '../models/Partenaire.entity';
import { NotFoundError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';

export class PartenaireService {
  static async create(data: Partial<Partenaire>) {
    const repo = AppDataSource.getRepository(Partenaire);
    const p = repo.create(data);
    await repo.save(p);
    return p;
  }

  static async findAll(page?: string, limit?: string) {
    const { page: p, limit: l, skip } = getPagination(page, limit);
    const repo = AppDataSource.getRepository(Partenaire);
    const [data, total] = await repo.findAndCount({
      where: { actif: true },
      order: { nom: 'ASC' },
      skip,
      take: l,
    });
    return { data, total, page: p, limit: l };
  }

  static async findOne(id: string) {
    const repo = AppDataSource.getRepository(Partenaire);
    const p = await repo.findOne({ where: { id } });
    if (!p) throw new NotFoundError('Partenaire introuvable');
    return p;
  }

  static async update(id: string, data: Partial<Partenaire>) {
    const p = await this.findOne(id);
    Object.assign(p, data);
    await AppDataSource.getRepository(Partenaire).save(p);
    return p;
  }

  static async delete(id: string) {
    await this.findOne(id);
    await AppDataSource.getRepository(Partenaire).softDelete(id);
  }
}