<<<<<<< HEAD
import { BaseRepository } from './BaseRepository';
import { Formation } from '../models/Formation.entity';
=======
// src/repositories/FormationRepository.ts
import { Brackets } from 'typeorm';
import { Formation } from '../entities/Formation.entity';
import { BaseRepository } from './base.repository';
import { NiveauFormation } from '../entities/enums';

export interface FormationFilters {
  q?: string;
  domaineId?: string;
  niveau?: NiveauFormation | 'all';
  estPubliee?: boolean;
  actif?: boolean;
  miseEnAvant?: boolean;
  formateurId?: string;
  page?: number;
  limit?: number;
}

<<<<<<< HEAD
=======
/* ============================================================================
   REPOSITORY
   ============================================================================ */
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

>>>>>>> origin/main
export class FormationRepository extends BaseRepository<Formation> {
  constructor() {
    super(Formation);
  }

<<<<<<< HEAD
  async findWithSessions(id: string): Promise<Formation | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['sessions', 'sessions.formateur',],
    });
  }

  async findByFilters(params: {
    page: number;
    limit: number;
    domaine?: string;
    niveau?: string;
    search?: string;
    actif?: boolean;
  }) {
    const qb = this.repository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.sessions', 's')
      .where('f.deleted_at IS NULL'); 

    if (params.actif !== undefined) {
      qb.andWhere('f.actif = :actif', { actif: params.actif });
    }
    if (params.domaine) {
      qb.andWhere('f.domaine ILIKE :domaine', { domaine: `%${params.domaine}%` });
    }
    if (params.niveau) {
      qb.andWhere('f.niveau = :niveau', { niveau: params.niveau });
    }
    if (params.search) {
      qb.andWhere(
        '(f.titre ILIKE :q OR f.description ILIKE :q)',
        { q: `%${params.search}%` }
      );
    }

    qb.orderBy('f.created_at', 'DESC')
      .skip((params.page - 1) * params.limit)
      .take(params.limit);

    const [data, total] = await qb.getManyAndCount();
    return { data,
             total,
             page : params.page, 
            limit: params.limit
    };
  }

  async findTop(limit = 5): Promise<any[]> {
    return this.repository
      .createQueryBuilder('f')
      .innerJoin('f.sessions', 's')
      .innerJoin('s.inscriptions', 'i')
      .select('f.titre', 'titre')
      .addSelect('COUNT(i.id)', 'inscriptions')
      .where('i.statut = :statut', { statut: 'ACCEPTEE' })
      .andWhere('f.actif = true')
      .groupBy('f.id')
      .addGroupBy('f.titre')
      .orderBy('inscriptions', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async countByDomaine(): Promise<any[]> {
    return this.repository
      .createQueryBuilder('f')
      .select('f.domaine', 'domaine')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.actif = :actif', { actif: true })
      .andWhere('f.deleted_Cat IS NULL')
      .groupBy('f.domaine')
      .getRawMany();
  }
}
=======
  /* ==========================================================================
     🌐 CATALOGUE PUBLIC
     ========================================================================== */
  async findPublic(filters: FormationFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(filters.limit) || 10),
    );

    const qb = this.qb('f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      // ⭐ Compter les sessions uniquement
      .loadRelationCountAndMap('f.sessionsCount', 'f.sessions')
      .where('f.estPubliee = :publiee', { publiee: true })
      .andWhere('f.actif = :actif', { actif: true })
      .andWhere('f.deletedAt IS NULL');

    if (filters.q && filters.q.trim()) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('f.titre ILIKE :q', { q: `%${filters.q}%` })
            .orWhere('f.description ILIKE :q', {
              q: `%${filters.q}%`,
            });
        }),
      );
    }

    if (filters.domaineId) {
      qb.andWhere('f.domaineId = :did', { did: filters.domaineId });
    }

    if (filters.niveau && filters.niveau !== 'all') {
      qb.andWhere('f.niveau = :n', { n: filters.niveau });
    }

    qb.orderBy('f.miseEnAvant', 'DESC').addOrderBy(
      'f.createdAt',
      'DESC',
    );

    const total = await qb.getCount();
    const data = await qb
      .offset((page - 1) * limit)
      .limit(limit)
      .getMany();

    // ⭐ Enrichir avec inscriptionsCount via requête séparée
    const enriched = await this.enrichWithInscriptionsCount(data);

    return {
      data: enriched.map(this.normalize),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /* ==========================================================================
     🔒 ADMIN — Recherche
     ========================================================================== */
  async search(filters: FormationFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(filters.limit) || 20),
    );

    const qb = this.qb('f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      // ⭐ Compter les sessions uniquement
      .loadRelationCountAndMap('f.sessionsCount', 'f.sessions')
      .where('f.deletedAt IS NULL');

    if (filters.q && filters.q.trim()) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('f.titre ILIKE :q', { q: `%${filters.q}%` })
            .orWhere('f.slug ILIKE :q', { q: `%${filters.q}%` })
            .orWhere('f.description ILIKE :q', {
              q: `%${filters.q}%`,
            });
        }),
      );
    }

    if (filters.domaineId) {
      qb.andWhere('f.domaineId = :did', { did: filters.domaineId });
    }

    if (filters.niveau && filters.niveau !== 'all') {
      qb.andWhere('f.niveau = :n', { n: filters.niveau });
    }

    if (filters.estPubliee !== undefined) {
      qb.andWhere('f.estPubliee = :p', { p: filters.estPubliee });
    }

    if (filters.actif !== undefined) {
      qb.andWhere('f.actif = :a', { a: filters.actif });
    }

    if (filters.miseEnAvant !== undefined) {
      qb.andWhere('f.miseEnAvant = :m', { m: filters.miseEnAvant });
    }

    if (filters.formateurId) {
      qb.leftJoin('f.sessions', 'fs').andWhere(
        'fs.formateurId = :fid',
        { fid: filters.formateurId },
      );
    }

    qb.orderBy('f.createdAt', 'DESC').addOrderBy(
      'f.miseEnAvant',
      'DESC',
    );

    const total = await qb.getCount();
    const data = await qb
      .offset((page - 1) * limit)
      .limit(limit)
      .getMany();

    // ⭐ Enrichir avec inscriptionsCount via requête séparée
    const enriched = await this.enrichWithInscriptionsCount(data);

    return {
      data: enriched.map(this.normalize),
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
    const data = await this.qb('f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      .loadRelationCountAndMap('f.sessionsCount', 'f.sessions')
      .where('f.estPubliee = :publiee', { publiee: true })
      .andWhere('f.actif = :actif', { actif: true })
      .andWhere('f.deletedAt IS NULL')
      .orderBy('f.miseEnAvant', 'DESC')
      .addOrderBy('f.nbVues', 'DESC')
      .limit(limit)
      .getMany();

    const enriched = await this.enrichWithInscriptionsCount(data);
    return enriched.map(this.normalize);
  }

  /* ==========================================================================
     🔍 PAR SLUG
     ========================================================================== */
  async findBySlug(slug: string): Promise<Formation | null> {
    const formation = await this.qb('f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      .loadRelationCountAndMap('f.sessionsCount', 'f.sessions')
      .where('f.slug = :slug', { slug })
      .andWhere('f.deletedAt IS NULL')
      .getOne();

    if (!formation) return null;

    const [enriched] = await this.enrichWithInscriptionsCount([
      formation,
    ]);
    return this.normalize(enriched);
  }

  /* ==========================================================================
     ⭐⭐ PAR ID AVEC RELATIONS
     ========================================================================== */
  async findByIdWithRelations(
    id: string,
    relations: string[] = [],
  ): Promise<Formation | null> {
    const formation = await this.qb('f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      .loadRelationCountAndMap('f.sessionsCount', 'f.sessions')
      .where('f.id = :id', { id })
      .andWhere('f.deletedAt IS NULL')
      .getOne();

    if (!formation) return null;

    const [enriched] = await this.enrichWithInscriptionsCount([
      formation,
    ]);
    return this.normalize(enriched);
  }

  /* ==========================================================================
     ⭐⭐ PAR ID OU ÉCHOUER
     ========================================================================== */
  async findByIdOrFail(
    id: string,
    relations: string[] = [],
  ): Promise<Formation> {
    const formation = await this.findByIdWithRelations(id, relations);

    if (!formation) {
      throw new Error('Formation introuvable');
    }

    return formation;
  }

  /* ==========================================================================
     ⭐⭐⭐ ENRICHISSEMENT — Compte les inscriptions via les sessions
     ========================================================================== */
  private async enrichWithInscriptionsCount(
    formations: Formation[],
  ): Promise<Formation[]> {
    if (!formations.length) return formations;

    const ids = formations.map((f) => f.id);

    /* -------------------- Requête COUNT -------------------- */
    const counts = await this.repo.manager
      .createQueryBuilder()
      .select('s.formationId', 'formationId')
      .addSelect('COUNT(DISTINCT i.id)', 'count')
      .from('inscriptions', 'i')
      .leftJoin('sessions', 's', 's.id = i.session_id')
      .where('s.formation_id IN (:...ids)', { ids })
      .andWhere('i.deleted_at IS NULL')
      .groupBy('s.formationId')
      .getRawMany();

    /* -------------------- Map des compteurs -------------------- */
    const countMap = new Map<string, number>();
    counts.forEach((c: any) => {
      countMap.set(c.formationId, Number(c.count));
    });

    /* -------------------- Enrichir -------------------- */
    return formations.map((f) => ({
      ...f,
      inscriptionsCount: countMap.get(f.id) ?? 0,
    }));
  }

  /* ==========================================================================
     📈 INCRÉMENTER LES VUES
     ========================================================================== */
  async incrementVues(id: string): Promise<void> {
    try {
      await this.repo.increment({ id } as any, 'nbVues', 1);
    } catch {
      // Silencieux
    }
  }

  /* ==========================================================================
     📢 PUBLICATION
     ========================================================================== */
  async setPublication(
    id: string,
    estPubliee: boolean,
  ): Promise<Formation> {
    const formation = await this.findByIdOrFail(id);
    formation.estPubliee = estPubliee;
    if (estPubliee && !formation.datePublication) {
      formation.datePublication = new Date();
    }
    return this.save(formation);
  }

  /* ==========================================================================
     📊 STATS PAR DOMAINE
     ========================================================================== */
  async countByDomaine() {
    const results = await this.qb('f')
      .leftJoin('f.domaineRelation', 'd')
      .where('f.deletedAt IS NULL')
      .select('d.id', 'domaineId')
      .addSelect('d.nom', 'domaine')
      .addSelect('d.couleur', 'couleur')
      .addSelect('COUNT(f.id)', 'count')
      .groupBy('d.id')
      .addGroupBy('d.nom')
      .addGroupBy('d.couleur')
      .getRawMany();

    return results.map((r: any) => ({
      domaineId: r.domaineId,
      domaine: r.domaine ?? 'Sans domaine',
      couleur: r.couleur ?? '#6B7280',
      count: Number(r.count),
    }));
  }

  /* ==========================================================================
     ⭐ NORMALISATION
     ========================================================================== */
  private normalize(formation: any): Formation {
    return {
      ...formation,
      domaine: formation.domaineRelation,
      sessionsCount: Number(formation.sessionsCount ?? 0),
      inscriptionsCount: Number(formation.inscriptionsCount ?? 0),
    } as Formation;
  }
}

export const formationRepository = new FormationRepository();
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
