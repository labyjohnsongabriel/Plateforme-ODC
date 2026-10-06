// src/repositories/AttestationRepository.ts
import { Attestation } from '../entities/Attestation.entity';
import { BaseRepository } from './base.repository';

export class AttestationRepository extends BaseRepository<Attestation> {
  constructor() {
    super(Attestation);
  }

  async findByNumero(numero: string): Promise<Attestation | null> {
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