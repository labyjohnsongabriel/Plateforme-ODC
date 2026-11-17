// src/repositories/question.repository.ts
import { AppDataSource } from '../config/database';
import { Question } from '../entities/Question.entity';

export const questionRepository = {
  raw: AppDataSource.getRepository(Question),

  async deleteByEvaluation(evaluationId: string): Promise<void> {
    // ⚠️ Utilise du SQL brut pour éviter createQueryBuilder (bug de metadata)
    await AppDataSource.query(
      'DELETE FROM questions WHERE evaluation_id = $1',
      [evaluationId],
    );
  },

  async findByEvaluation(evaluationId: string): Promise<Question[]> {
    return this.raw.find({
      where: { evaluationId },
      relations: ['options'],
      order: { ordre: 'ASC' },
    });
  },
};