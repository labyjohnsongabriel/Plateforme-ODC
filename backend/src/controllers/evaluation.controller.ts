// src/controllers/EvaluationController.ts
import { Request, Response, NextFunction } from 'express';
import { EvaluationService } from '../services/evaluation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { TypeEvaluation } from '../entities/enums';
import { BadRequestError } from '../errors/AppError';

/* ============================================================================
   HELPERS
   ============================================================================ */

const VALID_TYPES = Object.values(TypeEvaluation);

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

function validateType(type: unknown): void {
  if (
    type !== undefined &&
    !VALID_TYPES.includes(type as TypeEvaluation)
  ) {
    throw new BadRequestError(
      `Type d'évaluation invalide. Valeurs : ${VALID_TYPES.join(', ')}`,
    );
  }
}

function validateNote(note: unknown): asserts note is number {
  const n = Number(note);
  if (isNaN(n) || n < 0 || n > 20) {
    throw new BadRequestError('La note doit être entre 0 et 20');
  }
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class EvaluationController {
  /* ==========================================================================
     GET /api/evaluations
     ========================================================================== */
  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const userRole = getUserRole(req);

      const result = await EvaluationService.findAll(
        req.query,
        userId,
        userRole,
      );

      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     POST /api/evaluations
     ========================================================================== */
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      if (!req.body.sessionId || !req.body.titre) {
        throw new BadRequestError('sessionId et titre requis');
      }

      validateType(req.body.type);

      const evaluation = await EvaluationService.create(userId, req.body);

      return successResponse(res, evaluation, 'Évaluation créée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/evaluations/session/:sessionId
     ========================================================================== */
  static async findBySession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await EvaluationService.findBySession(
        req.params.sessionId,
      );
      return successResponse(res, data);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/evaluations/:id
     ========================================================================== */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await EvaluationService.findById(req.params.id);
      return successResponse(res, data);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     PUT /api/evaluations/:id
     ========================================================================== */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      if (req.body.type) {
        validateType(req.body.type);
      }

      const evaluation = await EvaluationService.update(
        req.params.id,
        userId,
        req.body,
      );

      return successResponse(res, evaluation, 'Évaluation mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     PUT /api/evaluations/:id/publier
     ========================================================================== */
  static async publier(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const publiee =
        typeof req.body.publiee === 'boolean' ? req.body.publiee : true;

      const evaluation = await EvaluationService.togglePublication(
        req.params.id,
        userId,
        publiee,
      );

      return successResponse(
        res,
        evaluation,
        publiee ? 'Évaluation publiée' : 'Évaluation dépubliée',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     POST /api/evaluations/:id/notes
     ========================================================================== */
  static async saisirNote(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { participantId, note, commentaire } = req.body;

      if (!participantId) {
        throw new BadRequestError('participantId requis');
      }

      validateNote(note);

      const result = await EvaluationService.saisirNote(
        userId,
        req.params.id, // ⭐ cohérent avec la route
        participantId,
        Number(note),
        commentaire,
      );

      return successResponse(res, result, 'Note enregistrée');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/evaluations/session/:sessionId/participant/:participantId/moyenne
     ========================================================================== */
  static async moyenne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId, participantId } = req.params;

      const moyenne = await EvaluationService.calculerMoyenne(
        sessionId,
        participantId,
      );

      return successResponse(res, { moyenne });
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     DELETE /api/evaluations/:id
     ========================================================================== */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      await EvaluationService.delete(req.params.id, userId);
      return successResponse(res, null, 'Évaluation supprimée');
    } catch (e) {
      next(e);
    }
  }
}