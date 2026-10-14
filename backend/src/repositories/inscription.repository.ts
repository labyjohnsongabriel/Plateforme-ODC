<<<<<<< HEAD
// src/repositories/inscription.repository.ts
=======
<<<<<<< HEAD
import { BaseRepository } from './BaseRepository';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
=======
// src/repositories/InscriptionRepository.ts
>>>>>>> origin/main
import { Inscription } from '../entities/Inscription.entity';
import { BaseRepository } from './base.repository';
import { StatutInscription } from '../entities/enums';
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

export class InscriptionRepository extends BaseRepository<Inscription> {
  constructor() {
    super(Inscription);
  }

<<<<<<< HEAD
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
=======
<<<<<<< HEAD
  async findWithRelations(id: string): Promise<Inscription | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'participant',
        'participant.role',
        'session',
        'session.formation',
        'session.formateur',
      ],
    });
  }

  async findBySession(sessionId: string, statut?: StatutInscription) {
    const qb = this.repository
      .createQueryBuilder('i')
=======
  async findBySessionAndParticipant(sessionId: string, participantId: string): Promise<Inscription | null> {
    return this.findOne({ sessionId, participantId } as any);
  }

  async findCandidatsBySession(sessionId: string, statut?: StatutInscription) {
    const qb = this.qb('i')
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      .leftJoinAndSelect('i.participant', 'p')
      .leftJoinAndSelect('p.role', 'r')
      .where('i.session_id = :sid', { sid: sessionId });

    if (statut) qb.andWhere('i.statut = :st', { st: statut });

<<<<<<< HEAD
    return qb.getMany();
  }

  async countAccepted(sessionId: string): Promise<number> {
    return this.repository.count({
      where: { sessionId, statut: StatutInscription.ACCEPTEE },
    });
  }

  async exists(sessionId: string, participantId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { sessionId, participantId },
    });
    return count > 0;
  }

  async countEnAttente(): Promise<number> {
    return this.repository.count({
      where: { statut: StatutInscription.EN_ATTENTE },
    });
  }

  async statsParMois(mois = 12): Promise<any[]> {
    return this.repository
      .createQueryBuilder('i')
      .select("TO_CHAR(i.date_inscription, 'YYYY-MM')", 'mois')
      .addSelect('COUNT(i.id)', 'count')
      .where(`i.date_inscription >= NOW() - INTERVAL '${mois} months'`)
      .groupBy('mois')
      .orderBy('mois', 'ASC')
      .getRawMany();
  }
}
=======
    qb.orderBy('i.date_inscription', 'ASC');
    return qb.getMany();
>>>>>>> origin/main
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
