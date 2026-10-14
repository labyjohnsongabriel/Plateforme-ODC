<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Note } from '../models/Note.entity';
import { Evaluation } from '../models/Evaluation.entity';
import { User } from '../models/User.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError';
import { logger } from '../config/logger';

=======
// src/controllers/NoteController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Note } from '../entities/Note.entity';
import { Evaluation } from '../entities/Evaluation.entity';
import { User } from '../entities/User.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../errors/AppError';
import { RoleName } from '../entities/enums';
import { logger } from '../config/logger';

/* ============================================================================
   HELPERS
   ============================================================================ */

function getUserId(req: Request): string {
  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) throw new BadRequestError('Utilisateur non authentifié');
  return userId;
}

function getUserRole(req: Request): string {
  const role = (req as any).user?.role ?? (req as any).userRole;
  if (!role) throw new BadRequestError('Rôle manquant');
  return role;
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export class NoteController {
  private static get repo() {
    return AppDataSource.getRepository(Note);
  }

<<<<<<< HEAD
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
=======
  /* ==========================================================================
     POST /api/notes — Formateur / Staff
     ========================================================================== */
  static async createOrUpdate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const userRole = getUserRole(req);
      const { evaluationId, participantId, note, commentaire } = req.body;

      if (!evaluationId || !participantId || note === undefined) {
        throw new BadRequestError(
          'evaluationId, participantId et note requis',
        );
      }

      /* -------------------- Vérifier l'évaluation -------------------- */
      const evaluation = await AppDataSource.getRepository(
        Evaluation,
      ).findOne({
        where: { id: evaluationId },
        relations: ['session'],
      });

      if (!evaluation) {
        throw new NotFoundError('Évaluation introuvable');
      }

      /* -------------------- Autorisation formateur -------------------- */
      if (
        userRole === RoleName.FORMATEUR &&
        evaluation.session.formateurId !== userId // ⭐ formateurId
      ) {
        throw new ForbiddenError(
          'Vous n\'êtes pas le formateur de cette session',
        );
      }

      /* -------------------- Validation note -------------------- */
      const noteNum = Number(note);
      const noteMax = Number(evaluation.noteMax);

      if (isNaN(noteNum) || noteNum < 0 || noteNum > noteMax) {
        throw new ConflictError(
          `La note doit être comprise entre 0 et ${noteMax}`,
        );
      }

      /* -------------------- Vérifier participant -------------------- */
      const participant = await AppDataSource.getRepository(User).findOne({
        where: { id: participantId },
      });
      if (!participant) {
        throw new NotFoundError('Participant introuvable');
      }

      /* -------------------- Créer ou mettre à jour -------------------- */
      let entity = await this.repo.findOne({
        where: { evaluationId, participantId },
      });

      if (entity) {
        entity.note = noteNum;
        if (commentaire !== undefined) entity.commentaire = commentaire;
        entity.dateSaisie = new Date();
      } else {
        entity = this.repo.create({
          evaluationId,
          participantId,
          note: noteNum,
          commentaire,
          saisiePar: userId,
          dateSaisie: new Date(),
        });
      }

      await this.repo.save(entity);

      logger.info(`✅ Note enregistrée : ${entity.id}`);

      return successResponse(res, entity, 'Note enregistrée', 201);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    } catch (e) {
      next(e);
    }
  }

<<<<<<< HEAD
  /**
   * GET /api/notes
   * Liste paginée avec filtres
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
=======
  /* ==========================================================================
     GET /api/notes — Staff / Formateur
     ========================================================================== */
  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const userRole = getUserRole(req);
      const { page, limit, skip } = getPagination(
        req.query.page,
        req.query.limit,
      );
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

      const qb = this.repo
        .createQueryBuilder('n')
        .leftJoinAndSelect('n.participant', 'p')
        .leftJoinAndSelect('p.role', 'pr')
        .leftJoinAndSelect('n.evaluation', 'e')
        .leftJoinAndSelect('e.session', 's')
        .leftJoinAndSelect('s.formation', 'f');

<<<<<<< HEAD
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
=======
      // ⭐ Propriétés TS (pas de _id)
      if (req.query.evaluationId) {
        qb.andWhere('n.evaluationId = :eid', {
          eid: req.query.evaluationId,
        });
      }

      if (req.query.participantId) {
        qb.andWhere('n.participantId = :pid', {
          pid: req.query.participantId,
        });
      }

      if (req.query.sessionId) {
        qb.andWhere('e.sessionId = :sid', { sid: req.query.sessionId });
      }

      // Restriction formateur
      if (userRole === RoleName.FORMATEUR) {
        qb.andWhere('s.formateurId = :fid', { fid: userId });
      }

      // ⭐ createdAt (propriété TS)
      qb.orderBy('n.createdAt', 'DESC').skip(skip).take(limit);

      const [data, total] = await qb.getManyAndCount();

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      return paginatedResponse(res, data, total, page, limit);
    } catch (e) {
      next(e);
    }
  }

<<<<<<< HEAD
  /**
   * GET /api/notes/:id
   */
  static async findOne(req: Request, res: Response, next: NextFunction) {
=======
  /* ==========================================================================
     GET /api/notes/:id
     ========================================================================== */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    try {
      const note = await this.repo.findOne({
        where: { id: req.params.id },
        relations: ['participant', 'evaluation', 'evaluation.session'],
      });
<<<<<<< HEAD
      if (!note) throw new NotFoundError('Note introuvable');
=======

      if (!note) throw new NotFoundError('Note introuvable');

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      return successResponse(res, note);
    } catch (e) {
      next(e);
    }
  }

<<<<<<< HEAD
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
=======
  /* ==========================================================================
     GET /api/notes/mes-notes — Participant
     ========================================================================== */
  static async mesNotes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      const notes = await this.repo.find({
        where: { participantId: userId },
        relations: [
          'evaluation',
          'evaluation.session',
          'evaluation.session.formation',
        ],
        order: { createdAt: 'DESC' },
      });

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      return successResponse(res, notes);
    } catch (e) {
      next(e);
    }
  }

<<<<<<< HEAD
  /**
   * GET /api/notes/session/:sessionId/participant/:participantId
   * Notes d'un participant pour une session
   */
  static async findBySessionAndParticipant(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
=======
  /* ==========================================================================
     GET /api/notes/session/:sessionId/participant/:participantId
     ========================================================================== */
  static async findBySessionAndParticipant(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    try {
      const { sessionId, participantId } = req.params;

      const notes = await this.repo
        .createQueryBuilder('n')
        .leftJoinAndSelect('n.evaluation', 'e')
<<<<<<< HEAD
        .where('e.session_id = :sid', { sid: sessionId })
        .andWhere('n.participant_id = :pid', { pid: participantId })
        .orderBy('e.date_evaluation', 'ASC')
        .getMany();

      // Calcul de la moyenne
      const moyenne =
        notes.length > 0
          ? Math.round(
              (notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) * 100
=======
        .where('e.sessionId = :sid', { sid: sessionId }) // ⭐ sessionId
        .andWhere('n.participantId = :pid', { pid: participantId }) // ⭐ participantId
        .orderBy('e.dateEvaluation', 'ASC') // ⭐ dateEvaluation
        .getMany();

      const moyenne =
        notes.length > 0
          ? Math.round(
              (notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) *
                100,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
            ) / 100
          : 0;

      return successResponse(res, { notes, moyenne });
    } catch (e) {
      next(e);
    }
  }

<<<<<<< HEAD
  /**
   * DELETE /api/notes/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
=======
  /* ==========================================================================
     DELETE /api/notes/:id
     ========================================================================== */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const userRole = getUserRole(req);

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      const note = await this.repo.findOne({
        where: { id: req.params.id },
        relations: ['evaluation', 'evaluation.session'],
      });
<<<<<<< HEAD
      if (!note) throw new NotFoundError('Note introuvable');

      if (
        req.userRole === 'FORMATEUR' &&
        note.evaluation.session.formateurId !== req.userId
=======

      if (!note) throw new NotFoundError('Note introuvable');

      // Restriction formateur
      if (
        userRole === RoleName.FORMATEUR &&
        note.evaluation.session.formateurId !== userId
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      ) {
        throw new ForbiddenError('Accès refusé');
      }

      await this.repo.softDelete(req.params.id);
<<<<<<< HEAD
      logger.info(`🗑️  Note supprimée : ${req.params.id}`);
=======

      logger.info(`🗑️ Note supprimée : ${req.params.id}`);

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      return successResponse(res, null, 'Note supprimée');
    } catch (e) {
      next(e);
    }
  }
}