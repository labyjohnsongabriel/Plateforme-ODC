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

    // ⭐ Incrémenter les vues en arrière-plan (ne bloque pas la réponse)
    try {
      await formationRepository.incrementVues(formation.id);
      formation.nbVues = (formation.nbVues ?? 0) + 1;
    } catch (err) {
      logger.warn(
        `Impossible d'incrémenter les vues pour ${formation.id}:`,
        err,
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

    /* -------------------- Slug -------------------- */
    const slug = data.slug || slugify(data.titre);

    const existing = await formationRepository.findOne({ slug } as any);
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

    logger.info(`📚 Formation créée : ${formation.titre} (${formation.slug})`);

    return formation;
  }

  static async findAll(filters: any) {
    return formationRepository.search({
      q: filters.q,
      domaineId: filters.domaineId,
      niveau: filters.niveau as NiveauFormation | undefined,
      estPubliee:
        filters.estPubliee === 'true'
          ? true
          : filters.estPubliee === 'false'
            ? false
            : undefined,
      actif:
        filters.actif === 'true'
          ? true
          : filters.actif === 'false'
            ? false
            : undefined,
      miseEnAvant:
        filters.miseEnAvant === 'true'
          ? true
          : filters.miseEnAvant === 'false'
            ? false
            : undefined,
      formateurId: filters.formateurId,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 20,
    });
  }

  static async findById(id: string) {
    return formationRepository.findByIdOrFail(id, [
      'domaineRelation',
      'sessions',
    ]);
  }

  static async update(id: string, data: any) {
    const formation = await formationRepository.findByIdOrFail(id);

    /* -------------------- Vérifier slug si titre changé -------------------- */
    if (data.titre && data.titre !== formation.titre) {
      const newSlug =
        data.slug || slugify(data.titre);

      // Vérifier unicité si le slug change
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

    return updated;
  }

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

    return formation;
  }

  static async setImage(id: string, imageUrl: string) {
    return formationRepository.update(id, { imageUrl });
  }

  static async delete(id: string) {
    await formationRepository.softDelete(id);
    logger.info(`🗑️ Formation supprimée : ${id}`);
  }

  static async countByDomaine() {
    const results = await formationRepository.countByDomaine();

    // ⭐ Convertir count en number
    return results.map((r: any) => ({
      domaineId: r.domaineId,
      domaine: r.domaine ?? 'Sans domaine',
      couleur: r.couleur ?? '#6B7280',
      count: Number(r.count),
    }));
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}