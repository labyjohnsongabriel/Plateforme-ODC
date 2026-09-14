import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Permission } from '../models/Permission.entity';
import { Role } from '../models/Role.entity';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

/**
 * Cache mémoire des permissions par rôle (5 min)
 */
const permissionCache = new Map<string, { codes: string[]; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function getPermissionsForRole(roleId: string): Promise<string[]> {
  const cached = permissionCache.get(roleId);
  if (cached && cached.expiresAt > Date.now()) return cached.codes;

  const role = await AppDataSource.getRepository(Role).findOne({
    where: { id: roleId },
    relations: ['permissions'],
  });

  const codes = role?.permissions?.map((p) => p.code) || [];
  permissionCache.set(roleId, { codes, expiresAt: Date.now() + CACHE_TTL });
  return codes;
}

/**
 * Vérifie qu'un utilisateur possède une ou plusieurs permissions
 */
export function permissionMiddleware(
  required: string | string[],
  mode: 'AND' | 'OR' = 'OR'
) {
  const requiredArray = Array.isArray(required) ? required : [required];

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(new UnauthorizedError('Non authentifié'));

      // ADMIN a toujours toutes les permissions
      if (req.user.role?.nom === 'ADMIN') return next();

      const codes = await getPermissionsForRole(req.user.roleId);

      const hasAccess =
        mode === 'AND'
          ? requiredArray.every((p) => codes.includes(p))
          : requiredArray.some((p) => codes.includes(p));

      if (!hasAccess) {
        return next(
          new ForbiddenError(
            `Permission(s) manquante(s) : ${requiredArray.join(', ')}`
          )
        );
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}

/**
 * Invalide le cache (à appeler après modification de rôles/permissions)
 */
export function invalidatePermissionCache(): void {
  permissionCache.clear();
}

export { getPermissionsForRole };