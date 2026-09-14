import { AppDataSource } from '../config/database';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
import { Session, StatutSession } from '../models/Session.entity';
import { NotFoundError, ConflictError, ForbiddenError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';

export class InscriptionService {
  private static get repo() { return AppDataSource.getRepository(Inscription); }

  static async create(participantId: string, sessionId: string, motivation?: string) {
    const session = await AppDataSource.getRepository(Session).findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundError('Session introuvable');
    if (session.statut !== StatutSession.OUVERTE) throw new ConflictError('Inscriptions fermees');
    const existing = await this.repo.findOne({ where: { sessionId, participantId } });
    if (existing) throw new ConflictError('Deja inscrit');
    const count = await this.repo.count({ where: { sessionId, statut: StatutInscription.ACCEPTEE } });
    if (count >= session.capacite) throw new ConflictError('Session complete');
    const inscription = this.repo.create({ sessionId, participantId, motivation, statut: StatutInscription.EN_ATTENTE });
    await this.repo.save(inscription);
    return this.findById(inscription.id);
  }

  static async findAll(userId: string, userRole: string, params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);
    const qb = this.repo.createQueryBuilder('i')
      .leftJoinAndSelect('i.participant', 'p')
      .leftJoinAndSelect('i.session', 's')
      .leftJoinAndSelect('s.formation', 'f');
    if (userRole === 'PARTICIPANT') qb.andWhere('i.participant_id = :uid', { uid: userId });
    else if (userRole === 'FORMATEUR') qb.andWhere('s.formateur_id = :uid', { uid: userId });
    if (params.statut) qb.andWhere('i.statut = :st', { st: params.statut });
    if (params.sessionId) qb.andWhere('i.session_id = :sid', { sid: params.sessionId });
    qb.orderBy('i.dateInscription', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  static async findById(id: string) {
    const i = await this.repo.findOne({ where: { id }, relations: ['participant', 'session', 'session.formation'] });
    if (!i) throw new NotFoundError('Inscription introuvable');
    return i;
  }

  static async selectionner(id: string, statut: StatutInscription, motifRefus?: string) {
    const i = await this.findById(id);
    i.statut = statut;
    if (motifRefus) i.motifRefus = motifRefus;
    await this.repo.save(i);
    return i;
  }

  static async annuler(id: string, userId: string) {
    const i = await this.findById(id);
    if (i.participantId !== userId) throw new ForbiddenError('Non autorise');
    await this.repo.softDelete(id);
  }
}