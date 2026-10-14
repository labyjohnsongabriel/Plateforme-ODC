<<<<<<< HEAD
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
    //verifier une métier
     if (!data.titre || data.titre.trim().length < 3) {
    throw new Error('Le titre doit contenir au moins 3 caractères');
     }
     if (data.dureeHeures !== undefined && data.dureeHeures <= 0) {
    throw new Error('La durée doit être supérieure à 0');
  }

  if (data.nbParticipantsMax !== undefined && data.nbParticipantsMax < 0) {
    throw new Error('Le nombre de participants ne peut pas être négatif');
  }
          
  const existing = await this.repo.findOne({ 
    where: { titre: data.titre, deletedAt: null as any },
   });
    if (existing) throw new ConflictError('Formation deja existante');

    // Créer la formation
    const formation = this.repo.create(data);
    await this.repo.save(formation);
    logger.info(`Formation creee : ${formation.titre}`);
    return formation;
  }

  static async findAll(params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);

    const where: any = {
      ...(params.actif !== undefined ? { actif: params.actif } : {}),
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
    // Whitelist : on ne modifie QUE ces champs
  const allowedFields = [
    'titre', 'description', 'domaine', 'dureeHeures', 'niveau',
    'prerequis', 'objectifs', 'programme', 'imageUrl',
    'actif', 'nbParticipantsMax', 'domaineRelation',
  ];

   for (const field of allowedFields) {
    if (data[field] !== undefined) {
      (formation as any)[field] = data[field];
    }
  }
  
  await this.repo.save(formation);
  logger.info(`Formation mise à jour : ${formation.titre}`);
  return formation;
}

  static async delete(id: string) {
    await this.findById(id);
    await this.repo.softDelete({ id });
    logger.info(`Formation supprumée : ${id}`);
    return{message:'Formation supprimee avec succ'}
  }

  static async getTop(limit = 5) {
    return this.repo.createQueryBuilder('f')
      .innerJoin('f.sessions', 's')
      .innerJoin('s.inscriptions', 'i')
      .select('f.titre', 'titre')
      .addSelect('COUNT(i.id)', 'inscriptions')
      .where('i.statut = :statut', { statut: 'ACCEPTEE' })
      .andWhere('f.actif = true', { actif: true })
      .andWhere('f.deleted at IS NULL')
      .groupBy('f.id')
      .addGroupBy('f.titre')
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
=======
// src/services/formation.service.ts
import slugifyLib from 'slugify';
import { formationRepository } from '../repositories/formation.repository';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../errors/AppError';
import { logger } from '../config/logger';
import { NiveauFormation } from '../entities/enums';

/* ============================================================================
   HELPERS
   ============================================================================ */

function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    locale: 'fr',
    trim: true,
  });
}

function parseBoolean(value: any): boolean | undefined {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return undefined;
}

/* ============================================================================
   SERVICE
   ============================================================================ */

export class FormationService {
  /* ==========================================================================
     🌐 PUBLIC
     ========================================================================== */

  static async findAllPublic(filters: any) {
    return formationRepository.findPublic({
      q: filters.q,
      domaineId: filters.domaineId,
      niveau: filters.niveau as NiveauFormation | undefined,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 12,
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

    // ⭐ Incrémenter les vues en arrière-plan
    try {
      await formationRepository.incrementVues(formation.id);
      formation.nbVues = (formation.nbVues ?? 0) + 1;
    } catch (err) {
      logger.warn(
        `Impossible d'incrémenter les vues pour ${formation.id}: ${err}`,
      );
    }

    return formation;
  }

  static async getTopPublic(limit = 6) {
    return formationRepository.findTopPublic(limit);
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF
     ========================================================================== */

  /* ==========================================================================
     ⭐⭐⭐ LISTE ADMIN — LA CORRECTION CLÉ
     ========================================================================== */
  static async findAll(filters: any) {
    const result = await formationRepository.search({
      q: filters.q,
      domaineId: filters.domaineId,
      niveau:
        filters.niveau && filters.niveau !== 'all'
          ? (filters.niveau as NiveauFormation)
          : undefined,
      estPubliee: parseBoolean(filters.estPubliee),
      actif: parseBoolean(filters.actif),
      miseEnAvant: parseBoolean(filters.miseEnAvant),
      formateurId: filters.formateurId,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 20,
    });

    return {
      data: result.data.map(this.serialize),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /* ==========================================================================
     DÉTAIL
     ========================================================================== */
  static async findById(id: string) {
    const formation = await formationRepository.findByIdWithRelations(id, [
      'domaineRelation',
      'sessions',
    ]);

    if (!formation) {
      throw new NotFoundError('Formation introuvable');
    }

    return this.serialize(formation);
  }

  /* ==========================================================================
     CRÉATION
     ========================================================================== */
  static async create(data: any) {
    /* -------------------- Validation -------------------- */
    if (!data.titre) {
      throw new BadRequestError('Le titre est requis');
    }
    if (!data.description || data.description.length < 20) {
      throw new BadRequestError(
        'La description doit contenir au moins 20 caractères',
      );
    }
    if (!data.domaineId) {
      throw new BadRequestError('Le domaine est requis');
    }
    if (!data.dureeHeures || data.dureeHeures < 1) {
      throw new BadRequestError('La durée doit être supérieure à 0');
    }

    /* -------------------- Slug -------------------- */
    const slug = data.slug || slugify(data.titre);

    const existing = await formationRepository.findOne({
      slug,
    } as any);

    if (existing) {
      throw new ConflictError(
        'Une formation avec ce slug existe déjà',
      );
    }

    /* -------------------- Création -------------------- */
    const formation = await formationRepository.create({
      ...data,
      slug,
      estPubliee: data.estPubliee ?? false,
      miseEnAvant: data.miseEnAvant ?? false,
      nbVues: 0,
    });

    logger.info(
      `📚 Formation créée : ${formation.titre} (${formation.slug})`,
    );

    return this.serialize(formation);
  }

  /* ==========================================================================
     MISE À JOUR
     ========================================================================== */
  static async update(id: string, data: any) {
    const formation = await formationRepository.findByIdOrFail(id);

    /* -------------------- Vérifier slug si titre changé -------------------- */
    if (data.titre && data.titre !== formation.titre) {
      const newSlug = data.slug || slugify(data.titre);

      if (newSlug !== formation.slug) {
        const existing = await formationRepository.findOne({
          slug: newSlug,
        } as any);

        if (existing) {
          throw new ConflictError(
            'Une formation avec ce slug existe déjà',
          );
        }
        data.slug = newSlug;
      }
    }

    /* -------------------- Mise à jour -------------------- */
    const updated = await formationRepository.update(id, data);

    logger.info(`📝 Formation mise à jour : ${updated.titre}`);

    return this.serialize(updated);
  }

  /* ==========================================================================
     PUBLICATION
     ========================================================================== */
  static async togglePublication(id: string, estPubliee: boolean) {
    const formation = await formationRepository.setPublication(
      id,
      estPubliee,
    );

    logger.info(
      `${estPubliee ? '📢' : '📴'} Formation ${
        estPubliee ? 'publiée' : 'dépubliée'
      } : ${formation.titre}`,
    );

    return this.serialize(formation);
  }

  /* ==========================================================================
     IMAGE
     ========================================================================== */
  static async setImage(id: string, imageUrl: string) {
    const updated = await formationRepository.update(id, { imageUrl });
    return this.serialize(updated);
  }

  /* ==========================================================================
     SUPPRESSION
     ========================================================================== */
  static async delete(id: string) {
    const formation = await formationRepository.findByIdOrFail(id);
    await formationRepository.softDelete(id);
    logger.info(`🗑️ Formation supprimée : ${formation.titre}`);
  }

  /* ==========================================================================
     STATS PAR DOMAINE
     ========================================================================== */
  static async countByDomaine() {
    return formationRepository.countByDomaine();
  }

<<<<<<< HEAD
  /* ==========================================================================
     ⭐⭐⭐ SÉRIALISATION
     ========================================================================== */
  private static serialize(formation: any) {
    return {
      id: formation.id,
      titre: formation.titre,
      slug: formation.slug,
      description: formation.description ?? '',
      descriptionCourte: formation.descriptionCourte ?? '',

      // ⭐ Domaine
      domaineId: formation.domaineId ?? null,
      domaine: formation.domaineRelation
        ? {
            id: formation.domaineRelation.id,
            nom: formation.domaineRelation.nom,
            slug: formation.domaineRelation.slug,
            couleur:
              formation.domaineRelation.couleur ?? '#FF7900',
          }
        : formation.domaine
          ? {
              id: formation.domaine.id,
              nom: formation.domaine.nom,
              slug: formation.domaine.slug,
              couleur: formation.domaine.couleur ?? '#FF7900',
            }
          : null,

      // ⭐ Compteurs (CRITIQUE)
      sessionsCount: Number(formation.sessionsCount ?? 0),
      inscriptionsCount: Number(formation.inscriptionsCount ?? 0),

      // Autres champs
      niveau: formation.niveau ?? 'DEBUTANT',
      dureeHeures: Number(formation.dureeHeures ?? 0),
      prix: formation.prix !== null ? Number(formation.prix) : 0,
      nbParticipantsMax: Number(formation.nbParticipantsMax ?? 0),
      certifiante: formation.certifiante ?? false,
      miseEnAvant: formation.miseEnAvant ?? false,
      actif: formation.actif ?? true,
      estPubliee: formation.estPubliee ?? false,
      imageUrl: formation.imageUrl ?? null,
      objectifs: formation.objectifs ?? [],
      prerequis: formation.prerequis ?? [],
      programme: formation.programme ?? '',
      nbVues: Number(formation.nbVues ?? 0),
      createdAt: formation.createdAt,
      updatedAt: formation.updatedAt,
    };
=======
    // ⭐ Convertir count en number
    return results.map((r: any) => ({
      domaineId: r.domaineId,
      domaine: r.domaine ?? 'Sans domaine',
      couleur: r.couleur ?? '#6B7280',
      count: Number(r.count),
    }));
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
>>>>>>> origin/main
  }
}