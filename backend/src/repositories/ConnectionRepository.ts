// src/repositories/ConnectionRepository.ts
import { Connection } from '../entities/Connection.entity';
import { BaseRepository } from './base.repository';
import { StatutConnection } from '../entities/enums';

export class ConnectionRepository extends BaseRepository<Connection> {
  constructor() { super(Connection); }

  async findBetween(a: string, b: string): Promise<Connection | null> {
    return this.qb('c')
      .where('(c.expediteur_id = :a AND c.destinataire_id = :b)', { a, b })
      .orWhere('(c.expediteur_id = :b AND c.destinataire_id = :a)', { a, b })
      .getOne();
  }

  async findAccepted(userId: string): Promise<Connection[]> {
    return this.qb('c')
      .leftJoinAndSelect('c.expediteur', 'e')
      .leftJoinAndSelect('e.role', 'er')
      .leftJoinAndSelect('c.destinataire', 'd')
      .leftJoinAndSelect('d.role', 'dr')
      .where('(c.expediteur_id = :uid OR c.destinataire_id = :uid)', { uid: userId })
      .andWhere('c.statut = :st', { st: StatutConnection.ACCEPTEE })
      .getMany();
  }

  async findEnAttente(userId: string): Promise<Connection[]> {
    return this.qb('c')
      .leftJoinAndSelect('c.expediteur', 'e')
      .leftJoinAndSelect('e.role', 'er')
      .where('c.destinataire_id = :uid', { uid: userId })
      .andWhere('c.statut = :st', { st: StatutConnection.EN_ATTENTE })
      .orderBy('c.created_at', 'DESC').getMany();
  }
}
export const connectionRepository = new ConnectionRepository();