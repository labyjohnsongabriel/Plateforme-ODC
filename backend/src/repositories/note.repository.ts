// src/repositories/note.repository.ts
import { In } from 'typeorm';
import { Note } from '../entities/Note.entity';
import { BaseRepository } from './base.repository';
import { Evaluation } from '../entities/Evaluation.entity';

export class NoteRepository extends BaseRepository<Note> {
  constructor() {
    super(Note);
  }

  // ==========================================================================
  // 🔍 LECTURE
  // ==========================================================================

  /** Récupère une note par évaluation + participant */
  async findByEvaluationAndParticipant(
    evaluationId: string,
    participantId: string,
  ): Promise<Note | null> {
    return this.findOne({ evaluationId, participantId } as any);
  }

  /** Toutes les notes d'un participant (avec évaluation + session + formation) */
  async findByParticipant(participantId: string): Promise<Note[]> {
    return this.qb('n')
      .leftJoinAndSelect('n.evaluation', 'e')
      .leftJoinAndSelect('e.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .where('n.participant_id = :pid', { pid: participantId })
      .orderBy('n.created_at', 'DESC')
      .getMany();
  }

  /** Notes d'un participant pour une session donnée */
  async findBySessionAndParticipant(
    sessionId: string,
    participantId: string,
  ): Promise<Note[]> {
    return this.qb('n')
      .leftJoinAndSelect('n.evaluation', 'e')
      .where('e.session_id = :sid', { sid: sessionId })
      .andWhere('n.participant_id = :pid', { pid: participantId })
      .orderBy('e.date_evaluation', 'ASC')
      .getMany();
  }

  /** Toutes les notes d'une évaluation */
  async findByEvaluation(evaluationId: string): Promise<Note[]> {
    return this.qb('n')
      .leftJoinAndSelect('n.participant', 'p')
      .leftJoinAndSelect('p.role', 'r')
      .where('n.evaluation_id = :eid', { eid: evaluationId })
      .orderBy('n.created_at', 'DESC')
      .getMany();
  }

  /** Toutes les notes d'une session (via jointure évaluation) */
  async findBySession(sessionId: string): Promise<Note[]> {
    return this.qb('n')
      .leftJoinAndSelect('n.evaluation', 'e')
      .leftJoinAndSelect('n.participant', 'p')
      .where('e.session_id = :sid', { sid: sessionId })
      .orderBy('p.nom', 'ASC')
      .addOrderBy('p.prenom', 'ASC')
      .getMany();
  }

  /** Détail complet par id (avec évaluation + session + participant) */
  async findByIdWithRelations(id: string): Promise<Note | null> {
    return this.qb('n')
      .leftJoinAndSelect('n.evaluation', 'e')
      .leftJoinAndSelect('e.session', 's')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('n.participant', 'p')
      .leftJoinAndSelect('p.role', 'r')
      .where('n.id = :id', { id })
      .getOne();
  }

  // ==========================================================================
  // 🔎 RECHERCHE PAGINÉE
  // ==========================================================================

  async search(
    filters: {
      evaluationId?: string;
      participantId?: string;
      sessionId?: string;
      formateurId?: string;
    },
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    const qb = this.qb('n')
      .leftJoinAndSelect('n.participant', 'p')
      .leftJoinAndSelect('p.role', 'pr')
      .leftJoinAndSelect('n.evaluation', 'e')
      .leftJoinAndSelect('e.session', 's')
      .leftJoinAndSelect('s.formation', 'f');

    if (filters.evaluationId) {
      qb.andWhere('n.evaluation_id = :eid', { eid: filters.evaluationId });
    }
    if (filters.participantId) {
      qb.andWhere('n.participant_id = :pid', { pid: filters.participantId });
    }
    if (filters.sessionId) {
      qb.andWhere('e.session_id = :sid', { sid: filters.sessionId });
    }
    if (filters.formateurId) {
      qb.andWhere('s.formateur_id = :fid', { fid: filters.formateurId });
    }

    qb.orderBy('n.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==========================================================================
  // 📊 STATISTIQUES
  // ==========================================================================

  /** Moyenne des notes d'un participant pour une session */
  async moyenneParSessionEtParticipant(
    sessionId: string,
    participantId: string,
  ): Promise<number> {
    const raw = await this.qb('n')
      .leftJoin('n.evaluation', 'e')
      .select('AVG(n.note)', 'moyenne')
      .where('e.session_id = :sid', { sid: sessionId })
      .andWhere('n.participant_id = :pid', { pid: participantId })
      .getRawOne();

    const moyenne = Number(raw?.moyenne ?? 0);
    return Math.round(moyenne * 100) / 100;
  }

  /** Moyenne générale d'un participant (toutes sessions) */
  async moyenneParParticipant(participantId: string): Promise<number> {
    const raw = await this.qb('n')
      .select('AVG(n.note)', 'moyenne')
      .where('n.participant_id = :pid', { pid: participantId })
      .getRawOne();

    const moyenne = Number(raw?.moyenne ?? 0);
    return Math.round(moyenne * 100) / 100;
  }

  /** Moyenne d'une évaluation */
  async moyenneParEvaluation(evaluationId: string): Promise<number> {
    const raw = await this.qb('n')
      .select('AVG(n.note)', 'moyenne')
      .where('n.evaluation_id = :eid', { eid: evaluationId })
      .getRawOne();

    const moyenne = Number(raw?.moyenne ?? 0);
    return Math.round(moyenne * 100) / 100;
  }

  /** Moyenne des notes données par un formateur */
  async moyenneParFormateur(formateurId: string): Promise<{
    moyenne: number;
    total: number;
  }> {
    const raw = await this.qb('n')
      .leftJoin('n.evaluation', 'e')
      .leftJoin('e.session', 's')
      .select('AVG(n.note)', 'moyenne')
      .addSelect('COUNT(n.id)', 'total')
      .where('s.formateur_id = :fid', { fid: formateurId })
      .getRawOne();

    return {
      moyenne: Math.round(Number(raw?.moyenne ?? 0) * 100) / 100,
      total: Number(raw?.total ?? 0),
    };
  }

  /** Statistiques complètes d'une évaluation */
  async statsByEvaluation(evaluationId: string) {
    const raw = await this.qb('n')
      .select('COUNT(n.id)', 'total')
      .addSelect('AVG(n.note)', 'moyenne')
      .addSelect('MIN(n.note)', 'min')
      .addSelect('MAX(n.note)', 'max')
      .addSelect(
        'SUM(CASE WHEN n.validee = true THEN 1 ELSE 0 END)',
        'validees',
      )
      .where('n.evaluation_id = :eid', { eid: evaluationId })
      .getRawOne();

    return {
      total: Number(raw?.total ?? 0),
      moyenne: Math.round(Number(raw?.moyenne ?? 0) * 100) / 100,
      min: Number(raw?.min ?? 0),
      max: Number(raw?.max ?? 0),
      validees: Number(raw?.validees ?? 0),
    };
  }

  // ==========================================================================
  // ✍️ ÉCRITURE
  // ==========================================================================

  /** Crée ou met à jour une note (upsert) */
  async upsert(data: {
    evaluationId: string;
    participantId: string;
    note: number;
    commentaire?: string;
    saisiePar?: string;
    validee?: boolean;
  }): Promise<Note> {
    let entity = await this.findByEvaluationAndParticipant(
      data.evaluationId,
      data.participantId,
    );

    if (entity) {
      entity.note = data.note;
      if (data.commentaire !== undefined) entity.commentaire = data.commentaire;
      if (data.saisiePar) entity.saisiePar = data.saisiePar;
      if (data.validee !== undefined) entity.validee = data.validee;
      entity.dateSaisie = new Date();
    } else {
      entity = this.raw.create({
        evaluationId: data.evaluationId,
        participantId: data.participantId,
        note: data.note,
        commentaire: data.commentaire,
        saisiePar: data.saisiePar,
        validee: data.validee ?? false,
        dateSaisie: new Date(),
      });
    }

    return this.save(entity);
  }

  /** Valide une note */
  async valider(id: string): Promise<Note> {
    const note = await this.findByIdOrFail(id);
    note.validee = true;
    return this.save(note);
  }

  /** Supprime toutes les notes d'une évaluation */
  async deleteByEvaluation(evaluationId: string): Promise<number> {
    const result = await this.qb('n')
      .softDelete()
      .where('evaluation_id = :eid', { eid: evaluationId })
      .execute();
    return result.affected ?? 0;
  }

  /** Supprime toutes les notes d'un participant dans une session */
  async deleteBySessionAndParticipant(
    sessionId: string,
    participantId: string,
  ): Promise<number> {
    const notes = await this.findBySessionAndParticipant(sessionId, participantId);
    if (!notes.length) return 0;

    const ids = notes.map((n) => n.id);
    const result = await this.raw.softDelete({ id: In(ids) });
    return result.affected ?? 0;
  }

  // ==========================================================================
  // 📈 RÉPARTITION / HISTOGRAMME
  // ==========================================================================

  /** Répartition des notes par tranche (utile pour histogrammes) */
  async repartitionParTranche(evaluationId: string) {
    const raw = await this.qb('n')
      .select(
        `CASE
           WHEN n.note < 5  THEN '0-5'
           WHEN n.note < 10 THEN '5-10'
           WHEN n.note < 15 THEN '10-15'
           ELSE '15-20'
         END`,
        'tranche',
      )
      .addSelect('COUNT(n.id)', 'count')
      .where('n.evaluation_id = :eid', { eid: evaluationId })
      .groupBy('tranche')
      .orderBy('tranche', 'ASC')
      .getRawMany();

    return raw.map((r) => ({
      tranche: r.tranche,
      count: Number(r.count),
    }));
  }
}

// =============================================================================
// 🎯 INSTANCE UNIQUE EXPORTÉE
// =============================================================================
export const noteRepository = new NoteRepository();