<<<<<<< HEAD
=======
// src/controllers/AuthController.ts
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response.util';
import { MESSAGES } from '../constants/messages';
<<<<<<< HEAD

export class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return successResponse(res, result, MESSAGES.AUTH.REGISTER_SUCCESS, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return successResponse(res, result, MESSAGES.AUTH.LOGIN_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refresh(refreshToken);
      return successResponse(res, tokens, 'Tokens rafraîchis');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.userId!);
      return successResponse(res, user, 'Profil récupéré');
<<<<<<< HEAD
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/change-password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { ancienMotDePasse, nouveauMotDePasse } = req.body;
      await AuthService.changePassword(
        req.userId!,
        ancienMotDePasse,
        nouveauMotDePasse
      );
      return successResponse(res, null, MESSAGES.AUTH.PASSWORD_CHANGED);
    } catch (error) {
      next(error);
    }
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}