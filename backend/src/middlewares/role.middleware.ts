// src/middlewares/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';
import { RoleName } from '../models/Role.entity';
import { MESSAGES } from '../constants/messages';
import { logger } from '../config/logger';

function extractRole(req: Request): string | null {
  const user = (req as any).user;
  if (!user) return null;

  if (typeof user.role === 'object' && user.role?.nom) {
    return user.role.nom;
  }
  if (typeof user.role === 'string') {
    return user.role;
  }
  if (typeof (req as any).userRole === 'string') {
    return (req as any).userRole;
  }
  return null;
}

function isAuthenticated(req: Request): boolean {
  return !!(req as any).user && !!(req as any).userId;
}

export function roleMiddleware(allowedRoles: (RoleName | string)[]) {
  if (!allowedRoles || allowedRoles.length === 0) {
    throw new Error('[roleMiddleware] allowedRoles ne peut pas être vide');
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!isAuthenticated(req)) {
      logger.warn(`🚫 [roleMiddleware] Unauthorized — path=${req.path}`);
      return next(new UnauthorizedError(MESSAGES.AUTH.UNAUTHORIZED));
    }

    const userRole = extractRole(req);
    if (!userRole) {
      return next(new ForbiddenError('Rôle utilisateur introuvable'));
    }

    const normalizedUserRole = String(userRole).toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      logger.warn(
        `🚫 [roleMiddleware] Accès refusé — path=${req.path}, role=${userRole}`,
      );
      return next(
        new ForbiddenError(
          `Accès refusé. Rôles autorisés : ${allowedRoles.join(', ')}`,
        ),
      );
    }

    next();
  };
}

export function excludeRolesMiddleware(excludedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!isAuthenticated(req)) {
      return next(new UnauthorizedError(MESSAGES.AUTH.UNAUTHORIZED));
    }

    const userRole = extractRole(req);
    if (!userRole) {
      return next(new ForbiddenError('Rôle utilisateur introuvable'));
    }

    const normalizedUserRole = String(userRole).toUpperCase();
    const normalizedExcluded = excludedRoles.map((r) => String(r).toUpperCase());

    if (normalizedExcluded.includes(normalizedUserRole)) {
      return next(new ForbiddenError('Accès refusé pour votre rôle'));
    }

    next();
  };
}

export function ownerOrAdminMiddleware(
  getOwnerId: (req: Request) => Promise<string | null> | string | null,
  adminRoles: string[] = [RoleName.ADMINISTRATEUR],  // ✅ ADMINISTRATEUR
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!isAuthenticated(req)) {
        return next(new UnauthorizedError(MESSAGES.AUTH.UNAUTHORIZED));
      }

      const userRole = extractRole(req);
      if (!userRole) {
        return next(new ForbiddenError('Rôle utilisateur introuvable'));
      }

      const normalizedRole = String(userRole).toUpperCase();
      const normalizedAdmin = adminRoles.map((r) => String(r).toUpperCase());
      if (normalizedAdmin.includes(normalizedRole)) {
        return next();
      }

      const ownerId = await getOwnerId(req);
      if (!ownerId) {
        return next(new ForbiddenError('Ressource introuvable'));
      }

      const userId = (req as any).userId;
      if (ownerId !== userId) {
        return next(
          new ForbiddenError("Vous n'êtes pas propriétaire de cette ressource"),
        );
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}

/* ✅ Constantes alignées sur la BDD */
export const adminOnly = roleMiddleware([RoleName.ADMINISTRATEUR]);
export const staffOrAdmin = roleMiddleware([RoleName.STAFF_ODC, RoleName.ADMINISTRATEUR]);
export const formateurOrAdmin = roleMiddleware([RoleName.FORMATEUR, RoleName.ADMINISTRATEUR]);
export const participantOrAdmin = roleMiddleware([RoleName.PARTICIPANT, RoleName.ADMINISTRATEUR]);
export const partenaireOrAdmin = roleMiddleware([RoleName.PARTENAIRE, RoleName.ADMINISTRATEUR]);