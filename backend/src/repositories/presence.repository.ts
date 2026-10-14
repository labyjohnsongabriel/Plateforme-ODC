<<<<<<< HEAD
import { Between } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Presence } from '../models/Presence.entity';
=======
// src/repositories/PresenceRepository.ts
import { Brackets } from 'typeorm';
import { Presence } from '../entities/Presence.entity';
import { BaseRepository } from './base.repository';
<<<<<<< HEAD
import { StatutPresence } from '../entities/enums';

/* ============================================================================
   PRESENCE REPOSITORY
   ============================================================================ */
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
>>>>>>> origin/main

export class PresenceRepository extends BaseRepository<Presence> {
  constructor() {
    super(Presence);
  }

<<<<<<< HEAD
  /* ==========================================================================
     ⭐ RECHERCHE PAR SESSION & PARTICIPANT
     ========================================================================== */
  /**
   * Trouve une présence spécifique par session + participant.
   */
=======
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
>>>>>>> origin/main
  async findBySessionAndParticipant(
    sessionId: string,
    participantId: string,
    datePresence?: string,
  ): Promise<Presence | null> {
    const qb = this.qb('p')
      .where('p.sessionId = :sid', { sid: sessionId })
      .andWhere('p.participantId = :pid', { pid: participantId });

    if (datePresence) {
      qb.andWhere('p.datePresence = :d', { d: datePresence });
    }

    return qb.getOne();
  }

  /* ==========================================================================
     ⭐ PRÉSENCES D'UNE SESSION
     ========================================================================== */
  /**
   * Récupère toutes les présences d'une session avec les participants.
   */
  async findBySession(sessionId: string): Promise<Presence[]> {
    return this.qb('p')
      .leftJoinAndSelect('p.participant', 'u')
      .leftJoinAndSelect('u.role', 'r')
      .where('p.sessionId = :sid', { sid: sessionId })
      .orderBy('p.createdAt', 'ASC') // ⭐ Corrigé : createdAt
      .getMany();
  }

  /* ==========================================================================
     ⭐ PRÉSENCES D'UN PARTICIPANT
     ========================================================================== */
  /**
   * Récupère toutes les présences d'un participant.
   */
  async findByParticipant(participantId: string): Promise<Presence[]> {
    return this.qb('p')
      .leftJoinAndSelect('p.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('p.participantId = :pid', { pid: participantId })
      .orderBy('p.datePresence', 'DESC')
      .getMany();
  }

  /* ==========================================================================
     ⭐ COMPTAGE
     ========================================================================== */
  /**
   * Compte les présences marquées "PRESENT" pour une session.
   */
  async countPresent(sessionId: string): Promise<number> {
    return this.qb('p')
      .where('p.sessionId = :sid', { sid: sessionId })
      .andWhere('p.statut = :statut', {
        statut: StatutPresence.PRESENT,
      })
      .getCount();
  }

  /**
   * Compte les présences d'une session (toutes).
   */
  async countBySession(sessionId: string): Promise<number> {
    return this.qb('p')
      .where('p.sessionId = :sid', { sid: sessionId })
      .getCount();
  }

  /**
   * Vérifie si une présence existe.
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.qb('p')
        .where('p.id = :id', { id })
        .getCount();
      return count > 0;
    } catch {
      return false;
    }
  }

  /* ==========================================================================
     ⭐ STATISTIQUES PAR SESSION
     ========================================================================== */
  /**
   * Statistiques complètes d'une session :
   * total, présents, absents, retards, excusés.
   */
  async statsBySession(sessionId: string) {
    try {
      const [total, presents, absents, retards, excuses] =
        await Promise.all([
          this.qb('p')
            .where('p.sessionId = :sid', { sid: sessionId })
            .getCount(),
          this.qb('p')
            .where('p.sessionId = :sid', { sid: sessionId })
            .andWhere('p.statut = :statut', {
              statut: StatutPresence.PRESENT,
            })
            .getCount(),
          this.qb('p')
            .where('p.sessionId = :sid', { sid: sessionId })
            .andWhere('p.statut = :statut', {
              statut: StatutPresence.ABSENT,
            })
            .getCount(),
          this.qb('p')
            .where('p.sessionId = :sid', { sid: sessionId })
            .andWhere('p.statut = :statut', {
              statut: StatutPresence.RETARD,
            })
            .getCount(),
          this.qb('p')
            .where('p.sessionId = :sid', { sid: sessionId })
            .andWhere('p.statut = :statut', {
              statut: StatutPresence.EXCUSE,
            })
            .getCount(),
        ]);

      return {
        total,
        presents,
        absents,
        retards,
        excuses,
        tauxPresence:
          total === 0
            ? 0
            : Math.round((presents / total) * 100 * 100) / 100,
      };
    } catch (error) {
      console.error('[PresenceRepository.statsBySession] Erreur:', error);
      return {
        total: 0,
        presents: 0,
        absents: 0,
        retards: 0,
        excuses: 0,
        tauxPresence: 0,
      };
    }
  }

  /* ==========================================================================
     ⭐ TAUX DE PRÉSENCE
     ========================================================================== */
  /**
   * Taux de présence d'un participant à une session.
   */
  async tauxPresence(
    sessionId: string,
    participantId: string,
  ): Promise<number> {
    try {
      const total = await this.qb('p')
        .where('p.sessionId = :sid', { sid: sessionId })
        .getCount();

      if (total === 0) return 0;

      const present = await this.qb('p')
        .where('p.sessionId = :sid', { sid: sessionId })
        .andWhere('p.participantId = :pid', { pid: participantId })
        .andWhere('p.statut = :statut', {
          statut: StatutPresence.PRESENT,
        })
        .getCount();

      return Math.round((present / total) * 100 * 100) / 100;
    } catch (error) {
      console.error('[PresenceRepository.tauxPresence] Erreur:', error);
      return 0;
    }
  }

  /* ==========================================================================
     ⭐ MARQUER UNE PRÉSENCE
     ========================================================================== */
  /**
   * Marque ou met à jour une présence.
   */
  async marquerPresence(
    sessionId: string,
    participantId: string,
    statut: StatutPresence,
  ): Promise<Presence> {
    let presence = await this.findBySessionAndParticipant(
      sessionId,
      participantId,
    );

    if (presence) {
      // Mise à jour
      presence.statut = statut;
      presence.datePresence = new Date();
      return this.save(presence);
    }

    // Création
    return this.create({
      sessionId,
      participantId,
      statut,
      datePresence: new Date(),
    } as any);
  }

  /* ==========================================================================
     ⭐ STATS PAR FORMATEUR
     ========================================================================== */
  /**
   * Taux de présence pour les sessions d'un formateur.
   */
  async tauxPresenceParFormateur(
    formateurId: string,
  ): Promise<number> {
    try {
      const raw = await this.qb('p')
        .leftJoin('p.session', 's')
        .select('COUNT(p.id)', 'total')
        .addSelect(
          `SUM(CASE WHEN p.statut = :present THEN 1 ELSE 0 END)`,
          'presents',
        )
        .where('s.formateurId = :fid', { fid: formateurId })
        .setParameter('present', StatutPresence.PRESENT)
        .getRawOne();

      const total = Number(raw?.total ?? 0);
      const presents = Number(raw?.presents ?? 0);

      return total === 0
        ? 0
        : Math.round((presents / total) * 100 * 100) / 100;
    } catch (error) {
      console.error(
        '[PresenceRepository.tauxPresenceParFormateur] Erreur:',
        error,
      );
      return 0;
    }
  }

  /* ==========================================================================
     ⭐ STATS PAR PARTICIPANT
     ========================================================================== */
  /**
   * Taux de présence global d'un participant.
   */
  async tauxPresenceParParticipant(
    participantId: string,
  ): Promise<number> {
    try {
      const raw = await this.qb('p')
        .select('COUNT(p.id)', 'total')
        .addSelect(
          `SUM(CASE WHEN p.statut = :present THEN 1 ELSE 0 END)`,
          'presents',
        )
        .where('p.participantId = :pid', { pid: participantId })
        .setParameter('present', StatutPresence.PRESENT)
        .getRawOne();

      const total = Number(raw?.total ?? 0);
      const presents = Number(raw?.presents ?? 0);

      return total === 0
        ? 0
        : Math.round((presents / total) * 100 * 100) / 100;
    } catch (error) {
      console.error(
        '[PresenceRepository.tauxPresenceParParticipant] Erreur:',
        error,
      );
      return 0;
    }
  }

  /* ==========================================================================
     ⭐ RECHERCHE AVANCÉE
     ========================================================================== */
  /**
   * Récupère les présences avec filtres avancés.
   */
  async search(filters: {
    sessionId?: string;
    participantId?: string;
    statut?: StatutPresence;
    dateDebut?: string;
    dateFin?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = Math.max(1, Number(filters.page) || 1);
      const limit = Math.min(
        100,
        Math.max(1, Number(filters.limit) || 20),
      );
      const skip = (page - 1) * limit;

      const qb = this.qb('p')
        .leftJoinAndSelect('p.participant', 'u')
        .leftJoinAndSelect('p.session', 's');

      if (filters.sessionId) {
        qb.andWhere('p.sessionId = :sid', { sid: filters.sessionId });
      }

      if (filters.participantId) {
        qb.andWhere('p.participantId = :pid', {
          pid: filters.participantId,
        });
      }

      if (filters.statut) {
        qb.andWhere('p.statut = :statut', { statut: filters.statut });
      }

      if (filters.dateDebut) {
        qb.andWhere('p.datePresence >= :dateDebut', {
          dateDebut: filters.dateDebut,
        });
      }

      if (filters.dateFin) {
        qb.andWhere('p.datePresence <= :dateFin', {
          dateFin: filters.dateFin,
        });
      }

      qb.orderBy('p.datePresence', 'DESC');

      const total = await qb.getCount();
      const data = await qb.offset(skip).limit(limit).getMany();

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch (error) {
      console.error('[PresenceRepository.search] Erreur:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      };
    }
  }

  /* ==========================================================================
     ⭐ SUPPRESSION
     ========================================================================== */
  /**
   * Supprime toutes les présences d'une session.
   */
  async deleteBySession(sessionId: string): Promise<number> {
    try {
      const result = await this.qb('p')
        .softDelete()
        .where('p.sessionId = :sid', { sid: sessionId })
        .execute();

      return result.affected ?? 0;
    } catch (error) {
      console.error(
        '[PresenceRepository.deleteBySession] Erreur:',
        error,
      );
      return 0;
    }
  }
}

<<<<<<< HEAD
/* ============================================================================
   INSTANCE SINGLETON
   ============================================================================ */

export const presenceRepository = new PresenceRepository();
=======
export const presenceRepository = new PresenceRepository();
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
>>>>>>> origin/main
