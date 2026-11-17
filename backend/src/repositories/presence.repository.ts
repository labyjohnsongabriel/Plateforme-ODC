// src/repositories/presence.repository.ts
import { Presence } from '../entities/Presence.entity';
import { BaseRepository } from './base.repository';
import { MethodePresence, StatutPresence } from '../entities/enums';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRESENCE REPOSITORY
   ═══════════════════════════════════════════════════════════════════════════ */

export class PresenceRepository extends BaseRepository<Presence> {
  constructor() {
    super(Presence);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     RECHERCHE
     ══════════════════════════════════════════════════════════════════════════ */

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

  async findBySession(sessionId: string): Promise<Presence[]> {
    return this.qb('p')
      .leftJoinAndSelect('p.participant', 'u')
      .leftJoinAndSelect('u.role', 'r')
      .where('p.sessionId = :sid', { sid: sessionId })
      .orderBy('p.scanneLe', 'ASC')
      .getMany();
  }

  async findByParticipant(participantId: string): Promise<Presence[]> {
    return this.qb('p')
      .leftJoinAndSelect('p.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('p.participantId = :pid', { pid: participantId })
      .orderBy('p.datePresence', 'DESC')
      .getMany();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     COMPTAGE
     ══════════════════════════════════════════════════════════════════════════ */

  async countPresent(sessionId: string): Promise<number> {
    return this.qb('p')
      .where('p.sessionId = :sid', { sid: sessionId })
      .andWhere('p.statut = :statut', { statut: StatutPresence.PRESENT })
      .getCount();
  }

  async countBySession(sessionId: string): Promise<number> {
    return this.qb('p')
      .where('p.sessionId = :sid', { sid: sessionId })
      .getCount();
  }

  /**
   * ⚠️ Renommé `existsById` pour ne pas écraser `existsBy(where)` du parent.
   */
  async existsById(id: string): Promise<boolean> {
    const count = await this.qb('p').where('p.id = :id', { id }).getCount();
    return count > 0;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     STATISTIQUES PAR SESSION
     ══════════════════════════════════════════════════════════════════════════ */

  async statsBySession(sessionId: string) {
    try {
      const [total, presents, absents, retards, excuses] = await Promise.all([
        this.qb('p').where('p.sessionId = :sid', { sid: sessionId }).getCount(),
        this.qb('p')
          .where('p.sessionId = :sid', { sid: sessionId })
          .andWhere('p.statut = :statut', { statut: StatutPresence.PRESENT })
          .getCount(),
        this.qb('p')
          .where('p.sessionId = :sid', { sid: sessionId })
          .andWhere('p.statut = :statut', { statut: StatutPresence.ABSENT })
          .getCount(),
        this.qb('p')
          .where('p.sessionId = :sid', { sid: sessionId })
          .andWhere('p.statut = :statut', { statut: StatutPresence.RETARD })
          .getCount(),
        this.qb('p')
          .where('p.sessionId = :sid', { sid: sessionId })
          .andWhere('p.statut = :statut', { statut: StatutPresence.EXCUSE })
          .getCount(),
      ]);

      const effectivePresents = presents + retards;

      return {
        total,
        presents,
        absents,
        retards,
        excuses,
        tauxPresence:
          total === 0
            ? 0
            : Math.round((effectivePresents / total) * 100 * 100) / 100,
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

  /* ══════════════════════════════════════════════════════════════════════════
     TAUX DE PRÉSENCE
     ══════════════════════════════════════════════════════════════════════════ */

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
        .andWhere('p.statut IN (:...statuts)', {
          statuts: [StatutPresence.PRESENT, StatutPresence.RETARD],
        })
        .getCount();

      return Math.round((present / total) * 100 * 100) / 100;
    } catch (error) {
      console.error('[PresenceRepository.tauxPresence] Erreur:', error);
      return 0;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     MARQUER / METTRE À JOUR UNE PRÉSENCE
     ══════════════════════════════════════════════════════════════════════════ */

  async marquerPresence(
    sessionId: string,
    participantId: string,
    statut: StatutPresence,
    options?: {
      commentaire?: string | null;
      actorId?: string;
      ip?: string;
    },
  ): Promise<Presence> {
    const today = todayISO();
    const now = new Date();

    let presence = await this.findBySessionAndParticipant(
      sessionId,
      participantId,
      today,
    );

    if (presence) {
      presence.statut = statut;
      presence.methode = MethodePresence.MANUEL;
      presence.scanneLe = now;
      presence.heureScan = now.toTimeString().slice(0, 8);
      if (options?.commentaire !== undefined) {
        presence.commentaire = options.commentaire;
      }
      if (options?.ip) {
        presence.ipAddress = options.ip;
      }
      return this.save(presence);
    }

    return this.create({
      sessionId,
      participantId,
      statut,
      methode: MethodePresence.MANUEL,
      datePresence: new Date(today),
      scanneLe: now,
      heureScan: now.toTimeString().slice(0, 8),
      commentaire: options?.commentaire ?? null,
      ipAddress: options?.ip ?? null,
      qrToken: null,
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     STATS PAR FORMATEUR
     ══════════════════════════════════════════════════════════════════════════ */

  async tauxPresenceParFormateur(formateurId: string): Promise<number> {
    try {
      const raw = await this.qb('p')
        .leftJoin('p.session', 's')
        .select('COUNT(p.id)', 'total')
        .addSelect(
          `SUM(CASE WHEN p.statut IN (:...present) THEN 1 ELSE 0 END)`,
          'presents',
        )
        .where('s.formateurId = :fid', { fid: formateurId })
        .setParameter('present', [
          StatutPresence.PRESENT,
          StatutPresence.RETARD,
        ])
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

  /* ══════════════════════════════════════════════════════════════════════════
     STATS PAR PARTICIPANT
     ══════════════════════════════════════════════════════════════════════════ */

  async tauxPresenceParParticipant(participantId: string): Promise<number> {
    try {
      const raw = await this.qb('p')
        .select('COUNT(p.id)', 'total')
        .addSelect(
          `SUM(CASE WHEN p.statut IN (:...present) THEN 1 ELSE 0 END)`,
          'presents',
        )
        .where('p.participantId = :pid', { pid: participantId })
        .setParameter('present', [
          StatutPresence.PRESENT,
          StatutPresence.RETARD,
        ])
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

  /* ══════════════════════════════════════════════════════════════════════════
     RECHERCHE AVANCÉE
     ══════════════════════════════════════════════════════════════════════════ */

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
      const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
      const skip = (page - 1) * limit;

      const qb = this.qb('p')
        .leftJoinAndSelect('p.participant', 'u')
        .leftJoinAndSelect('p.session', 's');

      if (filters.sessionId) {
        qb.andWhere('p.sessionId = :sid', { sid: filters.sessionId });
      }
      if (filters.participantId) {
        qb.andWhere('p.participantId = :pid', { pid: filters.participantId });
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

  /* ══════════════════════════════════════════════════════════════════════════
     SUPPRESSION
     ══════════════════════════════════════════════════════════════════════════ */

  async deleteBySession(sessionId: string): Promise<number> {
    try {
      const result = await this.qb('p')
        .delete()
        .where('p.sessionId = :sid', { sid: sessionId })
        .execute();

      return result.affected ?? 0;
    } catch (error) {
      console.error('[PresenceRepository.deleteBySession] Erreur:', error);
      return 0;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   INSTANCE SINGLETON
   ═══════════════════════════════════════════════════════════════════════════ */

export const presenceRepository = new PresenceRepository();