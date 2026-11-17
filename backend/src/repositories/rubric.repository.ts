// src/repositories/rubric.repository.ts
import { AppDataSource } from '../config/database';
import { RubricCriterion } from '../entities/RubricCriterion.entity';

export const rubricRepository = {
  raw: AppDataSource.getRepository(RubricCriterion),

  async deleteByEvaluation(evaluationId: string): Promise<void> {
    await AppDataSource.query(
      'DELETE FROM rubric_criteria WHERE evaluation_id = $1',
      [evaluationId],
    );
  },

  async findByEvaluation(evaluationId: string): Promise<RubricCriterion[]> {
    return this.raw.find({
      where: { evaluationId },
      order: { ordre: 'ASC' },
    });
  },
};