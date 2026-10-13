<<<<<<< HEAD
import { BaseRepository } from './BaseRepository';
import { Attestation } from '../models/Attestation.entity';
=======
// src/repositories/AttestationRepository.ts
import { Attestation } from '../entities/Attestation.entity';
import { BaseRepository } from './base.repository';
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

export class AttestationRepository extends BaseRepository<Attestation> {
  constructor() {
    super(Attestation);
  }

  async findByNumero(numero: string): Promise<Attestation | null> {
<<<<<<< HEAD
    return this.repository.findOne({
      where: { numero },
      relations: [
        'participant',
        'session',
        'session.formation',
        'session.formateur',
      ],
    });
  }

  async findMesAttestations(participantId: string): Promise<Attestation[]> {
    return this.repository.find({
      where: { participantId },
      relations: ['session', 'session.formation'],
      order: { dateEmission: 'DESC' },
    });
  }

  async existsForSessionParticipant(
    sessionId: string,
    participantId: string
  ): Promise<boolean> {
    return (await this.repository.count({ where: { sessionId, participantId } })) > 0;
  }

  async statsGlobales(): Promise<any> {
    const stats = await this.repository
      .createQueryBuilder('a')
      .select('COUNT(a.id)', 'total')
      .addSelect('AVG(a.note_finale)', 'noteMoyenne')
      .addSelect('AVG(a.taux_presence)', 'presenceMoyenne')
      .getRawOne();

    return {
      total: Number(stats.total || 0),
      noteMoyenne: Number(stats.noteMoyenne || 0).toFixed(2),
      presenceMoyenne: Number(stats.presenceMoyenne || 0).toFixed(2),
    };
  }

  async attestationsParMois(mois = 12): Promise<any[]> {
    return this.repository
      .createQueryBuilder('a')
      .select("TO_CHAR(a.date_emission, 'YYYY-MM')", 'mois')
      .addSelect('COUNT(a.id)', 'count')
      .where(`a.date_emission >= NOW() - INTERVAL '${mois} months'`)
      .groupBy('mois')
      .orderBy('mois', 'ASC')
      .getRawMany();
  }
}
=======
    return this.qb('a')
      .leftJoinAndSelect('a.participant', 'p')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('a.numero = :numero', { numero })
      .andWhere('a.valide = true')
      .getOne();
  }

  async findBySessionAndParticipant(sessionId: string, participantId: string): Promise<Attestation | null> {
    return this.findOne({ sessionId, participantId } as any);
  }

  async findByParticipant(participantId: string): Promise<Attestation[]> {
    return this.qb('a')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('a.participant_id = :pid', { pid: participantId })
      .andWhere('a.valide = true')
      .orderBy('a.date_emission', 'DESC')
      .getMany();
  }

  async findBySession(sessionId: string): Promise<Attestation[]> {
    return this.qb('a')
      .leftJoinAndSelect('a.participant', 'p')
      .where('a.session_id = :sid', { sid: sessionId })
      .getMany();
  }

  async search(filters: { sessionId?: string; participantId?: string; valide?: boolean; page?: number; limit?: number }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));

    const qb = this.qb('a')
      .leftJoinAndSelect('a.participant', 'p')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.formation', 'f');

    if (filters.sessionId) qb.andWhere('a.session_id = :sid', { sid: filters.sessionId });
    if (filters.participantId) qb.andWhere('a.participant_id = :pid', { pid: filters.participantId });
    if (filters.valide !== undefined) qb.andWhere('a.valide = :v', { v: filters.valide });

    qb.orderBy('a.date_emission', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async countValid(): Promise<number> {
    return this.count({ valide: true } as any);
  }
}

export const attestationRepository = new AttestationRepository();
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
