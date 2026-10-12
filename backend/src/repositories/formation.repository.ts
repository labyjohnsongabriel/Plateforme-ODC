// src/repositories/FormationRepository.ts
import { Formation } from '../entities/Formation.entity';
import { BaseRepository } from './base.repository';
import { NiveauFormation } from '../entities/enums';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface FormationFilters {
  q?: string;
  domaineId?: string;
  niveau?: NiveauFormation;
  estPubliee?: boolean;
  actif?: boolean;
  miseEnAvant?: boolean;
  formateurId?: string;
  page?: number;
  limit?: number;
}

/* ============================================================================
   REPOSITORY
   ============================================================================ */

export class FormationRepository extends BaseRepository<Formation> {
  constructor() {
    super(Formation);
  }

  /* ==========================================================================
     Trouver par slug
     ========================================================================== */
  async findBySlug(
    slug: string,
    relations: string[] = ['domaineRelation'],
  ): Promise<Formation | null> {
    return this.findOne({ slug } as any, relations);
  }

  /* ==========================================================================
     🌐 CATALOGUE PUBLIC
     ========================================================================== */
  async findPublic(filters: FormationFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));

    const qb = this.qb('f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      // ⭐ CORRECTION : f.estPubliee (propriété TS), pas f.est_publiee
      .where('f.estPubliee = :publiee', { publiee: true })
      // ⭐ f.actif n'existe pas sur Formation → on l'enlève
      .andWhere('f.deletedAt IS NULL');

    /* -------------------- Recherche full-text -------------------- */
    if (filters.q) {
      qb.andWhere(
        '(f.titre ILIKE :q OR f.description ILIKE :q OR f.resume ILIKE :q)',
        { q: `%${filters.q}%` },
      );
    }

    /* -------------------- Filtre domaine -------------------- */
    if (filters.domaineId) {
      // ⭐ f.domaineId (propriété TS), pas f.domaine_id
      qb.andWhere('f.domaineId = :did', { did: filters.domaineId });
    }

    /* -------------------- Filtre niveau -------------------- */
    if (filters.niveau) {
      qb.andWhere('f.niveau = :n', { n: filters.niveau });
    }

    /* -------------------- Tri + Pagination -------------------- */
    // ⭐ f.miseEnAvant, f.createdAt (propriétés TS)
    qb.orderBy('f.miseEnAvant', 'DESC')
      .addOrderBy('f.createdAt', 'DESC')   // ⭐ pas date_publication
      .skip((page - 1) * limit)
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

  /* ==========================================================================
     🔒 ADMIN / STAFF — Recherche
     ========================================================================== */
  async search(filters: FormationFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));

    const qb = this.qb('f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      .where('f.deletedAt IS NULL');   // ⭐ exclure soft-deleted

    /* -------------------- Recherche -------------------- */
    if (filters.q) {
      qb.andWhere(
        '(f.titre ILIKE :q OR f.slug ILIKE :q)',
        { q: `%${filters.q}%` },
      );
    }

    /* -------------------- Domaine -------------------- */
    if (filters.domaineId) {
      qb.andWhere('f.domaineId = :did', { did: filters.domaineId });
    }

    /* -------------------- Niveau -------------------- */
    if (filters.niveau) {
      qb.andWhere('f.niveau = :n', { n: filters.niveau });
    }

    /* -------------------- Publication -------------------- */
    // ⭐ f.estPubliee (propriété TS)
    if (filters.estPubliee !== undefined) {
      qb.andWhere('f.estPubliee = :p', { p: filters.estPubliee });
    }

    /* -------------------- Mise en avant -------------------- */
    if (filters.miseEnAvant !== undefined) {
      qb.andWhere('f.miseEnAvant = :m', { m: filters.miseEnAvant });
    }

    /* -------------------- Formateur -------------------- */
    if (filters.formateurId) {
      qb.andWhere('f.formateurId = :fid', { fid: filters.formateurId });
    }

    /* -------------------- ⭐ TRI (le FIX principal) -------------------- */
    // ⭐ f.createdAt (propriété TS), PAS f.created_at (colonne DB)
    qb.orderBy('f.createdAt', 'DESC')
      .addOrderBy('f.miseEnAvant', 'DESC')
      .skip((page - 1) * limit)
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

  /* ==========================================================================
     🌐 TOP PUBLIC
     ========================================================================== */
  async findTopPublic(limit = 6): Promise<Formation[]> {
    return this.qb('f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      // ⭐ f.estPubliee (propriété TS)
      .where('f.estPubliee = :publiee', { publiee: true })
      .andWhere('f.deletedAt IS NULL')
      // ⭐ f.miseEnAvant, f.nbVues (propriétés TS)
      .orderBy('f.miseEnAvant', 'DESC')
      .addOrderBy('f.nbVues', 'DESC')
      .limit(limit)
      .getMany();
  }

  /* ==========================================================================
     📈 Incrémenter les vues
     ========================================================================== */
  async incrementVues(id: string): Promise<void> {
    await this.repo.increment({ id } as any, 'nbVues', 1);
  }

  /* ==========================================================================
     📢 Publication / Dépublication
     ========================================================================== */
  async setPublication(id: string, estPubliee: boolean): Promise<Formation> {
    const formation = await this.findByIdOrFail(id);
    formation.estPubliee = estPubliee;
    // ⭐ On ne touche pas à datePublication (peut ne pas exister sur l'entité)
    return this.save(formation);
  }

  /* ==========================================================================
     📊 Statistiques par domaine
     ========================================================================== */
  async countByDomaine() {
    return this.qb('f')
      .leftJoin('f.domaineRelation', 'd')
      // ⭐ Retirer f.actif (propriété inexistante)
      .where('f.deletedAt IS NULL')
      .select('d.id', 'domaineId')
      .addSelect('d.nom', 'domaine')
      .addSelect('d.couleur', 'couleur')
      .addSelect('COUNT(f.id)', 'count')
      .groupBy('d.id')
      .addGroupBy('d.nom')
      .addGroupBy('d.couleur')
      .getRawMany();
  }
}

export const formationRepository = new FormationRepository();