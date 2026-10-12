// src/controllers/InscriptionController.ts
import { Request, Response, NextFunction } from 'express';
import { InscriptionService } from '../services/inscription.service';
import { StatutInscription } from '../entities/enums';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError, NotFoundError } from '../errors/AppError';

/* ============================================================================
   HELPERS
   ============================================================================ */

const VALID_SELECTION_STATUTS = [
  StatutInscription.ACCEPTEE,
  StatutInscription.REFUSEE,
  StatutInscription.LISTE_ATTENTE,
];

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

function validateEmail(email: unknown): void {
  if (!email || typeof email !== 'string') {
    throw new BadRequestError('Email requis');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequestError('Email invalide');
  }
}

function validateStatutSelection(statut: unknown): asserts statut is StatutInscription {
  if (!statut || !VALID_SELECTION_STATUTS.includes(statut as StatutInscription)) {
    throw new BadRequestError(
      `Statut invalide. Valeurs acceptées : ${VALID_SELECTION_STATUTS.join(', ')}`,
    );
  }
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class InscriptionController {
  /* ==========================================================================
     🌐 PUBLIC — Inscription sans compte
     ========================================================================== */
  static async createPublic(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId, email, nom, prenom, motivation, telephone } = req.body;

      if (!sessionId) throw new BadRequestError('sessionId requis');
      validateEmail(email);
      if (!nom || typeof nom !== 'string') {
        throw new BadRequestError('Nom requis');
      }
      if (!prenom || typeof prenom !== 'string') {
        throw new BadRequestError('Prénom requis');
      }

      const result = await InscriptionService.createPublic({
        sessionId,
        email: email.toLowerCase().trim(),
        nom: nom.trim(),
        prenom: prenom.trim(),
        motivation,
        telephone,
      });

      return successResponse(res, result, 'Inscription envoyée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 PARTICIPANT — Inscription authentifié
     ========================================================================== */
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { sessionId, motivation } = req.body;

      if (!sessionId) throw new BadRequestError('sessionId requis');

      const result = await InscriptionService.create(
        userId,
        sessionId,
        motivation,
      );

      return successResponse(res, result, 'Inscription envoyée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Liste
     ========================================================================== */
  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const userRole = getUserRole(req);

      const result = await InscriptionService.findAll(
        userId,
        userRole,
        req.query,
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
     🔒 STAFF / ADMIN / PARTICIPANT — Détail
     ========================================================================== */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const inscription = await InscriptionService.findById(req.params.id);
      if (!inscription) throw new NotFoundError('Inscription introuvable');
      return successResponse(res, inscription);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF — Sélectionner (accepter/refuser)
     ========================================================================== */
  static async selectionner(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { statut, motifRefus } = req.body;

      validateStatutSelection(statut);

      const result = await InscriptionService.selectionner(
        req.params.id,
        statut,
        motifRefus,
        userId,
      );

      return successResponse(res, result, 'Sélection effectuée');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 PARTICIPANT — Annuler son inscription
     ========================================================================== */
  static async annuler(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      await InscriptionService.annuler(req.params.id, userId);
      return successResponse(res, null, 'Inscription annulée');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 PARTICIPANT — Mes inscriptions
     ========================================================================== */
  static async mesInscriptions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const inscriptions = await InscriptionService.mesInscriptions(userId);
      return successResponse(res, inscriptions);
    } catch (e) {
      next(e);
    }
  }
}