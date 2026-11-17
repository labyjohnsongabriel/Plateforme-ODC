// src/controllers/EvaluationController.ts
import { Request, Response, NextFunction } from 'express';
import { EvaluationService } from '../services/evaluation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { RoleName } from '../entities/enums';
import { BadRequestError, ForbiddenError } from '../errors/AppError';
import { uuidSchema } from '../validators/common.validator';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function getUserId(req: Request): string {
  if (!req.userId) throw new BadRequestError('Utilisateur non authentifié');
  return req.userId;
}

function getUserRole(req: Request): RoleName {
  const role = req.user?.role?.nom ?? req.userRole;
  if (!role || !Object.values(RoleName).includes(role as RoleName)) {
    throw new BadRequestError('Rôle utilisateur invalide');
  }
  return role as RoleName;
}

function validateUuid(value: string, field: string): string {
  if (!uuidSchema.safeParse(value).success) {
    throw new BadRequestError(`${field} invalide`);
  }
  return value;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROLLER
   ═══════════════════════════════════════════════════════════════════════════ */

export class EvaluationController {
  /* ─── LIST ───────────────────────────────────────────────────────────── */
  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EvaluationService.findAll(
        {
          sessionId: typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined,
          type: typeof req.query.type === 'string' ? req.query.type : undefined,
          publiee: typeof req.query.publiee === 'string' ? req.query.publiee : undefined,
          page: typeof req.query.page === 'string' ? req.query.page : undefined,
          limit: typeof req.query.limit === 'string' ? req.query.limit : undefined,
        },
        getUserId(req),
        getUserRole(req),
      );
      paginatedResponse(res, result.data, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  /* ─── CREATE ─────────────────────────────────────────────────────────── */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (
        !req.body?.sessionId ||
        typeof req.body.titre !== 'string' ||
        !req.body.titre.trim()
      ) {
        throw new BadRequestError('sessionId et titre requis');
      }
      validateUuid(req.body.sessionId, 'sessionId');
      const evaluation = await EvaluationService.create(
        getUserId(req),
        getUserRole(req),
        req.body,
      );
      successResponse(res, evaluation, 'Évaluation créée', 201);
    } catch (error) {
      next(error);
    }
  }

  /* ─── FIND BY SESSION ────────────────────────────────────────────────── */
  static async findBySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const evaluations = await EvaluationService.findBySession(
        validateUuid(req.params.sessionId, 'sessionId'),
        getUserId(req),
        getUserRole(req),
      );
      successResponse(res, evaluations);
    } catch (error) {
      next(error);
    }
  }

  /* ─── FIND ONE ───────────────────────────────────────────────────────── */
  static async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const evaluation = await EvaluationService.findById(
        validateUuid(req.params.id, 'id'),
        getUserId(req),
        getUserRole(req),
      );
      successResponse(res, evaluation);
    } catch (error) {
      next(error);
    }
  }

  /* ─── UPDATE ─────────────────────────────────────────────────────────── */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const evaluation = await EvaluationService.update(
        validateUuid(req.params.id, 'id'),
        getUserId(req),
        getUserRole(req),
        req.body ?? {},
      );
      successResponse(res, evaluation, 'Évaluation mise à jour');
    } catch (error) {
      next(error);
    }
  }

  /* ─── PUBLIER / DÉPUBLIER ────────────────────────────────────────────── */
  static async publier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.body?.publiee !== undefined && typeof req.body.publiee !== 'boolean') {
        throw new BadRequestError('publiee doit être un booléen');
      }
      const publiee = req.body?.publiee ?? true;
      const evaluation = await EvaluationService.togglePublication(
        validateUuid(req.params.id, 'id'),
        getUserId(req),
        getUserRole(req),
        publiee,
      );
      successResponse(
        res,
        evaluation,
        publiee ? 'Évaluation publiée' : 'Évaluation dépubliée',
      );
    } catch (error) {
      next(error);
    }
  }

  /* ─── SAISIR NOTE ────────────────────────────────────────────────────── */
  static async saisirNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const participantId = validateUuid(req.body?.participantId, 'participantId');
      const note = req.body?.note;
      if (
        note === '' || note === null || note === undefined ||
        !Number.isFinite(Number(note)) || Number(note) < 0
      ) {
        throw new BadRequestError('La note doit être un nombre positif ou nul');
      }
      if (req.body?.commentaire !== undefined && typeof req.body.commentaire !== 'string') {
        throw new BadRequestError('Le commentaire doit être du texte');
      }
      const result = await EvaluationService.saisirNote(
        getUserId(req),
        getUserRole(req),
        validateUuid(req.params.evaluationId ?? req.params.id, 'evaluationId'),
        participantId,
        Number(note),
        req.body.commentaire,
      );
      successResponse(res, result, 'Note enregistrée');
    } catch (error) {
      next(error);
    }
  }

  /* ─── SOUMETTRE (participant) ────────────────────────────────────────── */
  static async soumettre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (getUserRole(req) !== RoleName.PARTICIPANT) {
        throw new ForbiddenError('Cette action est réservée aux participants');
      }
      const reponses = req.body?.reponses;
      if (!reponses || typeof reponses !== 'object' || Array.isArray(reponses)) {
        throw new BadRequestError('reponses doit être un objet');
      }
      const submission = await EvaluationService.soumettre(
        validateUuid(req.params.id, 'evaluationId'),
        getUserId(req),
        reponses,
      );
      successResponse(res, submission, 'Évaluation soumise', 201);
    } catch (error) {
      next(error);
    }
  }

  /* ─── FIND SUBMISSIONS ───────────────────────────────────────────────── */
  static async findSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submissions = await EvaluationService.findSubmissions(
        validateUuid(req.params.id, 'evaluationId'),
        getUserId(req),
        getUserRole(req),
      );
      successResponse(res, submissions);
    } catch (error) {
      next(error);
    }
  }

  /* ─── MOYENNE ────────────────────────────────────────────────────────── */
  static async moyenne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = validateUuid(req.params.sessionId, 'sessionId');
      const participantId = validateUuid(req.params.participantId, 'participantId');
      const role = getUserRole(req);
      const userId = getUserId(req);
      if (role === RoleName.PARTICIPANT && participantId !== userId) {
        throw new ForbiddenError('Vous ne pouvez consulter que votre propre moyenne');
      }
      await EvaluationService.assertCanViewSession(sessionId, userId, role);
      const moyenne = await EvaluationService.calculerMoyenne(sessionId, participantId);
      successResponse(res, { moyenne });
    } catch (error) {
      next(error);
    }
  }

  /* ─── DELETE ─────────────────────────────────────────────────────────── */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await EvaluationService.delete(
        validateUuid(req.params.id, 'id'),
        getUserId(req),
        getUserRole(req),
      );
      successResponse(res, null, 'Évaluation supprimée');
    } catch (error) {
      next(error);
    }
  }
}