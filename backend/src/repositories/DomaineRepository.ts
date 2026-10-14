// src/repositories/DomaineRepository.ts
import { Domaine } from '../entities/Domaine.entity';
import { BaseRepository } from './base.repository';

export class DomaineRepository extends BaseRepository<Domaine> {
  constructor() {
    super(Domaine);
  }

  /* ==========================================================================
     🌐 PUBLIC
     ========================================================================== */
  async findPublic(): Promise<Domaine[]> {
    return this.qb('d')
      .where('d.actif = :actif', { actif: true })
      .andWhere('d.estPubliee = :publiee', { publiee: true })
      .orderBy('d.ordreAffichage', 'ASC')
      .getMany();
  }

  /* ==========================================================================
     🔍 PAR SLUG
     ========================================================================== */
  async findBySlug(slug: string): Promise<Domaine | null> {
    return this.findOne({ slug } as any, ['formations']);
  }

  /* ==========================================================================
     📊 STATS AVEC NOMBRE DE FORMATIONS
     ========================================================================== */
  async findAllWithFormationsCount() {
    const qb = this.qb('d')
      .leftJoin('d.formations', 'f')
      .loadRelationCountAndMap('d.formationsCount', 'd.formations')
      .where('d.deletedAt IS NULL');

    return qb.getMany();
  }
}

export const domaineRepository = new DomaineRepository();