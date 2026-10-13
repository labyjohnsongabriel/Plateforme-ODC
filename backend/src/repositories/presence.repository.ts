<<<<<<< HEAD
import { Between } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Presence } from '../models/Presence.entity';
=======
// src/repositories/PresenceRepository.ts
import { Presence } from '../entities/Presence.entity';
import { BaseRepository } from './base.repository';
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

export class PresenceRepository extends BaseRepository<Presence> {
  constructor() {
    super(Presence);
  }

<<<<<<< HEAD
  async findBySessionAndDate(sessionId: string, date: Date): Promise<Presence[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.repository.find({
      where: {
        sessionId,
        datePresence: Between(start, end),
      },
      relations: ['participant'],
    });
  }

  async findBySessionAndParticipant(
    sessionId: string,
    participantId: string,
    date: Date
  ): Promise<Presence | null> {
    const day = date.toISOString().split('T')[0];
    return this.repository
      .createQueryBuilder('p')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('DATE(p.date_presence) = :day', { day })
      .getOne();
  }

  async calculerTauxPresence(sessionId: string, participantId: string): Promise<number> {
    const total = await this.repository
      .createQueryBuilder('p')
      .select('COUNT(DISTINCT DATE(p.date_presence))', 'total')
      .where('p.session_id = :sid', { sid: sessionId })
      .getRawOne();

    const presences = await this.repository
      .createQueryBuilder('p')
      .select('COUNT(DISTINCT DATE(p.date_presence))', 'count')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('p.present = true')
      .getRawOne();

    if (!total.total || total.total === '0') return 0;
    return (Number(presences.count) / Number(total.total)) * 100;
  }

  async statsParSession(sessionId: string): Promise<any> {
    const stats = await this.repository
      .createQueryBuilder('p')
      .select('COUNT(DISTINCT p.participant_id)', 'participants')
      .addSelect('COUNT(CASE WHEN p.present THEN 1 END)', 'presences')
      .addSelect('COUNT(CASE WHEN NOT p.present THEN 1 END)', 'absences')
      .where('p.session_id = :sid', { sid: sessionId })
      .getRawOne();

    return {
      participants: Number(stats.participants || 0),
      presences: Number(stats.presences || 0),
      absences: Number(stats.absences || 0),
    };
  }
}
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
