// src/repositories/EvaluationRepository.ts
import { Evaluation } from '../entities/Evaluation.entity';
import { BaseRepository } from './base.repository';
import { RoleName, StatutInscription, TypeEvaluation } from '../entities/enums';
import { EvaluationSubmission } from '../entities/EvaluationSubmission.entity';
import { In } from 'typeorm';

interface VisibleEvaluationFilters {
  userId: string;
  role: RoleName;
  sessionId?: string;
  type?: TypeEvaluation;
  publiee?: boolean;
  skip?: number;
  take?: number;
}

export class EvaluationRepository extends BaseRepository<Evaluation> {
  constructor() { super(Evaluation); }

  async findBySession(sessionId: string): Promise<Evaluation[]> {
    return this.qb('e')
      .leftJoinAndSelect('e.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('e.sessionId = :sessionId', { sessionId })
      .orderBy('e.dateEvaluation', 'ASC')
      .addOrderBy('e.createdAt', 'DESC')
      .getMany();
  }

  async findPublieesBySession(sessionId: string): Promise<Evaluation[]> {
    return this.qb('e')
      .where('e.sessionId = :sessionId', { sessionId })
      .andWhere('e.publiee = true')
      .orderBy('e.dateEvaluation', 'ASC')
      .addOrderBy('e.createdAt', 'DESC')
      .getMany();
  }

  async findVisible(filters: VisibleEvaluationFilters): Promise<[Evaluation[], number]> {
    const qb = this.qb('e')
      .leftJoinAndSelect('e.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .orderBy('e.dateEvaluation', 'ASC', 'NULLS LAST')
      .addOrderBy('e.createdAt', 'DESC');

    if (filters.sessionId) {
      qb.andWhere('e.sessionId = :sessionId', { sessionId: filters.sessionId });
    }
    if (filters.type) {
      qb.andWhere('e.type = :type', { type: filters.type });
    }
    if (filters.publiee !== undefined) {
      qb.andWhere('e.publiee = :publiee', { publiee: filters.publiee });
    }
    if (filters.role === RoleName.FORMATEUR) {
      qb.andWhere('s.formateurId = :userId', { userId: filters.userId });
    } else if (filters.role === RoleName.PARTICIPANT) {
      qb.andWhere('e.publiee = true')
        .andWhere(
          `EXISTS (
            SELECT 1
            FROM inscriptions i
            WHERE i.session_id = e.session_id
              AND i.participant_id = :participantId
              AND i.statut = :acceptedStatus
              AND i.deleted_at IS NULL
          )`,
          {
            participantId: filters.userId,
            acceptedStatus: StatutInscription.ACCEPTEE,
          },
        );
    }

    if (filters.skip !== undefined) qb.skip(filters.skip);
    if (filters.take !== undefined) qb.take(filters.take);
    return qb.getManyAndCount();
  }

  async findByIdWithSession(id: string): Promise<Evaluation | null> {
    return this.findById(id, ['session']);
  }

  async findSubmission(evaluationId: string, participantId: string) {
    return this.raw.manager.getRepository(EvaluationSubmission).findOne({
      where: { evaluationId, participantId },
    });
  }

  async createSubmission(
    evaluationId: string,
    participantId: string,
    reponses: Record<string, unknown>,
  ) {
    const repository = this.raw.manager.getRepository(EvaluationSubmission);
    return repository.save(
      repository.create({ evaluationId, participantId, reponses }),
    );
  }

  async findSubmissions(evaluationId: string) {
    return this.raw.manager
      .getRepository(EvaluationSubmission)
      .createQueryBuilder('submission')
      .leftJoin('submission.participant', 'participant')
      .select([
        'submission.id',
        'submission.evaluationId',
        'submission.participantId',
        'submission.reponses',
        'submission.soumisAt',
        'participant.id',
        'participant.nom',
        'participant.prenom',
        'participant.email',
        'participant.photoUrl',
      ])
      .where('submission.evaluationId = :evaluationId', { evaluationId })
      .orderBy('submission.soumisAt', 'ASC')
      .getMany();
  }

  async findSubmissionsByParticipant(evaluationIds: string[], participantId: string) {
    if (!evaluationIds.length) return [];
    return this.raw.manager.getRepository(EvaluationSubmission).find({
      where: { evaluationId: In(evaluationIds), participantId },
      select: { id: true, evaluationId: true },
    });
  }
}
export const evaluationRepository = new EvaluationRepository();