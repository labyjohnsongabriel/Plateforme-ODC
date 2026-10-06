// src/services/evaluation.service.ts
import { evaluationRepository } from '../repositories/EvaluationRepository';
import { noteRepository } from '../repositories/note.repository';
import { sessionRepository } from '../repositories/session.repository';
import { RoleName } from '../entities/enums';
import { ForbiddenError, NotFoundError, BadRequestError } from '../errors/AppError';
import { logger } from '../config/logger';

export class EvaluationService {
  static async findAll(filters: any, userId: string, role: RoleName) {
    const data = filters.sessionId
      ? await evaluationRepository.findBySession(filters.sessionId)
      : await evaluationRepository.findMany({ relations: ['session'] });
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  static async create(userId: string, data: any) {
    const session = await sessionRepository.findByIdOrFail(data.sessionId);
    if (session.formateurId !== userId) throw new ForbiddenError('Vous n\'êtes pas le formateur de cette session');
    if (data.noteMin !== undefined && data.noteMin >= data.noteMax) {
      throw new BadRequestError('noteMin doit être inférieure à noteMax');
    }
    const evaluation = await evaluationRepository.create({ ...data, createurId: userId });
    logger.info(`📊 Évaluation créée : ${evaluation.titre}`);
    return evaluation;
  }

  static async findBySession(sessionId: string) {
    return evaluationRepository.findBySession(sessionId);
  }

  static async findById(id: string) {
    return evaluationRepository.findByIdOrFail(id, ['session']);
  }

  static async update(id: string, userId: string, data: any) {
    const e = await evaluationRepository.findByIdOrFail(id, ['session']);
    if (e.session.formateurId !== userId) throw new ForbiddenError('Accès refusé');
    Object.assign(e, data);
    return evaluationRepository.save(e);
  }

  static async togglePublication(id: string, userId: string, publiee: boolean) {
    const e = await evaluationRepository.findByIdOrFail(id, ['session']);
    if (e.session.formateurId !== userId) throw new ForbiddenError('Accès refusé');
    e.publiee = publiee;
    return evaluationRepository.save(e);
  }

  static async saisirNote(
    userId: string,
    evaluationId: string,
    participantId: string,
    note: number,
    commentaire?: string,
  ) {
    const evaluation = await evaluationRepository.findByIdOrFail(evaluationId, ['session']);
    if (evaluation.session.formateurId !== userId) throw new ForbiddenError('Accès refusé');
    if (note < 0 || note > Number(evaluation.noteMax)) {
      throw new BadRequestError(`Note doit être comprise entre 0 et ${evaluation.noteMax}`);
    }

    let n = await noteRepository.findByEvaluationAndParticipant(evaluationId, participantId);
    if (n) {
      n.note = note;
      if (commentaire !== undefined) n.commentaire = commentaire;
      n.dateSaisie = new Date();
    } else {
      n = noteRepository.raw.create({
        evaluationId, participantId, note, commentaire,
        saisiePar: userId, dateSaisie: new Date(),
      });
    }
    await noteRepository.save(n);
    return n;
  }

  static async calculerMoyenne(sessionId: string, participantId: string) {
    const notes = await noteRepository.findBySessionAndParticipant(sessionId, participantId);
    if (!notes.length) return 0;
    const somme = notes.reduce((s, n) => s + Number(n.note), 0);
    return Math.round((somme / notes.length) * 100) / 100;
  }

  static async delete(id: string, userId: string) {
    const e = await evaluationRepository.findByIdOrFail(id, ['session']);
    if (e.session.formateurId !== userId) throw new ForbiddenError('Accès refusé');
    await evaluationRepository.softDelete(id);
  }
}