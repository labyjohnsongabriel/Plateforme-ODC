// src/controllers/NoteController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Note } from '../entities/Note.entity';
import { Evaluation } from '../entities/Evaluation.entity';
import { User } from '../entities/User.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../errors/AppError';
import { RoleName } from '../entities/enums';
import { logger } from '../config/logger';

export class NoteController {
  private static get repo() { return AppDataSource.getRepository(Note); }

  /** POST /api/notes — Formateur / Staff */
  static async createOrUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { evaluationId, participantId, note, commentaire } = req.body;
      if (!evaluationId || !participantId || note === undefined) {
        throw new BadRequestError('evaluationId, participantId et note requis');
      }

      const evaluation = await AppDataSource.getRepository(Evaluation).findOne({
        where: { id: evaluationId }, relations: ['session'],
      });
      if (!evaluation) throw new NotFoundError('Évaluation introuvable');

      if (req.userRole === RoleName.FORMATEUR && evaluation.session.formateurId !== req.userId) {
        throw new ForbiddenError('Vous n\'êtes pas le formateur de cette session');
      }
      if (note < 0 || note > Number(evaluation.noteMax)) {
        throw new ConflictError(`Note doit être comprise entre 0 et ${evaluation.noteMax}`);
      }

      const participant = await AppDataSource.getRepository(User).findOne({ where: { id: participantId } });
      if (!participant) throw new NotFoundError('Participant introuvable');

      let entity = await this.repo.findOne({ where: { evaluationId, participantId } });
      if (entity) {
        entity.note = note;
        if (commentaire !== undefined) entity.commentaire = commentaire;
        entity.dateSaisie = new Date();
      } else {
        entity = this.repo.create({
          evaluationId, participantId, note, commentaire,
          saisiePar: req.userId!, dateSaisie: new Date(),
        });
      }
      await this.repo.save(entity);
      logger.info(`✅ Note enregistrée : ${entity.id}`);
      return successResponse(res, entity, 'Note enregistrée', 201);
    } catch (e) { next(e); }
  }

  /** GET /api/notes — Staff / Formateur */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
      const qb = this.repo.createQueryBuilder('n')
        .leftJoinAndSelect('n.participant', 'p')
        .leftJoinAndSelect('p.role', 'pr')
        .leftJoinAndSelect('n.evaluation', 'e')
        .leftJoinAndSelect('e.session', 's')
        .leftJoinAndSelect('s.formation', 'f');

      if (req.query.evaluationId) qb.andWhere('n.evaluation_id = :eid', { eid: req.query.evaluationId });
      if (req.query.participantId) qb.andWhere('n.participant_id = :pid', { pid: req.query.participantId });
      if (req.query.sessionId) qb.andWhere('e.session_id = :sid', { sid: req.query.sessionId });

      if (req.userRole === RoleName.FORMATEUR) {
        qb.andWhere('s.formateur_id = :fid', { fid: req.userId });
      }

      qb.orderBy('n.created_at', 'DESC').skip(skip).take(limit);
      const [data, total] = await qb.getManyAndCount();
      return paginatedResponse(res, data, total, page, limit);
    } catch (e) { next(e); }
  }

  /** GET /api/notes/:id */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await this.repo.findOne({
        where: { id: req.params.id },
        relations: ['participant', 'evaluation', 'evaluation.session'],
      });
      if (!note) throw new NotFoundError('Note introuvable');
      return successResponse(res, note);
    } catch (e) { next(e); }
  }

  /** GET /api/notes/mes-notes — Participant */
  static async mesNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const notes = await this.repo.find({
        where: { participantId: req.userId! },
        relations: ['evaluation', 'evaluation.session', 'evaluation.session.formation'],
        order: { createdAt: 'DESC' },
      });
      return successResponse(res, notes);
    } catch (e) { next(e); }
  }

  /** GET /api/notes/session/:sessionId/participant/:participantId */
  static async findBySessionAndParticipant(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, participantId } = req.params;
      const notes = await this.repo.createQueryBuilder('n')
        .leftJoinAndSelect('n.evaluation', 'e')
        .where('e.session_id = :sid', { sid: sessionId })
        .andWhere('n.participant_id = :pid', { pid: participantId })
        .orderBy('e.date_evaluation', 'ASC')
        .getMany();

      const moyenne = notes.length > 0
        ? Math.round((notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) * 100) / 100
        : 0;

      return successResponse(res, { notes, moyenne });
    } catch (e) { next(e); }
  }

  /** DELETE /api/notes/:id */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await this.repo.findOne({
        where: { id: req.params.id },
        relations: ['evaluation', 'evaluation.session'],
      });
      if (!note) throw new NotFoundError('Note introuvable');
      if (req.userRole === RoleName.FORMATEUR && note.evaluation.session.formateurId !== req.userId) {
        throw new ForbiddenError('Accès refusé');
      }
      await this.repo.softDelete(req.params.id);
      logger.info(`🗑️ Note supprimée : ${req.params.id}`);
      return successResponse(res, null, 'Note supprimée');
    } catch (e) { next(e); }
  }
}