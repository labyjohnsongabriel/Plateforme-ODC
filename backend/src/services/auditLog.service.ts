// src/services/auditLog.service.ts
import { Request } from 'express';
import { auditLogRepository } from '../repositories/AuditLogRepository';
import { NotFoundError, BadRequestError } from '../errors/AppError';
import { logger } from '../config/logger';
import { AuditLog } from '../entities/AuditLog.entity';

export interface AuditSearchFilters {
  userId?: string;
  action?: string;
  entite?: string;
  entiteId?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

export class AuditLogService {
  // ==========================================================================
  // ✍️ ENREGISTREMENT
  // ==========================================================================

  /**
   * Enregistre une action dans le journal d'audit.
   * Conçu pour être appelé depuis n'importe quel contrôleur/service.
   * Ne lève jamais d'erreur (fail-safe).
   */
  static async log(
    req: Request,
    action: string,
    entite: string,
    entiteId?: string,
    details?: Record<string, any>,
  ): Promise<void> {
    try {
      await auditLogRepository.create({
        userId: req.userId ?? null,
        action,
        entite,
        entiteId: entiteId ?? null,
        details: details ?? null,
        ipAddress: this.extractIp(req),
        userAgent: req.headers['user-agent'] ?? null,
      } as any);
    } catch (e: any) {
      // ⚠️ Ne jamais bloquer le flux métier à cause de l'audit
      logger.error(`❌ Échec audit log [${action}] : ${e.message}`);
    }
  }

  /**
   * Version sans `Request` (utile pour les jobs/cron/tests).
   */
  static async logDirect(params: {
    userId?: string;
    action: string;
    entite: string;
    entiteId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await auditLogRepository.create({
        userId: params.userId ?? null,
        action: params.action,
        entite: params.entite,
        entiteId: params.entiteId ?? null,
        details: params.details ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      } as any);
    } catch (e: any) {
      logger.error(`❌ Échec audit log direct [${params.action}] : ${e.message}`);
    }
  }

  // ==========================================================================
  // 📋 LECTURE
  // ==========================================================================

  static async search(filters: AuditSearchFilters = {}) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 20));

    if (filters.dateDebut && isNaN(Date.parse(filters.dateDebut))) {
      throw new BadRequestError('dateDebut invalide');
    }
    if (filters.dateFin && isNaN(Date.parse(filters.dateFin))) {
      throw new BadRequestError('dateFin invalide');
    }

    return auditLogRepository.search({
      userId: filters.userId,
      action: filters.action,
      entite: filters.entite,
      entiteId: filters.entiteId,
      dateDebut: filters.dateDebut,
      dateFin: filters.dateFin,
      page,
      limit,
    });
  }

  static async findById(id: string): Promise<AuditLog> {
    const log = await auditLogRepository.findById(id);
    if (!log) throw new NotFoundError('Entrée d\'audit introuvable');
    return log;
  }

  static async findByUser(userId: string): Promise<AuditLog[]> {
    if (!userId) throw new BadRequestError('userId requis');
    return auditLogRepository.findByUser(userId, 200);
  }

  static async findByEntite(entite: string, entiteId: string): Promise<AuditLog[]> {
    if (!entite || !entiteId) {
      throw new BadRequestError('entite et entiteId requis');
    }
    return auditLogRepository.findByEntite(entite, entiteId, 200);
  }

  // ==========================================================================
  // 📊 STATISTIQUES
  // ==========================================================================

  static async stats(range: { dateDebut?: string; dateFin?: string }) {
    return auditLogRepository.stats(range);
  }

  // ==========================================================================
  // 🧹 MAINTENANCE
  // ==========================================================================

  /**
   * Purge les entrées antérieures à N jours.
   * @returns Nombre de lignes supprimées.
   */
  static async cleanup(days: number): Promise<number> {
    const deleted = await auditLogRepository.deleteOlderThan(days);
    logger.info(`🧹 Purge audit : ${deleted} entrée(s) supprimée(s) (> ${days}j)`);
    return deleted;
  }

  // ==========================================================================
  // 🔒 HELPERS
  // ==========================================================================

  private static extractIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0].trim();
    }
    return req.ip ?? null;
  }
}

export const auditLogService = new AuditLogService();