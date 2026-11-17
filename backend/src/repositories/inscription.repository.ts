// src/repositories/inscription.repository.ts
import { Inscription } from '../entities/Inscription.entity';
import { BaseRepository } from './base.repository';
import { StatutInscription } from '../entities/enums';

export class InscriptionRepository extends BaseRepository<Inscription> {
  constructor() {
    super(Inscription);
  }

  /**
   * ⭐ Recherche par session + participant (peu importe le statut)
   */
  async findBySessionAndParticipant(
    sessionId: string,
    participantId: string,
  ): Promise<Inscription | null> {
    return this.qb('i')
      .where('i.sessionId = :sessionId', { sessionId })
      .andWhere('i.participantId = :participantId', { participantId })
      .getOne();
  }

  /**
   * Compte les inscriptions acceptées pour une session
   */
  async countAcceptees(sessionId: string): Promise<number> {
    return this.qb('i')
      .where('i.sessionId = :sessionId', { sessionId })
      .andWhere('i.statut = :statut', {
        statut: StatutInscription.ACCEPTEE,
      })
      .getCount();
  }

  /**
   * Trouve les inscriptions d'une session avec relations
   */
  async findBySession(sessionId: string): Promise<Inscription[]> {
    return this.qb('i')
      .leftJoinAndSelect('i.participant', 'p')
      .leftJoinAndSelect('i.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('i.sessionId = :sessionId', { sessionId })
      .orderBy('i.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Trouve les inscriptions d'un participant
   */
  async findByParticipant(participantId: string): Promise<Inscription[]> {
    return this.qb('i')
      .leftJoinAndSelect('i.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('i.participantId = :participantId', { participantId })
      .orderBy('i.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Liste toutes les inscriptions (admin)
   */
  async findMany(): Promise<Inscription[]> {
    return this.qb('i')
      .leftJoinAndSelect('i.participant', 'p')
      .leftJoinAndSelect('i.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .orderBy('i.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Trouve par ID avec relations
   */
  async findByIdOrFail(
    id: string,
    relations: string[] = [],
  ): Promise<Inscription> {
    const inscription = await this.qb('i')
      .leftJoinAndSelect('i.session', 's')
      .leftJoinAndSelect('i.participant', 'p')
      .where('i.id = :id', { id })
      .getOne();

    if (!inscription) {
      throw new Error('Inscription introuvable');
    }

    return inscription;
  }
}

export const inscriptionRepository = new InscriptionRepository();