import { Request, Response, NextFunction } from 'express';
import { AttestationService } from '../services/attestation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';

export class AttestationController {
  static async genererUne(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await AttestationService.generer(req.body.sessionId, req.body.participantId), 'Attestation generee', 201); }
    catch (e) { next(e); }
  }
  static async genererParSession(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await AttestationService.genererParSession(req.params.sessionId), 'Generation terminee'); }
    catch (e) { next(e); }
  }
  static async verifier(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await AttestationService.verifierAuthenticite(req.params.numero);
      if (!r.valide) return res.status(404).json({ success: false, message: 'Attestation invalide' });
      return successResponse(res, r.attestation);
    } catch (e) { next(e); }
  }
  static async mesAttestations(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await AttestationService.mesAttestations(req.userId!)); }
    catch (e) { next(e); }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AttestationService.findAll(req.query);
      return paginatedResponse(res, result.data, result.total, result.page, result.limit);
    } catch (e) { next(e); }
  }
  static async verifierEligibilite(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await AttestationService.verifierEligibilite(req.params.sessionId, req.params.participantId)); }
    catch (e) { next(e); }
  }
}