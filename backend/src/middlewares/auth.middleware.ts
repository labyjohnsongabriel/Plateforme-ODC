import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt.util';
import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { UnauthorizedError } from '../errors/AppError';
import { MESSAGES } from '../constants/messages';

/**
 * Vérifie le token JWT et charge l'utilisateur dans req.user
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError(MESSAGES.AUTH.TOKEN_REQUIRED);
    }

    const token = authHeader.substring(7).trim();
    if (!token) throw new UnauthorizedError(MESSAGES.AUTH.TOKEN_REQUIRED);

    const payload: JwtPayload = verifyAccessToken(token);

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: payload.userId },
      relations: ['role'],
    });

    if (!user) throw new UnauthorizedError(MESSAGES.AUTH.UNAUTHORIZED);
    if (!user.actif) throw new UnauthorizedError('Compte désactivé');
    if (user.deletedAt) throw new UnauthorizedError('Compte supprimé');

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role?.nom;

    next();
  } catch (error: any) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return next(new UnauthorizedError(MESSAGES.AUTH.TOKEN_INVALID));
    }
    next(error);
  }
}

/**
 * Authentification optionnelle (ne bloque pas si absent)
 */
export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token = authHeader.substring(7).trim();
    const payload = verifyAccessToken(token);

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: payload.userId },
      relations: ['role'],
    });

    if (user && user.actif) {
      req.user = user;
      req.userId = user.id;
      req.userRole = user.role?.nom;
    }
    next();
  } catch {
    next();
  }
}