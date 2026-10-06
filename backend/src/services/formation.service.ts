// src/services/formation.service.ts
import slugify from 'slugify';
import { formationRepository } from '../repositories/formation.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/AppError';
import { logger } from '../config/logger';

export class FormationService {
  // ==================== 🌐 PUBLIC ====================
  static async findAllPublic(filters: any) {
    return formationRepository.findPublic({
      q: filters.q,
      domaineId: filters.domaineId,
      niveau: filters.niveau,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 10,
    });
  }

  static async findBySlugPublic(slug: string) {
    const formation = await formationRepository.findBySlug(slug, [
      'domaineRelation',
      'sessions',
    ]);
    if (!formation || !formation.estPubliee) {
      throw new NotFoundError('Formation introuvable ou non publiée');
    }
    await formationRepository.incrementVues(formation.id);
    return formation;
  }

  static async getTopPublic(limit = 6) {
    return formationRepository.findTopPublic(limit);
  }

  // ==================== 🔒 ADMIN / STAFF ====================
  static async create(data: any) {
    if (!data.titre) throw new BadRequestError('Titre requis');
    const slug = data.slug || slugify(data.titre, { lower: true, strict: true });
    if (await formationRepository.findOne({ slug } as any)) {
      throw new ConflictError('Une formation avec ce slug existe déjà');
    }
    const formation = await formationRepository.create({ ...data, slug });
    logger.info(`📚 Formation créée : ${formation.titre}`);
    return formation;
  }

  static async findAll(filters: any) {
    return formationRepository.search({
      q: filters.q,
      domaineId: filters.domaineId,
      estPubliee: filters.estPubliee === 'true' ? true : filters.estPubliee === 'false' ? false : undefined,
      actif: filters.actif === 'true' ? true : filters.actif === 'false' ? false : undefined,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 10,
    });
  }

  static async findById(id: string) {
    return formationRepository.findByIdOrFail(id, ['domaineRelation', 'sessions']);
  }

  static async update(id: string, data: any) {
    if (data.titre && !data.slug) {
      data.slug = slugify(data.titre, { lower: true, strict: true });
    }
    return formationRepository.update(id, data);
  }

  static async togglePublication(id: string, estPubliee: boolean) {
    const f = await formationRepository.setPublication(id, estPubliee);
    logger.info(`${estPubliee ? '📢' : '📴'} Formation ${estPubliee ? 'publiée' : 'dépubliée'} : ${f.titre}`);
    return f;
  }

  static async setImage(id: string, imageUrl: string) {
    return formationRepository.update(id, { imageUrl });
  }

  static async delete(id: string) {
    await formationRepository.softDelete(id);
    logger.info(`🗑️ Formation supprimée : ${id}`);
  }

  static async countByDomaine() {
    return formationRepository.countByDomaine();
  }
}