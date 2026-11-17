// src/controllers/AttestationController.ts
import { Request, Response, NextFunction } from 'express';
import { AttestationService } from '../services/attestation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError, NotFoundError } from '../errors/AppError';
import { logger } from '../config/logger';

/* ============================================================================
   HELPERS
   ============================================================================ */

function getUserId(req: Request): string {
  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) throw new BadRequestError('Utilisateur non authentifié');
  return userId;
}

function parseIntBounded(value: unknown, min: number, max: number, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function parseBool(value: unknown, fallback = true): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase().trim();
  if (s === 'false' || s === '0' || s === 'non' || s === 'no') return false;
  if (s === 'true' || s === '1' || s === 'oui' || s === 'yes') return true;
  return fallback;
}

function buildCriteria(source: any) {
  return {
    presenceMin: parseIntBounded(source?.presenceMin, 0, 100, 75),
    noteMin: parseIntBounded(source?.noteMin, 0, 20, 10),
    selectionValidee: parseBool(source?.selectionValidee, true),
    inscriptionValidee: parseBool(source?.inscriptionValidee, true),
  };
}

function sendPdfBuffer(
  res: Response,
  buffer: Buffer,
  nom: string,
  disposition: 'attachment' | 'inline' = 'attachment'
): void {
  const safeName = nom.replace(/[^\w.-]+/g, '_');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(nom)}`
  );
  res.setHeader('Content-Length', String(buffer.length));
  res.setHeader('Cache-Control', 'no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.send(buffer);
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class AttestationController {
  /* ==========================================================================
     🌐 PUBLIC — Vérification QR
     ========================================================================== */
  static async verifyPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { numero } = req.params;

      if (!numero || !numero.trim()) {
        throw new BadRequestError("Numéro d'attestation requis");
      }

      const result = await AttestationService.verifierAuthenticite(numero.trim());

      if (!result.attestation) {
        throw new NotFoundError('Attestation introuvable');
      }

      successResponse(
        res,
        result.attestation,
        result.valide ? 'Attestation authentique' : 'Attestation invalidée'
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF — Liste paginée
     ========================================================================== */
  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AttestationService.findAll(req.query);
      paginatedResponse(res, result.data, result.total, result.page, result.limit, 'Attestations');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF — Statistiques
     ========================================================================== */
  static async stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AttestationService.getStats();
      successResponse(res, stats, 'Statistiques des attestations');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF — Détail
     ========================================================================== */
  static async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.params.id) {
        throw new BadRequestError('Identifiant requis');
      }
      const attestation = await AttestationService.findOne(req.params.id);
      successResponse(res, attestation, 'Attestation');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐ PARTICIPANT — Détail d'une de MES attestations
     ========================================================================== */
  static async findOneForParticipant(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('Identifiant requis');
      }

      const attestation = await AttestationService.findOneForParticipant(id, userId);

      successResponse(res, attestation, 'Attestation');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐ ADMIN / STAFF — Aperçu d'une session
     ========================================================================== */
  static async previewSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        throw new BadRequestError('sessionId requis');
      }

      const criteria = buildCriteria(req.query);

      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[PREVIEW SESSION]', {
          sessionId,
          criteria,
          rawQuery: req.query,
        });
      }

      const preview = await AttestationService.previewSession(sessionId, criteria);

      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[PREVIEW SESSION] résultat:', {
          total: preview.stats.total,
          eligibles: preview.stats.eligibles,
          ineligibles: preview.stats.ineligibles,
          dejaGenerees: preview.stats.dejaGenerees,
          sampleTaux: preview.participants[0]?.tauxPresence,
        });
      }

      successResponse(res, preview, "Aperçu de l'éligibilité");
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐ ADMIN / STAFF — Générer pour une session (batch)
     ========================================================================== */
  static async genererParSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        throw new BadRequestError('sessionId requis');
      }

      const criteria = buildCriteria(req.body);

      if (process.env.NODE_ENV !== 'production') {
        logger.info('[GENERATE SESSION]', { sessionId, criteria });
      }

      const result = await AttestationService.genererParSession(sessionId, criteria);

      successResponse(res, result, `${result.generes} attestation(s) générée(s)`);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF — Générer une attestation
     ========================================================================== */
  static async genererUne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, participantId } = req.body ?? {};

      if (!sessionId || !participantId) {
        throw new BadRequestError('sessionId et participantId requis');
      }

      if (typeof sessionId !== 'string' || typeof participantId !== 'string') {
        throw new BadRequestError('sessionId et participantId doivent être des chaînes');
      }

      const attestation = await AttestationService.generer(sessionId, participantId);

      successResponse(res, attestation, 'Attestation générée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF — Invalider
     ========================================================================== */
  static async invalider(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { motif } = req.body ?? {};

      if (!motif || typeof motif !== 'string' || !motif.trim()) {
        throw new BadRequestError("Motif d'invalidation requis");
      }

      if (motif.trim().length < 3) {
        throw new BadRequestError("Le motif d'invalidation doit contenir au moins 3 caractères");
      }

      const attestation = await AttestationService.invalider(req.params.id, motif.trim());

      successResponse(res, attestation, 'Attestation invalidée');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF — Réactiver
     ========================================================================== */
  static async reactiver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attestation = await AttestationService.reactiver(req.params.id);
      successResponse(res, attestation, 'Attestation réactivée');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF / FORMATEUR — Vérifier éligibilité d'un participant
     ========================================================================== */
  static async verifierEligibilite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, participantId } = req.params;

      if (!sessionId || !participantId) {
        throw new BadRequestError('sessionId et participantId requis');
      }

      const criteria = buildCriteria(req.query);

      const result = await AttestationService.verifierEligibilite(
        sessionId,
        participantId,
        criteria
      );

      successResponse(res, result, 'Éligibilité vérifiée');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 PARTICIPANT — Mes attestations
     ========================================================================== */
  static async mesAttestations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserId(req);
      const attestations = await AttestationService.mesAttestations(userId);
      successResponse(res, attestations, 'Mes attestations');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐ TÉLÉCHARGER — PDF (attachment)
     ========================================================================== */
  static async telecharger(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserId(req);
      const file = await AttestationService.telecharger(req.params.id, userId);

      if (!file?.buffer) {
        throw new NotFoundError('PDF introuvable');
      }

      sendPdfBuffer(res, file.buffer, file.nom, 'attachment');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐ VOIR — PDF (inline)
     ========================================================================== */
  static async voir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserId(req);
      const file = await AttestationService.telecharger(req.params.id, userId);

      if (!file?.buffer) {
        throw new NotFoundError('PDF introuvable');
      }

      sendPdfBuffer(res, file.buffer, file.nom, 'inline');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
   🔒 ADMIN / STAFF — Envoyer une attestation par email
   ========================================================================== */
  static async envoyerParEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('Identifiant requis');
      }

      const sent = await AttestationService.envoyerParEmail(id);

      if (!sent) {
        res.status(500).json({
          success: false,
          message: "Impossible d'envoyer l'email. Vérifiez la configuration SMTP.",
        });
        return;
      }

      successResponse(res, { sent: true }, 'Attestation envoyée par email');
    } catch (e) {
      next(e);
    }
  }
}
