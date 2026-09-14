import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response.util';
import { MESSAGES } from '../constants/messages';

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
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.userId!);
      return successResponse(res, user, 'Profil récupéré');
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
  }
}