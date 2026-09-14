import { LessThan } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Session, StatutSession } from '../models/Session.entity';

export class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super(Session);
  }

  async findWithRelations(id: string): Promise<Session | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'formation',
        'formateur',
        'formateur.role',
        'inscriptions',
        'inscriptions.participant',
      ],
    });
  }

  async findByFormateur(formateurId: string): Promise<Session[]> {
    return this.repository.find({
      where: { formateurId },
      relations: ['formation'],
      order: { dateDebut: 'DESC' },
    });
  }

  async findActive(): Promise<Session[]> {
    return this.repository.find({
      where: { statut: StatutSession.EN_COURS },
      relations: ['formation', 'formateur'],
    });
  }

  async findTerminees(depuisHeures = 24): Promise<Session[]> {
    const dateLimite = new Date(Date.now() - depuisHeures * 3600 * 1000);
    return this.repository.find({
      where: {
        statut: StatutSession.TERMINEE,
        dateFin: LessThan(dateLimite),
      },
      relations: ['formation'],
    });
  }

  async updateStatuts(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    await this.repository
      .createQueryBuilder()
      .update(Session)
      .set({ statut: StatutSession.EN_COURS })
      .where('DATE(date_debut) <= :today', { today })
      .andWhere('DATE(date_fin) >= :today', { today })
      .andWhere('statut = :s', { s: StatutSession.OUVERTE })
      .execute();

    await this.repository
      .createQueryBuilder()
      .update(Session)
      .set({ statut: StatutSession.TERMINEE })
      .where('date_fin < :today', { today })
      .andWhere('statut = :s', { s: StatutSession.EN_COURS })
      .execute();
  }

  async countByStatut(): Promise<any[]> {
    return this.repository
      .createQueryBuilder('s')
      .select('s.statut', 'statut')
      .addSelect('COUNT(s.id)', 'count')
      .groupBy('s.statut')
      .getRawMany();
  }
}