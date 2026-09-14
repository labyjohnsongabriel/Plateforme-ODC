import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Note } from '../models/Note.entity';
import { Evaluation } from '../models/Evaluation.entity';
import { User } from '../models/User.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError';
import { logger } from '../config/logger';

export class NoteController {
  private static get repo() {
    return AppDataSource.getRepository(Note);
  }

  /**
   * POST /api/notes
   * Créer ou mettre à jour une note (formateur)
   */
  static async createOrUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { evaluationId, participantId, note, commentaire } = req.body;

      // Vérifier l'évaluation
      const evaluation = await AppDataSource.getRepository(Evaluation).findOne({
        where: { id: evaluationId },
        relations: ['session'],
      });
      if (!evaluation) throw new NotFoundError('Évaluation introuvable');

      // Vérifier que le formateur est bien propriétaire
      if (
        req.userRole === 'FORMATEUR' &&
        evaluation.session.formateurId !== req.userId
      ) {
        throw new ForbiddenError('Vous n\'êtes pas le formateur de cette session');
      }

      // Vérifier la note
      if (note < 0 || note > Number(evaluation.noteMax)) {
        throw new ConflictError(
          `Note doit être comprise entre 0 et ${evaluation.noteMax}`
        );
      }

      // Vérifier le participant
      const participant = await AppDataSource.getRepository(User).findOne({
        where: { id: participantId },
      });
      if (!participant) throw new NotFoundError('Participant introuvable');

      // Créer ou mettre à jour
      let noteEntity = await this.repo.findOne({
        where: { evaluationId, participantId },
      });

      if (noteEntity) {
        noteEntity.note = note;
        if (commentaire !== undefined) noteEntity.commentaire = commentaire;
      } else {
        noteEntity = this.repo.create({
          evaluationId,
          participantId,
          note,
          commentaire,
        });
      }

      await this.repo.save(noteEntity);
      logger.info(`✅ Note enregistrée : ${noteEntity.id}`);

      return successResponse(res, noteEntity, 'Note enregistrée', 201);
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/notes
   * Liste paginée avec filtres
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

      const qb = this.repo
        .createQueryBuilder('n')
        .leftJoinAndSelect('n.participant', 'p')
        .leftJoinAndSelect('p.role', 'pr')
        .leftJoinAndSelect('n.evaluation', 'e')
        .leftJoinAndSelect('e.session', 's')
        .leftJoinAndSelect('s.formation', 'f');

      if (req.query.evaluationId) {
        qb.andWhere('n.evaluation_id = :eid', { eid: req.query.evaluationId });
      }
      if (req.query.participantId) {
        qb.andWhere('n.participant_id = :pid', { pid: req.query.participantId });
      }
      if (req.query.sessionId) {
        qb.andWhere('e.session_id = :sid', { sid: req.query.sessionId });
      }

      // Restriction formateur
      if (req.userRole === 'FORMATEUR') {
        qb.andWhere('s.formateur_id = :fid', { fid: req.userId });
      }

      qb.orderBy('n.created_at', 'DESC').skip(skip).take(limit);

      const [data, total] = await qb.getManyAndCount();
      return paginatedResponse(res, data, total, page, limit);
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/notes/:id
   */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await this.repo.findOne({
        where: { id: req.params.id },
        relations: ['participant', 'evaluation', 'evaluation.session'],
      });
      if (!note) throw new NotFoundError('Note introuvable');
      return successResponse(res, note);
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/notes/mes-notes
   * Notes du participant connecté
   */
  static async mesNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const notes = await this.repo.find({
        where: { participantId: req.userId! },
        relations: ['evaluation', 'evaluation.session', 'evaluation.session.formation'],
        order: { createdAt: 'DESC' },
      });
      return successResponse(res, notes);
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/notes/session/:sessionId/participant/:participantId
   * Notes d'un participant pour une session
   */
  static async findBySessionAndParticipant(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sessionId, participantId } = req.params;

      const notes = await this.repo
        .createQueryBuilder('n')
        .leftJoinAndSelect('n.evaluation', 'e')
        .where('e.session_id = :sid', { sid: sessionId })
        .andWhere('n.participant_id = :pid', { pid: participantId })
        .orderBy('e.date_evaluation', 'ASC')
        .getMany();

      // Calcul de la moyenne
      const moyenne =
        notes.length > 0
          ? Math.round(
              (notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) * 100
            ) / 100
          : 0;

      return successResponse(res, { notes, moyenne });
    } catch (e) {
      next(e);
    }
  }

  /**
   * DELETE /api/notes/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await this.repo.findOne({
        where: { id: req.params.id },
        relations: ['evaluation', 'evaluation.session'],
      });
      if (!note) throw new NotFoundError('Note introuvable');

      if (
        req.userRole === 'FORMATEUR' &&
        note.evaluation.session.formateurId !== req.userId
      ) {
        throw new ForbiddenError('Accès refusé');
      }

      await this.repo.softDelete(req.params.id);
      logger.info(`🗑️  Note supprimée : ${req.params.id}`);
      return successResponse(res, null, 'Note supprimée');
    } catch (e) {
      next(e);
    }
  }
}