// src/repositories/RessourceRepository.ts
import { Ressource } from '../entities/Ressource.entity';
import { BaseRepository } from './base.repository';
import { BadRequestError } from '../errors/AppError';
import { StatutInscription } from '../entities/enums';

interface RessourceFilters {
  sessionId?: string;
  type?: string;
  visibleParticipants?: boolean;
  formateurId?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export class RessourceRepository extends BaseRepository<Ressource> {
  constructor() {
    super(Ressource);
  }

  async findBySession(sessionId: string, visiblesSeulement = false): Promise<Ressource[]> {
    const qb = this.qb('r')
      .leftJoinAndSelect('r.uploadeParUser', 'u')
      .leftJoin('r.session', 's')
      .where('r.session_id = :sid', { sid: sessionId });

    if (visiblesSeulement) {
      qb.andWhere('r.visible_participants = true');
    }

    return qb.orderBy('r.ordre_affichage', 'ASC').getMany();
  }

  async findForParticipant(
    participantId: string,
    sessionId?: string,
    ressourceId?: string
  ): Promise<Ressource[]> {
    const qb = this.qb('r')
      .innerJoinAndSelect('r.session', 's')
      .innerJoin('s.inscriptions', 'i', 'i.participantId = :participantId AND i.statut = :statut', {
        participantId,
        statut: StatutInscription.ACCEPTEE,
      })
      .leftJoinAndSelect('s.formation', 'formation')
      .leftJoinAndSelect('r.uploadeParUser', 'u')
      .where('r.visibleParticipants = true')
      .orderBy('r.createdAt', 'DESC');

    if (sessionId) {
      qb.andWhere('s.id = :sessionId', { sessionId });
    }
    if (ressourceId) {
      qb.andWhere('r.id = :ressourceId', { ressourceId });
    }

    return qb.getMany();
  }

  async incrementerTelechargement(id: string): Promise<void> {
    await this.raw.increment({ id } as any, 'nbTelechargements', 1);
  }

  async findPaginated(filters: RessourceFilters) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const qb = this.qb('r')
      .leftJoinAndSelect('r.uploadeParUser', 'u')
      .orderBy('r.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.sessionId) {
      qb.andWhere('r.sessionId = :sessionId', { sessionId: filters.sessionId });
    }
    if (filters.formateurId) {
      qb.innerJoin('r.session', 's');
      qb.andWhere('s.formateurId = :formateurId', {
        formateurId: filters.formateurId,
      });
    }
    if (filters.type) {
      qb.andWhere('r.type = :type', { type: filters.type });
    }
    if (filters.visibleParticipants !== undefined) {
      qb.andWhere('r.visibleParticipants = :visible', {
        visible: filters.visibleParticipants,
      });
    }
    if (filters.q?.trim()) {
      qb.andWhere('LOWER(r.titre) LIKE :query', {
        query: `%${filters.q.trim().toLowerCase()}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async reorderForSession(
    sessionId: string,
    ordre: Array<{ id: string; ordreAffichage: number }>
  ): Promise<void> {
    const ids = ordre.map((item) => item.id);
    const existing = ids.length
      ? await this.raw.find({ where: ids.map((id) => ({ id, sessionId })) })
      : [];

    if (existing.length !== ids.length) {
      throw new BadRequestError('Une ou plusieurs ressources ne correspondent pas à cette session');
    }

    await this.raw.manager.transaction(async (manager) => {
      for (const item of ordre) {
        await manager.update(
          Ressource,
          { id: item.id, sessionId },
          {
            ordreAffichage: item.ordreAffichage,
          }
        );
      }
    });
  }
}

export const ressourceRepository = new RessourceRepository();
