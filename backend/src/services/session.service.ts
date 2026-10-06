// src/services/session.service.ts
import crypto from 'crypto';
import { sessionRepository } from '../repositories/session.repository';
import { formationRepository } from '../repositories/formation.repository';
import { StatutSession } from '../entities/enums';
import { NotFoundError, BadRequestError, ConflictError } from '../errors/AppError';
import { logger } from '../config/logger';

export class SessionService {
  // ==================== 🌐 PUBLIC ====================
  static async findAllPublic(filters: any) {
    return sessionRepository.findPublic({
      statut: filters.statut,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 10,
    });
  }

  static async findByCodePublic(code: string) {
    const session = await sessionRepository.findByCode(code);
    if (!session || !session.estPubliee) {
      throw new NotFoundError('Session introuvable');
    }
    return session;
  }

  // ==================== 🔒 ADMIN / STAFF ====================
  static async create(data: any) {
    if (!data.formationId || !data.dateDebut || !data.dateFin) {
      throw new BadRequestError('formationId, dateDebut et dateFin requis');
    }

    const formation = await formationRepository.findById(data.formationId);
    if (!formation) throw new NotFoundError('Formation introuvable');

    const codeSession = data.codeSession || (await sessionRepository.generateCode());
    if (await sessionRepository.findOne({ codeSession } as any)) {
      throw new ConflictError('Code session déjà utilisé');
    }

    const session = await sessionRepository.create({
      ...data,
      codeSession,
      qrCodeSecret: crypto.randomBytes(32).toString('hex'),
    });

    logger.info(`📅 Session créée : ${session.codeSession}`);
    return session;
  }

  static async findAll(filters: any) {
    return sessionRepository.search({
      formationId: filters.formationId,
      statut: filters.statut,
      formateurId: filters.formateurId,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 10,
    });
  }

  static async findById(id: string) {
    return sessionRepository.findByIdOrFail(id, ['formation', 'formateur']);
  }

  static async update(id: string, data: any) {
    return sessionRepository.update(id, data);
  }

  static async changerStatut(id: string, statut: StatutSession) {
    const s = await sessionRepository.update(id, { statut });
    logger.info(`🔄 Session ${s.codeSession} → ${statut}`);
    return s;
  }

  static async togglePublication(id: string, estPubliee: boolean) {
    return sessionRepository.update(id, { estPubliee });
  }

  static async ouvrirPresence(id: string, ouverte: boolean) {
    return sessionRepository.update(id, { presenceOuverte: ouverte });
  }

  static async delete(id: string) {
    await sessionRepository.softDelete(id);
    logger.info(`🗑️ Session supprimée : ${id}`);
  }

  static async findMesSessions(formateurId: string) {
    return sessionRepository.findMesSessions(formateurId);
  }
}