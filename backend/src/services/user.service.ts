// src/services/formation.service.ts
import slugifyLib from 'slugify';
import { formationRepository } from '../repositories/formation.repository';
import { AppDataSource } from '../config/database';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../errors/AppError';
import { logger } from '../config/logger';
import { NiveauFormation } from '../entities/enums';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICE
   ═══════════════════════════════════════════════════════════════════════════ */

export class FormationService {
  /* ══════════════════════════════════════════════════════════════════════════
     🌐 PUBLIC
     ══════════════════════════════════════════════════════════════════════════ */

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

  /* ══════════════════════════════════════════════════════════════════════════
     🔒 ADMIN / STAFF
     ══════════════════════════════════════════════════════════════════════════ */

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

  static async create(data: any) {
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

    const slug = data.slug || slugify(data.titre);

    const existing = await formationRepository.findOne({ slug } as any);
    if (existing) {
      throw new ConflictError('Une formation avec ce slug existe déjà');
    }

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

  static async update(id: string, data: any) {
    const formation = await formationRepository.findByIdOrFail(id);

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

    const updated = await formationRepository.update(id, data);
    logger.info(`📝 Formation mise à jour : ${updated.titre}`);
    return this.serialize(updated);
  }

  static async togglePublication(id: string, estPubliee: boolean) {
    const formation = await formationRepository.setPublication(id, estPubliee);
    logger.info(
      `${estPubliee ? '📢' : '📴'} Formation ${
        estPubliee ? 'publiée' : 'dépubliée'
      } : ${formation.titre}`,
    );
    return this.serialize(formation);
  }

  static async setImage(id: string, imageUrl: string) {
    const updated = await formationRepository.update(id, { imageUrl });
    return this.serialize(updated);
  }

  static async delete(id: string) {
    const formation = await formationRepository.findByIdOrFail(id);
    await formationRepository.softDelete(id);
    logger.info(`🗑️ Formation supprimée : ${formation.titre}`);
  }

  static async countByDomaine() {
    return formationRepository.countByDomaine();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ⭐⭐⭐ STATS DASHBOARD ADMIN
     ══════════════════════════════════════════════════════════════════════════ */

  static async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    totalSessions: number;
    totalInscriptions: number;
  }> {
    try {
      const rows = await AppDataSource.query(`
        SELECT
          (SELECT COUNT(*) FROM formations WHERE deleted_at IS NULL) AS total,
          (SELECT COUNT(*) FROM formations WHERE est_publiee = true AND deleted_at IS NULL) AS published,
          (SELECT COUNT(*) FROM formations WHERE est_publiee = false AND deleted_at IS NULL) AS draft,
          (SELECT COUNT(*) FROM sessions WHERE deleted_at IS NULL) AS total_sessions,
          (SELECT COUNT(*) FROM inscriptions) AS total_inscriptions
      `);

      const row = rows[0] ?? {};
      const stats = {
        total: Number(row.total) || 0,
        published: Number(row.published) || 0,
        draft: Number(row.draft) || 0,
        totalSessions: Number(row.total_sessions) || 0,
        totalInscriptions: Number(row.total_inscriptions) || 0,
      };

      logger.info('[FormationService.getStats] Stats:', stats);
      return stats;
    } catch (err: any) {
      logger.error('[FormationService.getStats] Erreur SQL', {
        message: err.message,
      });
      return {
        total: 0,
        published: 0,
        draft: 0,
        totalSessions: 0,
        totalInscriptions: 0,
      };
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     SÉRIALISATION
     ══════════════════════════════════════════════════════════════════════════ */

  private static serialize(formation: any) {
    return {
      id: formation.id,
      titre: formation.titre,
      slug: formation.slug,
      description: formation.description ?? '',
      descriptionCourte: formation.descriptionCourte ?? '',

      domaineId: formation.domaineId ?? null,
      domaine: formation.domaineRelation
        ? {
            id: formation.domaineRelation.id,
            nom: formation.domaineRelation.nom,
            slug: formation.domaineRelation.slug,
            couleur: formation.domaineRelation.couleur ?? '#FF7900',
          }
        : formation.domaine
          ? {
              id: formation.domaine.id,
              nom: formation.domaine.nom,
              slug: formation.domaine.slug,
              couleur: formation.domaine.couleur ?? '#FF7900',
            }
          : null,

      sessionsCount: Number(formation.sessionsCount ?? 0),
      inscriptionsCount: Number(formation.inscriptionsCount ?? 0),

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
  }
}