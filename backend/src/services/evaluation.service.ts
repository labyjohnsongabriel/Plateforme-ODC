import { AppDataSource } from '../config/database';
import { Evaluation } from '../models/Evaluation.entity';
import { Note } from '../models/Note.entity';
import { Session } from '../models/Session.entity';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError';

export class EvaluationService {
  private static get repo() { return AppDataSource.getRepository(Evaluation); }
  private static get noteRepo() { return AppDataSource.getRepository(Note); }

  static async create(formateurId: string, data: any) {
    const session = await AppDataSource.getRepository(Session).findOne({ where: { id: data.sessionId } });
    if (!session) throw new NotFoundError('Session introuvable');
    const e = this.repo.create(data);
    await this.repo.save(e);
    return e;
  }

  static async findBySession(sessionId: string) {
    return this.repo.find({ where: { sessionId }, relations: ['notes'], order: { dateEvaluation: 'DESC' } });
  }

  static async findAll(sessionId?: string) {
    return this.repo.find({
      where: sessionId ? { sessionId } : {},
      relations: ['notes'],
      order: { dateEvaluation: 'DESC' },
    });
  }

  static async saisirNote(formateurId: string, evaluationId: string, participantId: string, note: number, commentaire?: string) {
    const evaluation = await this.repo.findOne({ where: { id: evaluationId } });
    if (!evaluation) throw new NotFoundError('Evaluation introuvable');
    if (note < 0 || note > Number(evaluation.noteMax)) throw new ConflictError('Note invalide');
    let n = await this.noteRepo.findOne({ where: { evaluationId, participantId } });
    if (n) { n.note = note; if (commentaire) n.commentaire = commentaire; }
    else n = this.noteRepo.create({ evaluationId, participantId, note, commentaire });
    await this.noteRepo.save(n);
    return n;
  }

  static async calculerMoyenne(sessionId: string, participantId: string): Promise<number> {
    const notes = await this.noteRepo.createQueryBuilder('n')
      .leftJoin('n.evaluation', 'e')
      .where('e.session_id = :sid', { sid: sessionId })
      .andWhere('n.participant_id = :pid', { pid: participantId }).getMany();
    if (notes.length === 0) return 0;
    return Math.round((notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) * 100) / 100;
  }
}