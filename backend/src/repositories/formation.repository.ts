// src/repositories/FormationRepository.ts
import { Formation } from '../entities/Formation.entity';
import { BaseRepository } from './base.repository';
import { NiveauFormation } from '../entities/enums';

export interface FormationFilters {
  q?: string;
  domaineId?: string;
  niveau?: NiveauFormation;
  estPubliee?: boolean;
  actif?: boolean;
  page?: number;
  limit?: number;
}

export class FormationRepository extends BaseRepository<Formation> {
  constructor() {
    super(Formation);
  }

  async findBySlug(slug: string, relations: string[] = ['domaineRelation']): Promise<Formation | null> {
    return this.findOne({ slug } as any, relations);
  }

  /** Catalogue public : publiées + actives + domaine */
  async findPublic(filters: FormationFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));

    const qb = this.qb('f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      .where('f.est_publiee = true')
      .andWhere('f.actif = true');

    if (filters.q) {
      qb.andWhere('(f.titre ILIKE :q OR f.description ILIKE :q)', { q: `%${filters.q}%` });
    }
    if (filters.domaineId) qb.andWhere('f.domaine_id = :did', { did: filters.domaineId });
    if (filters.niveau) qb.andWhere('f.niveau = :n', { n: filters.niveau });

    qb.orderBy('f.mise_en_avant', 'DESC')
      .addOrderBy('f.date_publication', 'DESC', 'NULLS LAST')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Admin/staff : toutes formations */
  async search(filters: FormationFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));

    const qb = this.qb('f').leftJoinAndSelect('f.domaineRelation', 'd');

    if (filters.q) qb.andWhere('f.titre ILIKE :q', { q: `%${filters.q}%` });
    if (filters.domaineId) qb.andWhere('f.domaine_id = :did', { did: filters.domaineId });
    if (filters.estPubliee !== undefined) qb.andWhere('f.est_publiee = :p', { p: filters.estPubliee });
    if (filters.actif !== undefined) qb.andWhere('f.actif = :a', { a: filters.actif });

    qb.orderBy('f.created_at', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Top formations publiques */
  async findTopPublic(limit = 6): Promise<Formation[]> {
    return this.qb('f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      .where('f.est_publiee = true')
      .andWhere('f.actif = true')
      .orderBy('f.mise_en_avant', 'DESC')
      .addOrderBy('f.nb_vues', 'DESC')
      .limit(limit)
      .getMany();
  }

  /** Incrément vues */
  async incrementVues(id: string): Promise<void> {
    await this.repo.increment({ id } as any, 'nbVues', 1);
  }

  /** Publication/dépublication */
  async setPublication(id: string, estPubliee: boolean): Promise<Formation> {
    const f = await this.findByIdOrFail(id);
    f.estPubliee = estPubliee;
    f.datePublication = estPubliee ? new Date() : f.datePublication;
    return this.save(f);
  }

  /** Statistiques par domaine */
  async countByDomaine() {
    return this.qb('f')
      .leftJoin('f.domaineRelation', 'd')
      .select('d.nom', 'domaine')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.actif = true')
      .groupBy('d.nom')
      .getRawMany();
  }
}

export const formationRepository = new FormationRepository();