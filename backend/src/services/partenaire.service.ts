<<<<<<< HEAD
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
=======
// src/services/partenaire.service.ts
import slugify from 'slugify';
import { partenaireRepository } from '../repositories/partenaire.repository';
import { ConflictError, NotFoundError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { logger } from '../config/logger';

export class PartenaireService {
  // ==========================================================================
  // 🌐 PUBLIC
  // ==========================================================================
  static async listPublic() {
    return partenaireRepository.findPublic();
  }

  static async detailPublic(slug: string) {
    const p = await partenaireRepository.findBySlug(slug);
    if (!p || !p.estPubliee || !p.actif) {
      throw new NotFoundError('Partenaire introuvable');
    }
    return p;
  }

  // ==========================================================================
  // 🔒 ADMIN / STAFF
  // ==========================================================================
  static async create(data: any) {
    if (!data.nom) throw new ConflictError('Nom requis');

    const slug = data.slug || slugify(data.nom, { lower: true, strict: true });
    if (await partenaireRepository.findOne({ slug } as any)) {
      throw new ConflictError('Un partenaire avec ce slug existe déjà');
    }

    const p = await partenaireRepository.create({ ...data, slug });
    logger.info(`🤝 Partenaire créé : ${p.nom}`);
    return p;
  }

  static async findAll(page?: string | number, limit?: string | number) {
    const { page: p, limit: l, skip } = getPagination(page, limit);

    const [data, total] = await partenaireRepository.raw.findAndCount({
      order: { ordreAffichage: 'ASC', nom: 'ASC' },
      skip,
      take: l,
    });

    return {
      data,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  static async findOne(id: string) {
    return partenaireRepository.findByIdOrFail(id);
  }

  static async update(id: string, data: any) {
    const p = await partenaireRepository.findByIdOrFail(id);

    // Régénérer le slug si le nom change et que le slug n'est pas fourni
    if (data.nom && data.nom !== p.nom && !data.slug) {
      data.slug = slugify(data.nom, { lower: true, strict: true });
    }

    // Vérifier l'unicité du slug
    if (data.slug && data.slug !== p.slug) {
      const existing = await partenaireRepository.findOne({ slug: data.slug } as any);
      if (existing && existing.id !== id) {
        throw new ConflictError('Slug déjà utilisé');
      }
    }

    Object.assign(p, data);
    const saved = await partenaireRepository.save(p);

    logger.info(`📝 Partenaire mis à jour : ${saved.nom}`);
    return saved;
  }

  static async setLogo(id: string, logoUrl: string) {
    const p = await partenaireRepository.update(id, { logoUrl });
    logger.info(`🖼️ Logo mis à jour : ${p.nom}`);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    return p;
  }

  static async delete(id: string) {
<<<<<<< HEAD
    await this.findOne(id);
    await AppDataSource.getRepository(Partenaire).softDelete(id);
=======
    await partenaireRepository.findByIdOrFail(id);
    await partenaireRepository.softDelete(id);
    logger.info(`🗑️ Partenaire supprimé : ${id}`);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}