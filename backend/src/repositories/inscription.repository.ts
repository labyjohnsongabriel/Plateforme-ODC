// src/repositories/InscriptionRepository.ts
import { Inscription } from '../entities/Inscription.entity';
import { BaseRepository } from './base.repository';
import { StatutInscription } from '../entities/enums';

export class InscriptionRepository extends BaseRepository<Inscription> {
  constructor() {
    super(Inscription);
  }

  async findBySessionAndParticipant(sessionId: string, participantId: string): Promise<Inscription | null> {
    return this.findOne({ sessionId, participantId } as any);
  }

  async findCandidatsBySession(sessionId: string, statut?: StatutInscription) {
    const qb = this.qb('i')
      .leftJoinAndSelect('i.participant', 'p')
      .leftJoinAndSelect('p.role', 'r')
      .where('i.session_id = :sid', { sid: sessionId });

    if (statut) qb.andWhere('i.statut = :st', { st: statut });

    qb.orderBy('i.date_inscription', 'ASC');
    return qb.getMany();
  }

  async findBySession(sessionId: string): Promise<Inscription[]> {
    return this.qb('i')
      .leftJoinAndSelect('i.participant', 'p')
      .where('i.session_id = :sid', { sid: sessionId })
      .orderBy('i.date_inscription', 'ASC')
      .getMany();
  }

  async findByParticipant(participantId: string): Promise<Inscription[]> {
    return this.qb('i')
      .leftJoinAndSelect('i.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('i.participant_id = :pid', { pid: participantId })
      .orderBy('i.date_inscription', 'DESC')
      .getMany();
  }

  async countByStatut(sessionId: string, statut: StatutInscription): Promise<number> {
    return this.count({ sessionId, statut } as any);
  }

  async countAcceptees(sessionId: string): Promise<number> {
    return this.countByStatut(sessionId, StatutInscription.ACCEPTEE);
  }

  async statsBySession(sessionId: string) {
    const [total, enAttente, acceptees, refusees, listeAttente] = await Promise.all([
      this.count({ sessionId } as any),
      this.count({ sessionId, statut: StatutInscription.EN_ATTENTE } as any),
      this.count({ sessionId, statut: StatutInscription.ACCEPTEE } as any),
      this.count({ sessionId, statut: StatutInscription.REFUSEE } as any),
      this.count({ sessionId, statut: StatutInscription.LISTE_ATTENTE } as any),
    ]);
    return { total, enAttente, acceptees, refusees, listeAttente };
  }

  async findEnAttente(sessionId: string): Promise<Inscription[]> {
    return this.qb('i')
      .leftJoinAndSelect('i.participant', 'p')
      .where('i.session_id = :sid', { sid: sessionId })
      .andWhere('i.statut = :st', { st: StatutInscription.EN_ATTENTE })
      .orderBy('i.date_inscription', 'ASC')
      .getMany();
  }

  async bulkUpdateStatut(
    ids: string[],
    statut: StatutInscription,
    motifRefus?: string,
  ): Promise<number> {
    if (!ids.length) return 0;
    const result = await this.qb('i')
      .update(Inscription)
      .set({ statut, motifRefus: motifRefus ?? null, dateSelection: new Date() })
      .whereInIds(ids)
      .execute();
    return result.affected ?? 0;
  }
}

export const inscriptionRepository = new InscriptionRepository();