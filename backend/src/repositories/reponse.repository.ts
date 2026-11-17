// src/repositories/reponse.repository.ts
import { AppDataSource } from '../config/database';
import { Reponse } from '../entities/Reponse.entity';

export const reponseRepository = {
  raw: AppDataSource.getRepository(Reponse),

  async findBySoumission(soumissionId: string): Promise<Reponse[]> {
    return this.raw.find({
      where: { soumissionId },
      relations: ['question', 'question.options'],
    });
  },

  async deleteBySoumission(soumissionId: string): Promise<void> {
    await AppDataSource.query(
      'DELETE FROM reponses WHERE soumission_id = $1',
      [soumissionId],
    );
  },
};