import { BaseRepository } from './BaseRepository';
import { Attestation } from '../models/Attestation.entity';

export class AttestationRepository extends BaseRepository<Attestation> {
  constructor() {
    super(Attestation);
  }

  async findByNumero(numero: string): Promise<Attestation | null> {
    return this.repository.findOne({
      where: { numero },
      relations: [
        'participant',
        'session',
        'session.formation',
        'session.formateur',
      ],
    });
  }

  async findMesAttestations(participantId: string): Promise<Attestation[]> {
    return this.repository.find({
      where: { participantId },
      relations: ['session', 'session.formation'],
      order: { dateEmission: 'DESC' },
    });
  }

  async existsForSessionParticipant(
    sessionId: string,
    participantId: string
  ): Promise<boolean> {
    return (await this.repository.count({ where: { sessionId, participantId } })) > 0;
  }

  async statsGlobales(): Promise<any> {
    const stats = await this.repository
      .createQueryBuilder('a')
      .select('COUNT(a.id)', 'total')
      .addSelect('AVG(a.note_finale)', 'noteMoyenne')
      .addSelect('AVG(a.taux_presence)', 'presenceMoyenne')
      .getRawOne();

    return {
      total: Number(stats.total || 0),
      noteMoyenne: Number(stats.noteMoyenne || 0).toFixed(2),
      presenceMoyenne: Number(stats.presenceMoyenne || 0).toFixed(2),
    };
  }

  async attestationsParMois(mois = 12): Promise<any[]> {
    return this.repository
      .createQueryBuilder('a')
      .select("TO_CHAR(a.date_emission, 'YYYY-MM')", 'mois')
      .addSelect('COUNT(a.id)', 'count')
      .where(`a.date_emission >= NOW() - INTERVAL '${mois} months'`)
      .groupBy('mois')
      .orderBy('mois', 'ASC')
      .getRawMany();
  }
}