// src/repositories/AttestationRepository.ts
import { Brackets } from 'typeorm';
import { Attestation } from '../entities/Attestation.entity';
import { BaseRepository } from './base.repository';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface AttestationSearchFilters {
  page?: number | string;
  limit?: number | string;
  sessionId?: string;
  participantId?: string;
  formationId?: string;
  valide?: boolean | string;
  search?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface AttestationSearchResult {
  data: Attestation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ============================================================================
   REPOSITORY
   ============================================================================ */

export class AttestationRepository extends BaseRepository<Attestation> {
  constructor() {
    super(Attestation);
  }

  /* ==========================================================================
     FIND BY NUMERO (public — vérification QR)
     ========================================================================== */
  async findByNumero(numero: string): Promise<Attestation | null> {
    return this.qb('a')
      .leftJoinAndSelect('a.participant', 'p')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('a.numero = :numero', { numero })
      .getOne();
  }

  /* ==========================================================================
     FIND BY SESSION & PARTICIPANT
     ========================================================================== */
  async findBySessionAndParticipant(
    sessionId: string,
    participantId: string,
  ): Promise<Attestation | null> {
    return this.qb('a')
      .leftJoinAndSelect('a.participant', 'p')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('a.sessionId = :sessionId', { sessionId })
      .andWhere('a.participantId = :participantId', { participantId })
      .getOne();
  }

  /* ==========================================================================
     FIND BY PARTICIPANT
     ========================================================================== */
  async findByParticipant(participantId: string): Promise<Attestation[]> {
    return this.qb('a')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('a.participantId = :pid', { pid: participantId })
      .andWhere('a.valide = :valide', { valide: true })
      .orderBy('a.dateEmission', 'DESC')
      .getMany();
  }

  /* ==========================================================================
     FIND BY SESSION
     ========================================================================== */
  async findBySession(sessionId: string): Promise<Attestation[]> {
    return this.qb('a')
      .leftJoinAndSelect('a.participant', 'p')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('a.sessionId = :sid', { sid: sessionId })
      .orderBy('a.dateEmission', 'DESC')
      .getMany();
  }

  /* ==========================================================================
     ⭐ SEARCH — Version corrigée (bug databaseName)
     ========================================================================== */
  async search(
    filters: AttestationSearchFilters,
  ): Promise<AttestationSearchResult> {
    /* -------------------- Normalisation pagination -------------------- */
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    /* -------------------- QueryBuilder -------------------- */
    const qb = this.qb('a')
      // ⭐ Joindre explicitement TOUTES les relations
      .leftJoinAndSelect('a.participant', 'p')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.formation', 'f');

    /* -------------------- Filtres -------------------- */

    if (filters.sessionId) {
      qb.andWhere('a.sessionId = :sessionId', {
        sessionId: filters.sessionId,
      });
    }

    if (filters.participantId) {
      qb.andWhere('a.participantId = :participantId', {
        participantId: filters.participantId,
      });
    }

    if (filters.formationId) {
      qb.andWhere('f.id = :formationId', {
        formationId: filters.formationId,
      });
    }

    if (
      filters.valide !== undefined &&
      filters.valide !== 'all' &&
      filters.valide !== ''
    ) {
      const valideBool =
        filters.valide === true || filters.valide === 'true';
      qb.andWhere('a.valide = :valide', { valide: valideBool });
    }

    if (filters.search && typeof filters.search === 'string') {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('a.numero ILIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('p.nom ILIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('p.prenom ILIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('p.email ILIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('f.titre ILIKE :search', {
              search: `%${filters.search}%`,
            });
        }),
      );
    }

    if (filters.dateDebut) {
      qb.andWhere('a.dateEmission >= :dateDebut', {
        dateDebut: filters.dateDebut,
      });
    }

    if (filters.dateFin) {
      qb.andWhere('a.dateEmission <= :dateFin', {
        dateFin: filters.dateFin,
      });
    }

    /* -------------------- ⭐ TRI QUALIFIÉ -------------------- */
    // ⚠️ CRITIQUE : utiliser `a.dateEmission` (qualifié) au lieu de
    // `dateEmission` (non qualifié) pour éviter le bug TypeORM
    qb.orderBy('a.dateEmission', 'DESC').addOrderBy('a.id', 'DESC');

    /* -------------------- ⭐ PAGINATION SÉPARÉE -------------------- */
    // ⚠️ On sépare `getCount()` et `getMany()` au lieu d'utiliser
    // `getManyAndCount()` avec `skip()/take()` qui déclenche le bug.
    const total = await qb.getCount();

    const data = await qb.offset(skip).limit(limit).getMany();

    /* -------------------- Résultat -------------------- */
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /* ==========================================================================
     COUNT VALID
     ========================================================================== */
  async countValid(): Promise<number> {
    return this.qb('a')
      .where('a.valide = :valide', { valide: true })
      .getCount();
  }

  /* ==========================================================================
     COUNT INVALID
     ========================================================================== */
  async countInvalid(): Promise<number> {
    return this.qb('a')
      .where('a.valide = :valide', { valide: false })
      .getCount();
  }

  /* ==========================================================================
     COUNT THIS MONTH
     ========================================================================== */
  async countThisMonth(): Promise<number> {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.qb('a')
      .where('a.dateEmission >= :firstDay', { firstDay })
      .getCount();
  }

  /* ==========================================================================
     COUNT BY SESSION
     ========================================================================== */
  async countBySession(sessionId: string): Promise<number> {
    return this.qb('a')
      .where('a.sessionId = :sessionId', { sessionId })
      .getCount();
  }

  /* ==========================================================================
     ⭐ FIND BY ID (avec relations)
     ========================================================================== */
  async findByIdWithRelations(id: string): Promise<Attestation | null> {
    return this.qb('a')
      .leftJoinAndSelect('a.participant', 'p')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('a.id = :id', { id })
      .getOne();
  }

  /* ==========================================================================
     UPDATE VALIDITY
     ========================================================================== */
  async updateValidity(
    id: string,
    valide: boolean,
    motif?: string,
  ): Promise<Attestation | null> {
    await this.update(id, {
      valide,
      motifInvalidation: valide ? null : motif ?? null,
    } as any);

    return this.findByIdWithRelations(id);
  }

  /* ==========================================================================
     MARK AS DOWNLOADED
     ========================================================================== */
  async markAsDownloaded(id: string): Promise<void> {
    await this.update(id, {
      telechargee: true,
      dateTelechargement: new Date(),
    } as any);
  }
}

/* ============================================================================
   INSTANCE SINGLETON
   ============================================================================ */

export const attestationRepository = new AttestationRepository();