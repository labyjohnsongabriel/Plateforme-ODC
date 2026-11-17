// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt.util';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { ApiError } from '../utils/ApiError';
import { MESSAGES } from '../constants/messages';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    /* ⭐ LOG pour debug */
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH MIDDLEWARE]', {
        method: req.method,
        url: req.originalUrl,
        hasAuthHeader: !!authHeader,
        authPreview: authHeader
          ? `${authHeader.slice(0, 30)}...`
          : null,
      });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_REQUIRED);
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_REQUIRED);
    }

    /* Vérifier le JWT */
    const payload: JwtPayload = verifyAccessToken(token);

    /* ⭐ Extraire userId (sub OU userId) */
    const userId = payload.sub ?? (payload as any).userId;

    if (!userId) {
      throw ApiError.unauthorized(
        'JWT sans identifiant utilisateur (sub/userId manquant)',
      );
    }

    /* Charger l'utilisateur */
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw ApiError.unauthorized(MESSAGES.AUTH.UNAUTHORIZED);
    }
    if (!user.actif) {
      throw ApiError.unauthorized('Compte désactivé');
    }
    if (user.deletedAt) {
      throw ApiError.unauthorized('Compte supprimé');
    }

    if (!user.role) {
      throw ApiError.forbidden(
        'Utilisateur sans rôle assigné — contactez l\'administrateur',
      );
    }

    /* Attacher au req */
    (req as any).user = user;
    (req as any).userId = user.id;
    (req as any).userRole = user.role.nom;

    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token = authHeader.substring(7).trim();
    if (!token) return next();

    const payload = verifyAccessToken(token);
    const userId = payload.sub ?? (payload as any).userId;
    if (!userId) return next();

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (user && user.actif && !user.deletedAt && user.role) {
      (req as any).user = user;
      (req as any).userId = user.id;
      (req as any).userRole = user.role.nom;
    }
    next();
  } catch {
    next();
  }
}