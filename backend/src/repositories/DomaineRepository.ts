// src/repositories/DomaineRepository.ts
import { Domaine } from '../entities/Domaine.entity';
import { BaseRepository } from './base.repository';

export class DomaineRepository extends BaseRepository<Domaine> {
  constructor() { super(Domaine); }

  async findPublic(): Promise<Domaine[]> {
    return this.qb('d')
      .where('d.actif = true').andWhere('d.est_publiee = true')
      .orderBy('d.ordre_affichage', 'ASC').getMany();
  }

  async findBySlug(slug: string): Promise<Domaine | null> {
    return this.findOne({ slug } as any, ['formations']);
  }
}
export const domaineRepository = new DomaineRepository();