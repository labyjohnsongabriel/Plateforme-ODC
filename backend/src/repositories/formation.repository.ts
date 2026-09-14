import { BaseRepository } from './BaseRepository';
import { Formation } from '../models/Formation.entity';

export class FormationRepository extends BaseRepository<Formation> {
  constructor() {
    super(Formation);
  }

  async findWithSessions(id: string): Promise<Formation | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['sessions', 'sessions.formateur', 'sessions.formateur.role'],
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
      .leftJoinAndSelect('f.sessions', 's');

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
    return { data, total };
  }

  async findTop(limit = 5): Promise<any[]> {
    return this.repository
      .createQueryBuilder('f')
      .leftJoin('f.sessions', 's')
      .leftJoin('s.inscriptions', 'i')
      .select('f.titre', 'titre')
      .addSelect('COUNT(i.id)', 'inscriptions')
      .where('i.statut = :statut', { statut: 'ACCEPTEE' })
      .groupBy('f.titre')
      .orderBy('inscriptions', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async countByDomaine(): Promise<any[]> {
    return this.repository
      .createQueryBuilder('f')
      .select('f.domaine', 'domaine')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.actif = true')
      .groupBy('f.domaine')
      .getRawMany();
  }
}