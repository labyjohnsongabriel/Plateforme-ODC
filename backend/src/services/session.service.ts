// src/services/session.service.ts
import { sessionRepository } from '../repositories/session.repository';
import {
  NotFoundError,
  BadRequestError,
} from '../errors/AppError';
import { StatutSession, ModaliteSession } from '../entities/enums';
import { logger } from '../config/logger';

export class SessionService {
  /* ==========================================================================
     🌐 PUBLIC
     ========================================================================== */
  static async findAllPublic(query: any) {
    return sessionRepository.findPublic({
      q: query.q as string | undefined,
      formationId: query.formationId as string | undefined,
      modalite: query.modalite as ModaliteSession | undefined,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 12,
    });
  }

  static async findByCodePublic(codeSession: string) {
    return sessionRepository.findByCode(codeSession);
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF
     ========================================================================== */
  static async findAll(query: any) {
    return sessionRepository.search({
      q: query.q as string | undefined,
      statut: query.statut as StatutSession | undefined,
      modalite: query.modalite as ModaliteSession | undefined,
      formationId: query.formationId as string | undefined,
      formateurId: query.formateurId as string | undefined,
      dateDebut: query.dateDebut as string | undefined,
      dateFin: query.dateFin as string | undefined,
      estPubliee:
        query.estPubliee === 'true'
          ? true
          : query.estPubliee === 'false'
            ? false
            : undefined,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    });
  }

  static async findById(id: string) {
    return sessionRepository.findByIdOrFail(id, [
      'formation',
      'formation.domaineRelation',
      'formateur',
    ]);
  }

  static async create(data: any) {
    if (!data.formationId) {
      throw new BadRequestError('formationId est requis');
    }
    if (!data.dateDebut || !data.dateFin) {
      throw new BadRequestError('dateDebut et dateFin sont requis');
    }

    // Générer un code unique
    const codeSession = await SessionService.generateCode();

    const session = await sessionRepository.create({
      ...data,
      codeSession,
      statut: data.statut ?? StatutSession.OUVERTE,
      estPubliee: data.estPubliee ?? false,
    });

    logger.info(`📅 Session créée : ${session.codeSession} — ${session.titre}`);

    return session;
  }

  static async update(id: string, data: any) {
    delete data.codeSession;
    delete data.id;

    const session = await sessionRepository.update(id, data);
    logger.info(`📝 Session mise à jour : ${session.codeSession}`);

    return session;
  }

  static async changerStatut(id: string, statut: StatutSession) {
    const session = await sessionRepository.findByIdOrFail(id);
    session.statut = statut;
    return sessionRepository.save(session);
  }

  static async togglePublication(id: string, estPubliee: boolean) {
    const session = await sessionRepository.findByIdOrFail(id);
    session.estPubliee = estPubliee;
    return sessionRepository.save(session);
  }

  static async ouvrirPresence(id: string, ouverte: boolean) {
    const session = await sessionRepository.findByIdOrFail(id);
    session.presenceOuverte = ouverte;
    return sessionRepository.save(session);
  }

  static async delete(id: string) {
    await sessionRepository.softDelete(id);
    logger.info(`🗑️ Session supprimée : ${id}`);
  }

  static async dupliquer(id: string) {
    const original = await sessionRepository.findByIdOrFail(id);
    const codeSession = await SessionService.generateCode();

    const copy = await sessionRepository.create({
      ...original,
      id: undefined,
      codeSession,
      statut: StatutSession.OUVERTE,
      estPubliee: false,
      createdAt: undefined,
      updatedAt: undefined,
    } as any);

    return copy;
  }

  static async findMesSessions(formateurId: string) {
    return sessionRepository.findByFormateur(formateurId);
  }

  static async getParticipants(sessionId: string) {
    // À adapter
    return [];
  }

  static async getStatistiques(sessionId: string) {
    const session = await sessionRepository.findByIdOrFail(sessionId);
    return { session };
  }

  /* ==========================================================================
     Helper — Génère un code unique
     ========================================================================== */
  private static async generateCode(): Promise<string> {
    let code: string;
    let exists: boolean;

    do {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      code = `ODC-${year}-${random}`;

      const found = await sessionRepository.findOne({
        codeSession: code,
      } as any);
      exists = !!found;
    } while (exists);

    return code;
  }
}