// src/controllers/AttestationController.ts
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { AttestationService } from '../services/attestation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError, NotFoundError } from '../errors/AppError';

/* ============================================================================
   HELPERS
   ============================================================================ */

function getUserId(req: Request): string {
  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) throw new BadRequestError('Utilisateur non authentifié');
  return userId;
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class AttestationController {
  /* ==========================================================================
     🌐 PUBLIC — Vérification QR
     ========================================================================== */
  static async verifyPublic(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { numero } = req.params;

      if (!numero) {
        throw new BadRequestError('Numéro d\'attestation requis');
      }

      const result = await AttestationService.verifierAuthenticite(numero);

      if (!result.valide) {
        return res.status(404).json({
          success: false,
          message: 'Attestation invalide ou inexistante',
        });
      }

      return successResponse(res, result.attestation, 'Attestation authentique');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Générer une attestation
     ========================================================================== */
  static async genererUne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId, participantId } = req.body;

      if (!sessionId || !participantId) {
        throw new BadRequestError('sessionId et participantId requis');
      }

      const attestation = await AttestationService.generer(
        sessionId,
        participantId,
      );

      return successResponse(res, attestation, 'Attestation générée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Générer pour toute une session
     ========================================================================== */
  static async genererParSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await AttestationService.genererParSession(
        req.params.sessionId,
      );

      return successResponse(res, result, 'Génération terminée');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 STAFF / ADMIN — Liste paginée
     ========================================================================== */
  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await AttestationService.findAll(req.query);
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
     🔒 STAFF / ADMIN — Vérifier éligibilité
     ========================================================================== */
  static async verifierEligibilite(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId, participantId } = req.params;
      const result = await AttestationService.verifierEligibilite(
        sessionId,
        participantId,
      );
      return successResponse(res, result);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 PARTICIPANT — Mes attestations
     ========================================================================== */
  static async mesAttestations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const attestations = await AttestationService.mesAttestations(userId);

      return successResponse(res, attestations);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 PARTICIPANT — Télécharger PDF
     ========================================================================== */
  static async telecharger(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const file = await AttestationService.telecharger(
        req.params.id,
        userId,
      );

      if (!file || !file.path) {
        throw new NotFoundError('Fichier introuvable');
      }

      // ⭐ Vérifier que le fichier existe physiquement
      if (!fs.existsSync(file.path)) {
        throw new NotFoundError('Fichier PDF introuvable sur le serveur');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.nom)}"`,
      );

      return res.sendFile(file.path);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 PARTICIPANT — Voir le PDF dans le navigateur
     ========================================================================== */
  static async voir(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const file = await AttestationService.telecharger(
        req.params.id,
        userId,
      );

      if (!fs.existsSync(file.path)) {
        throw new NotFoundError('Fichier introuvable');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(file.nom)}"`,
      );

      return res.sendFile(file.path);
    } catch (e) {
      next(e);
    }
  }
}