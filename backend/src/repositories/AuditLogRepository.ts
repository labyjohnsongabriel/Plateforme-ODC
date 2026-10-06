// src/repositories/AuditLogRepository.ts
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog.entity';

export interface AuditSearchParams {
  userId?: string;
  action?: string;
  entite?: string;
  entiteId?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

export class AuditLogRepository {
  private repo: Repository<AuditLog>;

  constructor() {
    this.repo = AppDataSource.getRepository(AuditLog);
  }

  // ==========================================================================
  // ✍️ ÉCRITURE
  // ==========================================================================
  async create(data: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.repo.create(data);
    return this.repo.save(log);
  }

  // ==========================================================================
  // 📋 LECTURE
  // ==========================================================================
  async findById(id: string): Promise<AuditLog | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByUser(userId: string, limit = 200): Promise<AuditLog[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByEntite(entite: string, entiteId: string, limit = 200): Promise<AuditLog[]> {
    return this.repo.find({
      where: { entite, entiteId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // ==========================================================================
  // 🔍 RECHERCHE PAGINÉE
  // ==========================================================================
  async search(params: AuditSearchParams = {}) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));

    const qb = this.repo.createQueryBuilder('a');

    if (params.userId)   qb.andWhere('a.user_id = :uid',   { uid: params.userId });
    if (params.action)   qb.andWhere('a.action = :ac',     { ac: params.action });
    if (params.entite)   qb.andWhere('a.entite = :en',     { en: params.entite });
    if (params.entiteId) qb.andWhere('a.entite_id = :eid', { eid: params.entiteId });

    if (params.dateDebut) {
      qb.andWhere('a.created_at >= :dd', { dd: new Date(params.dateDebut) });
    }
    if (params.dateFin) {
      qb.andWhere('a.created_at <= :df', { df: new Date(params.dateFin) });
    }

    qb.orderBy('a.created_at', 'DESC')
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

  // ==========================================================================
  // 📊 STATISTIQUES
  // ==========================================================================
  async stats(range: { dateDebut?: string; dateFin?: string }) {
    const baseQb = this.repo.createQueryBuilder('a');

    if (range.dateDebut) {
      baseQb.andWhere('a.created_at >= :dd', { dd: new Date(range.dateDebut) });
    }
    if (range.dateFin) {
      baseQb.andWhere('a.created_at <= :df', { df: new Date(range.dateFin) });
    }

    // Top 10 actions
    const topActions = await baseQb
      .clone()
      .select('a.action', 'action')
      .addSelect('COUNT(a.id)', 'count')
      .groupBy('a.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany()
      .then((rows) => rows.map((r) => ({ action: r.action, count: Number(r.count) })));

    // Top 10 utilisateurs actifs
    const topUsers = await baseQb
      .clone()
      .select('a.user_id', 'userId')
      .addSelect('COUNT(a.id)', 'count')
      .where('a.user_id IS NOT NULL')
      .groupBy('a.user_id')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany()
      .then((rows) => rows.map((r) => ({ userId: r.userId, count: Number(r.count) })));

    // Top 10 entités touchées
    const topEntites = await baseQb
      .clone()
      .select('a.entite', 'entite')
      .addSelect('COUNT(a.id)', 'count')
      .where('a.entite IS NOT NULL')
      .groupBy('a.entite')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany()
      .then((rows) => rows.map((r) => ({ entite: r.entite, count: Number(r.count) })));

    // Activité par jour (30 derniers jours)
    const activityByDay = await baseQb
      .clone()
      .select("TO_CHAR(a.created_at, 'YYYY-MM-DD')", 'jour')
      .addSelect('COUNT(a.id)', 'count')
      .where("a.created_at >= NOW() - INTERVAL '30 days'")
      .groupBy('jour')
      .orderBy('jour', 'ASC')
      .getRawMany()
      .then((rows) => rows.map((r) => ({ jour: r.jour, count: Number(r.count) })));

    // Total global
    const total = await baseQb.clone().getCount();

    return { total, topActions, topUsers, topEntites, activityByDay };
  }

  // ==========================================================================
  // 🧹 MAINTENANCE
  // ==========================================================================
  /**
   * Supprime les entrées de plus de `days` jours.
   * @returns Nombre de lignes supprimées.
   */
  async deleteOlderThan(days: number): Promise<number> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .from(AuditLog)
      .where('created_at < :cutoff', { cutoff })
      .execute();
    return result.affected ?? 0;
  }

  /** Compte total (admin dashboard) */
  async count(): Promise<number> {
    return this.repo.count();
  }
}

export const auditLogRepository = new AuditLogRepository();