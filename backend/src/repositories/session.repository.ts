// src/repositories/SessionRepository.ts
import { Session } from '../entities/Session.entity';
import { BaseRepository } from './base.repository';
import { StatutSession } from '../entities/enums';

export class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super(Session);
  }

  async findByCode(codeSession: string): Promise<Session | null> {
    return this.qb('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      .leftJoinAndSelect('s.formateur', 'u')
      .where('s.code_session = :code', { code: codeSession })
      .getOne();
  }

  /** Sessions publiques (publiées + ouvertes) */
  async findPublic(filters: { statut?: StatutSession; page?: number; limit?: number } = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));

    const qb = this.qb('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('s.formateur', 'u')
      .where('s.est_publiee = true');

    if (filters.statut) qb.andWhere('s.statut = :st', { st: filters.statut });
    else qb.andWhere('s.statut IN (:...statuts)', {
      statuts: [StatutSession.OUVERTE, StatutSession.PLANIFIEE, StatutSession.EN_COURS],
    });

    qb.orderBy('s.date_debut', 'ASC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async search(filters: { formationId?: string; statut?: StatutSession; formateurId?: string; page?: number; limit?: number } = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));

    const qb = this.qb('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('s.formateur', 'u');

    if (filters.formationId) qb.andWhere('s.formation_id = :fid', { fid: filters.formationId });
    if (filters.statut) qb.andWhere('s.statut = :st', { st: filters.statut });
    if (filters.formateurId) qb.andWhere('s.formateur_id = :uid', { uid: filters.formateurId });

    qb.orderBy('s.date_debut', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findMesSessions(formateurId: string): Promise<Session[]> {
    return this.qb('s')
      .leftJoinAndSelect('s.formation', 'f')
      .where('s.formateur_id = :uid', { uid: formateurId })
      .orderBy('s.date_debut', 'DESC')
      .getMany();
  }

  /** Génère un code session unique ODC-YYYY-XXXX */
  async generateCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.qb('s')
      .where('EXTRACT(YEAR FROM s.created_at) = :y', { y: year })
      .getCount();
    const n = (count + 1).toString().padStart(4, '0');
    return `ODC-${year}-${n}`;
  }

  /** Met à jour la capacité disponible */
  async getPlacesRestantes(sessionId: string): Promise<number> {
    const session = await this.findByIdOrFail(sessionId);
    const inscrits = await this.qb('s')
      .leftJoin('s.inscriptions', 'i')
      .where('s.id = :id', { id: sessionId })
      .andWhere('i.statut = :st', { st: 'ACCEPTEE' })
      .getCount();
    return Math.max(0, session.capacite - inscrits);
  }
}

export const sessionRepository = new SessionRepository();