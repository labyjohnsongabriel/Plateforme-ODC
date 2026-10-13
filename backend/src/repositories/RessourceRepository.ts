// src/repositories/RessourceRepository.ts
import { Ressource } from '../entities/Ressource.entity';
import { BaseRepository } from './base.repository';

export class RessourceRepository extends BaseRepository<Ressource> {
  constructor() {
    super(Ressource);
  }

  async findBySession(sessionId: string, visiblesSeulement = false): Promise<Ressource[]> {
    const qb = this.qb('r')
      .leftJoinAndSelect('r.uploadeParUser', 'u')
      .where('r.session_id = :sid', { sid: sessionId });

    if (visiblesSeulement) {
      qb.andWhere('r.visible_participants = true');
    }

    return qb.orderBy('r.ordre_affichage', 'ASC').getMany();
  }

  async incrementerTelechargement(id: string): Promise<void> {
    await this.raw.increment({ id } as any, 'nbTelechargements', 1);
  }
}

export const ressourceRepository = new RessourceRepository();