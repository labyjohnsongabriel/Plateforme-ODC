<<<<<<< HEAD
import { AppDataSource } from '../config/database';
import { Session, StatutSession } from '../models/Session.entity';
import { Formation } from '../models/Formation.entity';
import { User } from '../models/User.entity';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { logger } from '../config/logger';

export class SessionService {
  private static get repo() { return AppDataSource.getRepository(Session); }

  static async create(data: any) {
    const formation = await AppDataSource.getRepository(Formation).findOne({ where: { id: data.formationId } });
    if (!formation) throw new NotFoundError('Formation introuvable');
    if (new Date(data.dateDebut) >= new Date(data.dateFin)) throw new ConflictError('Date debut >= date fin');
    const session = this.repo.create({ ...data, statut: StatutSession.OUVERTE }) as Session;
    await this.repo.save(session);
    logger.info(`Session creee : ${session.id}`);
    return this.findById(session.id);
  }

  static async findAll(params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);
    const qb = this.repo.createQueryBuilder('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('s.formateur', 'fo');
    if (params.statut) qb.andWhere('s.statut = :st', { st: params.statut });
    if (params.formationId) qb.andWhere('s.formation_id = :fid', { fid: params.formationId });
    if (params.formateurId) qb.andWhere('s.formateur_id = :foid', { foid: params.formateurId });
    qb.orderBy('s.dateDebut', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  static async findById(id: string) {
    const s = await this.repo.findOne({ where: { id }, relations: ['formation', 'formateur', 'inscriptions'] });
    if (!s) throw new NotFoundError('Session introuvable');
    return s;
  }

  static async update(id: string, data: any) {
    const s = await this.findById(id);
    Object.assign(s, data);
    await this.repo.save(s);
    return s;
  }

  static async changerStatut(id: string, statut: StatutSession) {
    const s = await this.findById(id);
    s.statut = statut;
    await this.repo.save(s);
    return s;
  }

  static async delete(id: string) {
    await this.findById(id);
    await this.repo.softDelete(id);
  }

  static async findMesSessions(formateurId: string) {
    return this.repo.find({ where: { formateurId }, relations: ['formation'], order: { dateDebut: 'DESC' } });
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}