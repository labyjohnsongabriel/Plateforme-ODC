// src/services/domaine.service.ts
import slugify from 'slugify';
import { domaineRepository } from '../repositories/DomaineRepository';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { logger } from '../config/logger';

export class DomaineService {
  // ==========================================================================
  // 🌐 PUBLIC (sans authentification)
  // ==========================================================================

  /** Liste des domaines publiés et actifs (page publique) */
  static async listPublic() {
    return domaineRepository.findPublic();
  }

  /** Détail public d'un domaine par slug + formations publiées associées */
  static async detailPublic(slug: string) {
    const domaine = await domaineRepository.findBySlug(slug);
    if (!domaine || !domaine.estPubliee || !domaine.actif) {
      throw new NotFoundError('Domaine introuvable');
    }
    return domaine;
  }

  // ==========================================================================
  // 🔒 ADMIN / STAFF
  // ==========================================================================

  /** Liste paginée de tous les domaines avec filtres */
  static async findAll(filters: any = {}) {
    const { page, limit, skip } = getPagination(filters.page, filters.limit);

    const qb = domaineRepository.raw
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.formations', 'f');

    if (filters.q) {
      qb.andWhere('(d.nom ILIKE :q OR d.description ILIKE :q)', {
        q: `%${filters.q}%`,
      });
    }
    if (filters.actif !== undefined) {
      const actif = filters.actif === 'true' || filters.actif === true;
      qb.andWhere('d.actif = :a', { a: actif });
    }
    if (filters.estPubliee !== undefined) {
      const publiee = filters.estPubliee === 'true' || filters.estPubliee === true;
      qb.andWhere('d.est_publiee = :p', { p: publiee });
    }

    qb.orderBy('d.ordre_affichage', 'ASC')
      .addOrderBy('d.nom', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Détail complet par id (avec formations) */
  static async findById(id: string) {
    const domaine = await domaineRepository.findById(id, ['formations']);
    if (!domaine) throw new NotFoundError('Domaine introuvable');
    return domaine;
  }

  /** Création avec slug auto + vérification d'unicité (nom + slug) */
  static async create(data: any) {
    const { nom } = data;
    if (!nom || typeof nom !== 'string' || nom.trim().length === 0) {
      throw new BadRequestError('Le nom du domaine est requis');
    }

    const slug = data.slug || slugify(nom, { lower: true, strict: true });

    // Vérifier l'unicité du slug
    if (await domaineRepository.findOne({ slug } as any)) {
      throw new ConflictError('Un domaine avec ce slug existe déjà');
    }

    // Vérifier l'unicité du nom
    if (await domaineRepository.findOne({ nom } as any)) {
      throw new ConflictError('Un domaine avec ce nom existe déjà');
    }

    const domaine = await domaineRepository.create({
      nom: nom.trim(),
      slug,
      description: data.description,
      couleur: data.couleur,
      icone: data.icone,
      imageUrl: data.imageUrl,
      actif: data.actif ?? true,
      estPubliee: data.estPubliee ?? false,
      ordreAffichage: data.ordreAffichage ?? 0,
    });

    logger.info(`🏷️ Domaine créé : ${domaine.nom} (${domaine.slug})`);
    return domaine;
  }

  /** Mise à jour avec re-slugification et vérification d'unicité */
  static async update(id: string, data: any) {
    const domaine = await domaineRepository.findByIdOrFail(id);

    // Re-slugifier si le nom change et que le slug n'est pas fourni
    if (data.nom && data.nom !== domaine.nom && !data.slug) {
      data.slug = slugify(data.nom, { lower: true, strict: true });
    }

    // Vérifier l'unicité du slug
    if (data.slug && data.slug !== domaine.slug) {
      const existing = await domaineRepository.findOne({ slug: data.slug } as any);
      if (existing && existing.id !== id) {
        throw new ConflictError('Slug déjà utilisé par un autre domaine');
      }
    }

    // Vérifier l'unicité du nom
    if (data.nom && data.nom !== domaine.nom) {
      const existing = await domaineRepository.findOne({ nom: data.nom } as any);
      if (existing && existing.id !== id) {
        throw new ConflictError('Nom déjà utilisé par un autre domaine');
      }
    }

    Object.assign(domaine, data);
    const saved = await domaineRepository.save(domaine);

    logger.info(`📝 Domaine mis à jour : ${saved.nom}`);
    return saved;
  }

  /** Publier / dépublier un domaine */
  static async togglePublication(id: string, estPubliee: boolean) {
    const domaine = await domaineRepository.findByIdOrFail(id);
    domaine.estPubliee = estPubliee;
    const saved = await domaineRepository.save(domaine);

    logger.info(
      `${estPubliee ? '📢' : '📴'} Domaine ${estPubliee ? 'publié' : 'dépublié'} : ${saved.nom}`,
    );
    return saved;
  }

  /** Mettre à jour l'image de couverture */
  static async setImage(id: string, imageUrl: string) {
    const domaine = await domaineRepository.findByIdOrFail(id);
    domaine.imageUrl = imageUrl;
    const saved = await domaineRepository.save(domaine);

    logger.info(`🖼️ Image mise à jour : ${saved.nom}`);
    return saved;
  }

  /** Suppression avec vérification d'intégrité (formations liées) */
  static async delete(id: string) {
    const domaine = await domaineRepository.findByIdOrFail(id, ['formations']);

    if (domaine.formations && domaine.formations.length > 0) {
      throw new ConflictError(
        `Impossible de supprimer : ${domaine.formations.length} formation(s) utilisent ce domaine`,
      );
    }

    await domaineRepository.softDelete(id);
    logger.info(`🗑️ Domaine supprimé : ${domaine.nom}`);
  }

  /** Nombre de formations par domaine */
  static async statsByDomaine() {
    const rows = await domaineRepository.raw
      .createQueryBuilder('d')
      .leftJoin('d.formations', 'f')
      .select('d.nom', 'domaine')
      .addSelect('COUNT(f.id)', 'formations')
      .where('d.actif = true')
      .groupBy('d.nom')
      .orderBy('formations', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      domaine: r.domaine,
      formations: Number(r.formations ?? 0),
    }));
  }

  /** Compte total des domaines actifs */
  static async count() {
    return domaineRepository.count({ actif: true } as any);
  }
}