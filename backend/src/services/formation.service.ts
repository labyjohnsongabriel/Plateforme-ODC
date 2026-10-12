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
  }
}