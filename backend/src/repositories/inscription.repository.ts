import { BaseRepository } from './BaseRepository';
import { Inscription, StatutInscription } from '../models/Inscription.entity';

export class InscriptionRepository extends BaseRepository<Inscription> {
  constructor() {
    super(Inscription);
  }

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
      .leftJoinAndSelect('i.participant', 'p')
      .leftJoinAndSelect('p.role', 'r')
      .where('i.session_id = :sid', { sid: sessionId });

    if (statut) qb.andWhere('i.statut = :st', { st: statut });

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