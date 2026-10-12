// src/repositories/SessionRepository.ts
import { Session } from '../entities/Session.entity';
import { BaseRepository } from './base.repository';
import {
  StatutSession,
  ModaliteSession,
} from '../entities/enums';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface SessionFilters {
  q?: string;
  statut?: StatutSession;
  modalite?: ModaliteSession;
  formationId?: string;
  formateurId?: string;
  dateDebut?: string;
  dateFin?: string;
  estPubliee?: boolean;
  page?: number;
  limit?: number;
}

/* ============================================================================
   REPOSITORY
   ============================================================================ */

export class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super(Session);
  }

  /* ==========================================================================
     Trouver par code session
     ========================================================================== */
  async findByCode(codeSession: string): Promise<Session | null> {
    return this.findOne({ codeSession } as any, [
      'formation',
      'formation.domaineRelation',
      'formateur',
    ]);
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF — Recherche complète ⭐ FIX databaseName
     ========================================================================== */
  async search(filters: SessionFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(1000, Math.max(1, Number(filters.limit) || 20));

    const qb = this.qb('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      .leftJoinAndSelect('s.formateur', 'fo')
      .where('s.deletedAt IS NULL'); // ⭐ Propriété TS (pas deleted_at)

    /* -------------------- Recherche -------------------- */
    if (filters.q) {
      qb.andWhere(
        '(s.titre ILIKE :q OR s.codeSession ILIKE :q OR s.lieu ILIKE :q)',
        { q: `%${filters.q}%` },
      );
    }

    /* -------------------- Statut -------------------- */
    if (filters.statut) {
      qb.andWhere('s.statut = :statut', { statut: filters.statut });
    }

    /* -------------------- Modalité -------------------- */
    if (filters.modalite) {
      qb.andWhere('s.modalite = :modalite', { modalite: filters.modalite });
    }

    /* -------------------- Formation -------------------- */
    if (filters.formationId) {
      qb.andWhere('s.formationId = :fid', { fid: filters.formationId });
    }

    /* -------------------- Formateur -------------------- */
    if (filters.formateurId) {
      qb.andWhere('s.formateurId = :formId', { formId: filters.formateurId });
    }

    /* -------------------- Est publiée -------------------- */
    if (typeof filters.estPubliee === 'boolean') {
      qb.andWhere('s.estPubliee = :publiee', { publiee: filters.estPubliee });
    }

    /* -------------------- Dates -------------------- */
    if (filters.dateDebut) {
      qb.andWhere('s.dateDebut >= :dateDebut', { dateDebut: filters.dateDebut });
    }
    if (filters.dateFin) {
      qb.andWhere('s.dateFin <= :dateFin', { dateFin: filters.dateFin });
    }

    /* -------------------- ⭐ TRI (LE FIX) -------------------- */
    // ⭐ s.createdAt (propriété TS), PAS s.created_at (colonne DB)
    qb.orderBy('s.dateDebut', 'DESC')
      .addOrderBy('s.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /* ==========================================================================
     🌐 PUBLIC — Sessions ouvertes
     ========================================================================== */
  async findPublic(filters: SessionFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 12));

    const qb = this.qb('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      .leftJoinAndSelect('s.formateur', 'fo')
      .where('s.estPubliee = :publiee', { publiee: true })
      .andWhere('s.statut IN (:...statuts)', {
        statuts: [StatutSession.OUVERTE, StatutSession.EN_COURS],
      })
      .andWhere('s.deletedAt IS NULL');

    if (filters.q) {
      qb.andWhere('(s.titre ILIKE :q OR f.titre ILIKE :q)', {
        q: `%${filters.q}%`,
      });
    }

    if (filters.formationId) {
      qb.andWhere('s.formationId = :fid', { fid: filters.formationId });
    }

    if (filters.modalite) {
      qb.andWhere('s.modalite = :modalite', { modalite: filters.modalite });
    }

    // ⭐ Tri par date de début
    qb.orderBy('s.dateDebut', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /* ==========================================================================
     🔒 FORMATEUR — Mes sessions
     ========================================================================== */
  async findByFormateur(formateurId: string): Promise<Session[]> {
    return this.qb('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('f.domaineRelation', 'd')
      .where('s.formateurId = :formId', { formId: formateurId })
      .andWhere('s.deletedAt IS NULL')
      .orderBy('s.dateDebut', 'DESC')
      .getMany();
  }

  /* ==========================================================================
     📊 Statistiques par statut
     ========================================================================== */
  async countByStatut(): Promise<Array<{ statut: string; count: number }>> {
    const results = await this.qb('s')
      .select('s.statut', 'statut')
      .addSelect('COUNT(s.id)', 'count')
      .where('s.deletedAt IS NULL')
      .groupBy('s.statut')
      .getRawMany();

    return results.map((r) => ({
      statut: r.statut,
      count: Number(r.count),
    }));
  }

  /* ==========================================================================
     🔍 Sessions à venir
     ========================================================================== */
  async findUpcoming(limit = 10): Promise<Session[]> {
    return this.qb('s')
      .leftJoinAndSelect('s.formation', 'f')
      .where('s.dateDebut > :now', { now: new Date() })
      .andWhere('s.estPubliee = :publiee', { publiee: true })
      .andWhere('s.deletedAt IS NULL')
      .orderBy('s.dateDebut', 'ASC')
      .limit(limit)
      .getMany();
  }
}

export const sessionRepository = new SessionRepository();