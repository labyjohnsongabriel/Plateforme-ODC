import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';
import { RoleName } from '../entities/Role.entity';
import { MESSAGES } from '../constants/messages';

/**
 * Restriction d'accès par rôle(s)
 */
export function roleMiddleware(allowedRoles: RoleName[] | string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !req.userId) {
      return next(new UnauthorizedError(MESSAGES.AUTH.UNAUTHORIZED));
    }

    const userRole = req.user.role?.nom || req.userRole;

    if (!userRole) {
      return next(new ForbiddenError('Rôle utilisateur introuvable'));
    }

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ForbiddenError(
          `Accès refusé. Rôles autorisés : ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
}

/**
 * Exclure certains rôles
 */
export function excludeRolesMiddleware(excludedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError(MESSAGES.AUTH.UNAUTHORIZED));

    const userRole = req.user.role?.nom;
    if (userRole && excludedRoles.includes(userRole)) {
      return next(new ForbiddenError('Accès refusé pour votre rôle'));
    }

    next();
  };
}

/**
 * Vérifie que l'utilisateur est propriétaire de la ressource ou ADMIN
 */
export function ownerOrAdminMiddleware(
  getOwnerId: (req: Request) => Promise<string | null> | string | null
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(new UnauthorizedError(MESSAGES.AUTH.UNAUTHORIZED));

      if (req.user.role?.nom === RoleName.ADMIN) return next();

      const ownerId = await getOwnerId(req);
      if (!ownerId) return next(new ForbiddenError('Ressource introuvable'));

      if (ownerId !== req.userId) {
        return next(new ForbiddenError('Vous n\'êtes pas propriétaire de cette ressource'));
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}