// src/repositories/EvaluationRepository.ts
import { Evaluation } from '../entities/Evaluation.entity';
import { BaseRepository } from './base.repository';

export class EvaluationRepository extends BaseRepository<Evaluation> {
  constructor() { super(Evaluation); }

  async findBySession(sessionId: string): Promise<Evaluation[]> {
    return this.qb('e')
      .leftJoinAndSelect('e.notes', 'n')
      .where('e.session_id = :sid', { sid: sessionId })
      .orderBy('e.date_evaluation', 'ASC').getMany();
  }

  async findPublieesBySession(sessionId: string): Promise<Evaluation[]> {
    return this.qb('e')
      .where('e.session_id = :sid', { sid: sessionId })
      .andWhere('e.publiee = true')
      .orderBy('e.date_evaluation', 'ASC').getMany();
  }

  async findByIdWithSession(id: string): Promise<Evaluation | null> {
    return this.findById(id, ['session']);
  }
}
export const evaluationRepository = new EvaluationRepository();