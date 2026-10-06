// src/repositories/PresenceRepository.ts
import { Presence } from '../entities/Presence.entity';
import { BaseRepository } from './base.repository';

export class PresenceRepository extends BaseRepository<Presence> {
  constructor() {
    super(Presence);
  }

  async findBySessionAndParticipant(
    sessionId: string,
    participantId: string,
    datePresence?: string,
  ): Promise<Presence | null> {
    const qb = this.qb('p')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId });

    if (datePresence) qb.andWhere('p.date_presence = :d', { d: datePresence });

    return qb.getOne();
  }

  async findBySession(sessionId: string) {
    const qb = this.qb('p')
      .leftJoinAndSelect('p.participant', 'u')
      .leftJoinAndSelect('u.role', 'r')
      .where('p.session_id = :sid', { sid: sessionId })
      .orderBy('p.scanne_le', 'ASC');
    return qb.getMany();
  }

  async findByParticipant(participantId: string): Promise<Presence[]> {
    return this.qb('p')
      .leftJoinAndSelect('p.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('p.participant_id = :pid', { pid: participantId })
      .orderBy('p.date_presence', 'DESC')
      .getMany();
  }

  async countPresent(sessionId: string): Promise<number> {
    return this.qb('p')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.present = true')
      .getCount();
  }

  async statsBySession(sessionId: string) {
    const [total, presents, absents, retards, excuses] = await Promise.all([
      this.count({ sessionId } as any),
      this.count({ sessionId, present: true } as any),
      this.count({ sessionId, present: false } as any),
      this.qb('p').where('p.session_id = :sid', { sid: sessionId })
        .andWhere('p.statut = :st', { st: 'RETARD' }).getCount(),
      this.qb('p').where('p.session_id = :sid', { sid: sessionId })
        .andWhere('p.statut = :st', { st: 'EXCUSE' }).getCount(),
    ]);
    return { total, presents, absents, retards, excuses };
  }

  async tauxPresence(sessionId: string, participantId: string): Promise<number> {
    const total = await this.count({ sessionId } as any);
    if (total === 0) return 0;
    const present = await this.qb('p')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('p.present = true')
      .getCount();
    return Math.round((present / total) * 100 * 100) / 100;
  }
}

export const presenceRepository = new PresenceRepository();