// src/repositories/PartenaireRepository.ts
import { Partenaire } from '../entities/Partenaire.entity';
import { BaseRepository } from './base.repository';

export class PartenaireRepository extends BaseRepository<Partenaire> {
  constructor() { super(Partenaire); }

  async findPublic() {
    return this.qb('p')
      .where('p.actif = true').andWhere('p.est_publiee = true')
      .orderBy('p.ordre_affichage', 'ASC').getMany();
  }

  async findBySlug(slug: string): Promise<Partenaire | null> {
    return this.findOne({ slug } as any);
  }
}
export const partenaireRepository = new PartenaireRepository();