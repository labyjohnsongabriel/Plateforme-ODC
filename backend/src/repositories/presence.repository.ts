import { Between } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Presence } from '../models/Presence.entity';

export class PresenceRepository extends BaseRepository<Presence> {
  constructor() {
    super(Presence);
  }

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