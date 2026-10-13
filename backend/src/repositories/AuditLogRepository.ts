// src/repositories/AuditLogRepository.ts
import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog.entity';
import { BaseRepository } from './base.repository';
import { In } from 'typeorm';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface AuditSearchOptions {
  userId?: string;
  action?: string;
  entite?: string;
  entiteId?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

/* ============================================================================
   REPOSITORY
   ============================================================================ */

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super(AuditLog);
  }

  /* ==========================================================================
     CREATE
     ========================================================================== */
  async createLog(data: {
    userId?: string | null;
    action: string;
    entite?: string | null;
    entiteId?: string | null;
    details?: Record<string, any> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<AuditLog> {
    const log = this.repo.create({
      userId: data.userId ?? null,
      action: data.action,
      entite: data.entite ?? null,
      entiteId: data.entiteId ?? null,
      details: data.details ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    });

    return this.repo.save(log);
  }

  /* ==========================================================================
     SEARCH avec pagination
     ========================================================================== */
  async search(options: AuditSearchOptions = {}): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'u')
      .where('a.deletedAt IS NULL');

    if (options.userId) {
      qb.andWhere('a.userId = :uid', { uid: options.userId });
    }

    if (options.action) {
      qb.andWhere('a.action = :action', { action: options.action });
    }

    if (options.entite) {
      qb.andWhere('a.entite = :entite', { entite: options.entite });
    }

    if (options.entiteId) {
      qb.andWhere('a.entiteId = :entiteId', { entiteId: options.entiteId });
    }

    if (options.dateDebut) {
      qb.andWhere('a.createdAt >= :dateDebut', {
        dateDebut: options.dateDebut,
      });
    }

    if (options.dateFin) {
      qb.andWhere('a.createdAt <= :dateFin', { dateFin: options.dateFin });
    }

    qb.orderBy('a.createdAt', 'DESC').skip(skip).take(limit);

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
     FIND BY ID
     ========================================================================== */
  async findByIdWithUser(id: string): Promise<AuditLog | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /* ==========================================================================
     FIND BY USER
     ========================================================================== */
  async findByUser(userId: string, limit = 200): Promise<AuditLog[]> {
    return this.repo.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /* ==========================================================================
     FIND BY ENTITE
     ========================================================================== */
  async findByEntite(
    entite: string,
    entiteId: string,
    limit = 200,
  ): Promise<AuditLog[]> {
    return this.repo.find({
      where: { entite, entiteId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /* ==========================================================================
     STATS
     ========================================================================== */
  async stats(range: { dateDebut?: string; dateFin?: string }): Promise<{
    total: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{
      userId: string;
      email: string;
      nom: string;
      prenom: string;
      count: number;
    }>;
  }> {
    /* -------------------- Total -------------------- */
    const totalQb = this.repo
      .createQueryBuilder('a')
      .where('a.deletedAt IS NULL');

    if (range.dateDebut) {
      totalQb.andWhere('a.createdAt >= :dateDebut', {
        dateDebut: range.dateDebut,
      });
    }
    if (range.dateFin) {
      totalQb.andWhere('a.createdAt <= :dateFin', {
        dateFin: range.dateFin,
      });
    }

    /* -------------------- Top actions -------------------- */
    const actionsQb = this.repo
      .createQueryBuilder('a')
      .select('a.action', 'action')
      .addSelect('COUNT(a.id)', 'count')
      .where('a.deletedAt IS NULL');

    if (range.dateDebut) {
      actionsQb.andWhere('a.createdAt >= :dateDebut', {
        dateDebut: range.dateDebut,
      });
    }
    if (range.dateFin) {
      actionsQb.andWhere('a.createdAt <= :dateFin', {
        dateFin: range.dateFin,
      });
    }

    /* -------------------- Top users -------------------- */
    const usersQb = this.repo
      .createQueryBuilder('a')
      .leftJoin('a.user', 'u')
      .select('u.id', 'userId')
      .addSelect('u.email', 'email')
      .addSelect('u.nom', 'nom')
      .addSelect('u.prenom', 'prenom')
      .addSelect('COUNT(a.id)', 'count')
      .where('a.userId IS NOT NULL')
      .andWhere('a.deletedAt IS NULL');

    if (range.dateDebut) {
      usersQb.andWhere('a.createdAt >= :dateDebut', {
        dateDebut: range.dateDebut,
      });
    }
    if (range.dateFin) {
      usersQb.andWhere('a.createdAt <= :dateFin', {
        dateFin: range.dateFin,
      });
    }

    /* -------------------- Exécution -------------------- */
    const [total, topActions, topUsers] = await Promise.all([
      totalQb.getCount(),
      actionsQb
        .groupBy('a.action')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany(),
      usersQb
        .groupBy('u.id')
        .addGroupBy('u.email')
        .addGroupBy('u.nom')
        .addGroupBy('u.prenom')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany(),
    ]);

    return {
      total,
      topActions: topActions.map((a) => ({
        action: a.action,
        count: Number(a.count),
      })),
      topUsers: topUsers.map((u) => ({
        userId: u.userId,
        email: u.email,
        nom: u.nom,
        prenom: u.prenom,
        count: Number(u.count),
      })),
    };
  }

  /* ==========================================================================
     DELETE OLDER THAN
     ========================================================================== */
  async deleteOlderThan(days: number): Promise<number> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoff', { cutoff })
      .execute();

    return result.affected ?? 0;
  }

  /* ==========================================================================
     FIND BY ENTITY IDS (batch)
     ========================================================================== */
  async findByEntiteIds(
    entite: string,
    entiteIds: string[],
  ): Promise<AuditLog[]> {
    if (entiteIds.length === 0) return [];

    return this.repo.find({
      where: {
        entite,
        entiteId: In(entiteIds),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}

/* ============================================================================
   SINGLETON
   ============================================================================ */

export const auditLogRepository = new AuditLogRepository();