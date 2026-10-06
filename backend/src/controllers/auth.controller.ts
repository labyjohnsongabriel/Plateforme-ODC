// src/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response.util';
import { MESSAGES } from '../constants/messages';
import { BadRequestError } from '../errors/AppError';

export class AuthController {
  /** POST /api/auth/register — Public */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { nom, prenom, email, motDePasse, telephone, roleNom } = req.body;
      if (!nom || !prenom || !email || !motDePasse) {
        throw new BadRequestError('Nom, prénom, email et mot de passe requis');
      }
      const result = await AuthService.register({
        nom, prenom, email, motDePasse, telephone,
        roleNom, // optionnel : PARTICIPANT par défaut
      });
      return successResponse(res, result, MESSAGES.AUTH.REGISTER_SUCCESS, 201);
    } catch (e) { next(e); }
  }

  /** POST /api/auth/login — Public */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, motDePasse } = req.body;
      if (!email || !motDePasse) throw new BadRequestError('Email et mot de passe requis');
      const result = await AuthService.login({ email, motDePasse });
      return successResponse(res, result, MESSAGES.AUTH.LOGIN_SUCCESS);
    } catch (e) { next(e); }
  }

  /** POST /api/auth/refresh — Public */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new BadRequestError('Refresh token requis');
      const tokens = await AuthService.refresh(refreshToken);
      return successResponse(res, tokens, 'Tokens rafraîchis');
    } catch (e) { next(e); }
  }

  /** GET /api/auth/me — Authentifié */
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.userId!);
      return successResponse(res, user, 'Profil récupéré');
    } catch (e) { next(e); }
  }

  /** POST /api/auth/change-password — Authentifié */
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { ancienMotDePasse, nouveauMotDePasse } = req.body;
      if (!ancienMotDePasse || !nouveauMotDePasse) {
        throw new BadRequestError('Ancien et nouveau mot de passe requis');
      }
      await AuthService.changePassword(req.userId!, ancienMotDePasse, nouveauMotDePasse);
      return successResponse(res, null, MESSAGES.AUTH.PASSWORD_CHANGED);
    } catch (e) { next(e); }
  }

  /** POST /api/auth/forgot-password — Public */
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) throw new BadRequestError('Email requis');
      await AuthService.forgotPassword(email);
      return successResponse(res, null, 'Email de réinitialisation envoyé');
    } catch (e) { next(e); }
  }

  /** POST /api/auth/reset-password — Public */
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, nouveauMotDePasse } = req.body;
      if (!token || !nouveauMotDePasse) throw new BadRequestError('Token et mot de passe requis');
      await AuthService.resetPassword(token, nouveauMotDePasse);
      return successResponse(res, null, 'Mot de passe réinitialisé');
    } catch (e) { next(e); }
  }
}