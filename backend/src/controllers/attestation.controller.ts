// src/controllers/AttestationController.ts
import { Request, Response, NextFunction } from 'express';
import { AttestationService } from '../services/attestation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError } from '../errors/AppError';

export class AttestationController {
  // ==================== 🌐 PUBLIC ====================

  /** GET /api/public/attestations/verifier/:numero — Vérification QR */
  static async verifyPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AttestationService.verifierAuthenticite(req.params.numero);
      if (!result.valide) {
        return res.status(404).json({ success: false, message: 'Attestation invalide ou inexistante' });
      }
      return successResponse(res, result.attestation, 'Attestation authentique');
    } catch (e) { next(e); }
  }

  // ==================== 🔒 STAFF / ADMIN ====================

  /** POST /api/attestations/generer */
  static async genererUne(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, participantId } = req.body;
      if (!sessionId || !participantId) throw new BadRequestError('sessionId et participantId requis');
      const a = await AttestationService.generer(sessionId, participantId);
      return successResponse(res, a, 'Attestation générée', 201);
    } catch (e) { next(e); }
  }

  /** POST /api/attestations/generer-session/:sessionId */
  static async genererParSession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AttestationService.genererParSession(req.params.sessionId);
      return successResponse(res, result, 'Génération terminée');
    } catch (e) { next(e); }
  }

  /** GET /api/attestations */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await AttestationService.findAll(req.query);
      return paginatedResponse(res, r.data, r.total, r.page, r.limit);
    } catch (e) { next(e); }
  }

  /** GET /api/attestations/eligibilite/:sessionId/:participantId */
  static async verifierEligibilite(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await AttestationService.verifierEligibilite(req.params.sessionId, req.params.participantId);
      return successResponse(res, r);
    } catch (e) { next(e); }
  }

  // ==================== 🔒 PARTICIPANT ====================

  /** GET /api/attestations/mes-attestations */
  static async mesAttestations(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await AttestationService.mesAttestations(req.userId!)); }
    catch (e) { next(e); }
  }

  /** GET /api/attestations/:id/telecharger */
  static async telecharger(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await AttestationService.telecharger(req.params.id, req.userId!);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${file.nom}"`);
      return res.sendFile(file.path);
    } catch (e) { next(e); }
  }
}