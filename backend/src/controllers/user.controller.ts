// src/controllers/UserController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { Role } from '../entities/Role.entity';
import { RoleName } from '../entities/enums';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../errors/AppError';
import { logger } from '../config/logger';
import bcrypt from 'bcrypt';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const userRepo = () => AppDataSource.getRepository(User);
const roleRepo = () => AppDataSource.getRepository(Role);

/**
 * Extrait l'ID utilisateur de manière robuste.
 * Ton authMiddleware attache `req.user` (entité User) + `req.userId`.
 * On supporte aussi `req.user.sub` (si un jour tu changes le middleware).
 */
function getAuthUserId(req: Request): string {
  const anyReq = req as any;
  return anyReq.user?.id ?? anyReq.userId ?? anyReq.user?.sub;
}

/**
 * Retire les champs sensibles d'un user.
 */
function sanitizeUser(user: User | null): any {
  if (!user) return null;
  const { motDePasse, resetToken, resetTokenExpires, deletedAt, ...safe } =
    user;
  return safe;
}

/**
 * Valide la force d'un mot de passe.
 */
function validatePasswordStrength(password: string): void {
  if (!password || password.length < 8) {
    throw new BadRequestError(
      'Le mot de passe doit contenir au moins 8 caractères',
    );
  }
  if (!/[A-Z]/.test(password)) {
    throw new BadRequestError('Le mot de passe doit contenir une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    throw new BadRequestError('Le mot de passe doit contenir une minuscule');
  }
  if (!/[0-9]/.test(password)) {
    throw new BadRequestError('Le mot de passe doit contenir un chiffre');
  }
}

/**
 * Vérifie qu'il reste au moins un administrateur actif.
 */
async function ensureNotLastAdmin(excludeUserId?: string): Promise<void> {
  const qb = userRepo()
    .createQueryBuilder('u')
    .leftJoin('u.role', 'r')
    .where('r.nom = :nom', { nom: RoleName.ADMINISTRATEUR })
    .andWhere('u.actif = :actif', { actif: true })
    .andWhere('u.deletedAt IS NULL');

  if (excludeUserId) {
    qb.andWhere('u.id != :id', { id: excludeUserId });
  }

  const count = await qb.getCount();
  if (count === 0) {
    throw new BadRequestError(
      'Impossible : il doit rester au moins un administrateur actif',
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHAMPS AUTORISÉS
   ═══════════════════════════════════════════════════════════════════════════ */

const ADMIN_UPDATABLE_FIELDS = [
  'nom',
  'prenom',
  'telephone',
  'bio',
  'ville',
  'entreprise',
  'poste',
  'siteWeb',
  'linkedin',
  'photoUrl',
  'actif',
  'emailVerifie',
] as const;

const SELF_UPDATABLE_FIELDS = [
  'prenom',
  'nom',
  'telephone',
  'bio',
  'ville',
  'entreprise',
  'poste',
  'siteWeb',
  'linkedin',
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROLLER
   ═══════════════════════════════════════════════════════════════════════════ */

export class UserController {
  /* ══════════════════════════════════════════════════════════════════════════
     POST /api/admin/users — Créer un utilisateur
     ══════════════════════════════════════════════════════════════════════════ */
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, motDePasse, nom, prenom, telephone, roleNom } = req.body;

      if (!email || !motDePasse || !nom || !prenom) {
        throw new BadRequestError(
          'Email, mot de passe, nom et prénom requis',
        );
      }

      validatePasswordStrength(motDePasse);

      const normalizedEmail = email.toLowerCase().trim();

      const existing = await userRepo().findOne({
        where: { email: normalizedEmail },
      });
      if (existing) {
        throw new ConflictError('Cet email est déjà utilisé');
      }

      const role = await roleRepo().findOne({
        where: { nom: (roleNom as RoleName) || RoleName.PARTICIPANT },
      });
      if (!role) {
        throw new NotFoundError('Rôle introuvable');
      }

      const user = userRepo().create({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: normalizedEmail,
        telephone: telephone ?? null,
        motDePasse: await bcrypt.hash(motDePasse, 12),
        roleId: role.id,
        actif: true,
      });

      await userRepo().save(user);

      const fullUser = await userRepo().findOne({
        where: { id: user.id },
        relations: ['role'],
      });

      return successResponse(
        res,
        sanitizeUser(fullUser),
        'Utilisateur créé',
        201,
      );
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     GET /api/admin/users — Liste paginée
     ══════════════════════════════════════════════════════════════════════════ */
  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page, limit, skip } = getPagination(
        req.query.page,
        req.query.limit,
      );
      const { role, roleId, actif, q } = req.query;

      const qb = userRepo()
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.role', 'r')
        .where('u.deletedAt IS NULL');

      if (role && typeof role === 'string') {
        qb.andWhere('r.nom = :role', { role });
      }
      if (roleId && typeof roleId === 'string') {
        qb.andWhere('u.roleId = :rid', { rid: roleId });
      }
      if (actif !== undefined) {
        const actifBool = actif === 'true' || actif === true;
        qb.andWhere('u.actif = :a', { a: actifBool });
      }
      if (q && typeof q === 'string') {
        qb.andWhere(
          '(u.nom ILIKE :q OR u.prenom ILIKE :q OR u.email ILIKE :q)',
          { q: `%${q}%` },
        );
      }

      qb.orderBy('u.createdAt', 'DESC').skip(skip).take(limit);

      const [data, total] = await qb.getManyAndCount();
      const sanitized = data.map(sanitizeUser);

      return paginatedResponse(res, sanitized, total, page, limit);
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     GET /api/admin/users/:id — Détail
     ══════════════════════════════════════════════════════════════════════════ */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await userRepo().findOne({
        where: { id: req.params.id },
        relations: ['role', 'role.permissions'],
      });

      if (!user) throw new NotFoundError('Utilisateur introuvable');

      return successResponse(res, sanitizeUser(user));
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PUT /api/admin/users/:id — Mise à jour
     ══════════════════════════════════════════════════════════════════════════ */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await userRepo().findOne({
        where: { id: req.params.id },
        relations: ['role'],
      });

      if (!user) throw new NotFoundError('Utilisateur introuvable');

      const updates: Partial<User> = {};
      for (const field of ADMIN_UPDATABLE_FIELDS) {
        if (req.body[field] !== undefined) {
          (updates as any)[field] = req.body[field];
        }
      }

      if (
        updates.actif === false &&
        user.role?.nom === RoleName.ADMINISTRATEUR
      ) {
        await ensureNotLastAdmin(user.id);
      }

      Object.assign(user, updates);
      await userRepo().save(user);

      const updated = await userRepo().findOne({
        where: { id: user.id },
        relations: ['role'],
      });

      return successResponse(
        res,
        sanitizeUser(updated),
        'Utilisateur mis à jour',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PUT /api/admin/users/:id/role — Changer le rôle
     ══════════════════════════════════════════════════════════════════════════ */
  static async changeRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { roleNom, roleId, role: roleBody } = req.body;
      const targetRole = roleNom ?? roleBody ?? roleId;

      logger.info('[changeRole] Début', {
        userId: req.params.id,
        body: req.body,
        targetRole,
      });

      if (!targetRole) {
        throw new BadRequestError('roleNom, role ou roleId est requis');
      }

      const user = await userRepo().findOne({
        where: { id: req.params.id },
        relations: ['role'],
      });

      if (!user) {
        throw new NotFoundError('Utilisateur introuvable');
      }

      let role: Role | null = null;

      const isUuid =
        typeof targetRole === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          targetRole,
        );

      if (isUuid) {
        role = await roleRepo().findOne({ where: { id: targetRole } });
      } else {
        if (!Object.values(RoleName).includes(targetRole as RoleName)) {
          throw new BadRequestError(
            `Rôle invalide : "${targetRole}". Valeurs : ${Object.values(RoleName).join(', ')}`,
          );
        }
        role = await roleRepo().findOne({
          where: { nom: targetRole as RoleName },
        });
      }

      if (!role) {
        throw new NotFoundError(`Rôle "${targetRole}" introuvable`);
      }

      const wasAdmin = user.role?.nom === RoleName.ADMINISTRATEUR;
      const willBeAdmin = role.nom === RoleName.ADMINISTRATEUR;

      if (wasAdmin && !willBeAdmin) {
        await ensureNotLastAdmin(user.id);
      }

      user.roleId = role.id;
      user.role = role;
      await userRepo().save(user);

      const updated = await userRepo().findOne({
        where: { id: user.id },
        relations: ['role', 'role.permissions'],
      });

      return successResponse(
        res,
        sanitizeUser(updated),
        `Rôle modifié en "${role.libelle ?? role.nom}"`,
      );
    } catch (e) {
      logger.error('[changeRole] Erreur', e);
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PUT /api/admin/users/:id/actif — Activer/Désactiver
     ══════════════════════════════════════════════════════════════════════════ */
  static async toggleActif(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { actif } = req.body;

      if (typeof actif !== 'boolean') {
        throw new BadRequestError('actif doit être un booléen');
      }

      const user = await userRepo().findOne({
        where: { id: req.params.id },
        relations: ['role'],
      });

      if (!user) throw new NotFoundError('Utilisateur introuvable');

      if (actif === false && user.role?.nom === RoleName.ADMINISTRATEUR) {
        await ensureNotLastAdmin(user.id);
      }

      const currentUserId = getAuthUserId(req);
      if (currentUserId === user.id && actif === false) {
        throw new BadRequestError(
          'Vous ne pouvez pas désactiver votre propre compte',
        );
      }

      user.actif = actif;
      await userRepo().save(user);

      return successResponse(
        res,
        sanitizeUser(user),
        user.actif ? 'Utilisateur activé' : 'Utilisateur désactivé',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     DELETE /api/admin/users/:id — Supprimer (soft delete)
     ══════════════════════════════════════════════════════════════════════════ */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await userRepo().findOne({
        where: { id: req.params.id },
        relations: ['role'],
      });

      if (!user) throw new NotFoundError('Utilisateur introuvable');

      const currentUserId = getAuthUserId(req);
      if (currentUserId === user.id) {
        throw new BadRequestError(
          'Vous ne pouvez pas supprimer votre propre compte',
        );
      }

      if (user.role?.nom === RoleName.ADMINISTRATEUR) {
        await ensureNotLastAdmin(user.id);
      }

      await userRepo().softRemove(user);

      return successResponse(res, null, 'Utilisateur supprimé');
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     GET /api/admin/users/stats/roles — Statistiques par rôle
     ══════════════════════════════════════════════════════════════════════════ */
  static async stats(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const total = await userRepo()
        .createQueryBuilder('u')
        .where('u.deletedAt IS NULL')
        .getCount();

      const actifs = await userRepo()
        .createQueryBuilder('u')
        .where('u.actif = :actif', { actif: true })
        .andWhere('u.deletedAt IS NULL')
        .getCount();

      const inactifs = total - actifs;

      const parRole = await userRepo()
        .createQueryBuilder('u')
        .leftJoin('u.role', 'r')
        .select('r.nom', 'role')
        .addSelect('r.libelle', 'libelle')
        .addSelect('COUNT(u.id)', 'count')
        .where('u.deletedAt IS NULL')
        .groupBy('r.nom')
        .addGroupBy('r.libelle')
        .getRawMany();

      return successResponse(res, {
        total,
        actifs,
        inactifs,
        parRole: parRole.map((r) => ({
          role: r.role ?? 'PARTICIPANT',
          libelle: r.libelle ?? 'Participant',
          count: Number(r.count),
        })),
      });
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     POST /api/admin/users/:id/reset-password — Reset mot de passe
     ══════════════════════════════════════════════════════════════════════════ */
  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { nouveauMotDePasse } = req.body;

      if (!nouveauMotDePasse) {
        throw new BadRequestError('Nouveau mot de passe requis');
      }

      validatePasswordStrength(nouveauMotDePasse);

      const user = await userRepo()
        .createQueryBuilder('u')
        .addSelect('u.motDePasse')
        .where('u.id = :id', { id: req.params.id })
        .getOne();

      if (!user) throw new NotFoundError('Utilisateur introuvable');

      user.motDePasse = await bcrypt.hash(nouveauMotDePasse, 12);
      await userRepo().save(user);

      return successResponse(res, null, 'Mot de passe réinitialisé');
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     GET /api/users/me — Utilisateur connecté
     ══════════════════════════════════════════════════════════════════════════ */
  static async getMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getAuthUserId(req);
      if (!userId) throw new BadRequestError('Non authentifié');

      const user = await userRepo().findOne({
        where: { id: userId },
        relations: ['role', 'role.permissions'],
      });

      if (!user) throw new NotFoundError('Utilisateur introuvable');

      return successResponse(res, sanitizeUser(user));
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PUT /api/users/me — Mettre à jour son propre profil
     ══════════════════════════════════════════════════════════════════════════ */
  static async updateMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getAuthUserId(req);
      if (!userId) throw new BadRequestError('Non authentifié');

      const user = await userRepo().findOne({ where: { id: userId } });
      if (!user) throw new NotFoundError('Utilisateur introuvable');

      for (const field of SELF_UPDATABLE_FIELDS) {
        if (req.body[field] !== undefined) {
          (user as any)[field] = req.body[field];
        }
      }

      await userRepo().save(user);

      const updated = await userRepo().findOne({
        where: { id: user.id },
        relations: ['role'],
      });

      return successResponse(res, sanitizeUser(updated), 'Profil mis à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     POST /api/users/me/avatar — Upload photo
     ══════════════════════════════════════════════════════════════════════════ */
  static async uploadAvatar(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getAuthUserId(req);
      if (!userId) throw new BadRequestError('Non authentifié');

      const file = (req as any).file;
      if (!file) throw new BadRequestError('Aucun fichier fourni');

      const photoUrl = `/uploads/avatars/${file.filename}`;
      await userRepo().update(userId, { photoUrl });

      return successResponse(res, { photoUrl }, 'Photo mise à jour');
    } catch (e) {
      next(e);
    }
  }

  
  static async uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthUserId(req);
    if (!userId) throw new BadRequestError('Non authentifié');

    const file = (req as any).file;
    if (!file) throw new BadRequestError('Aucun fichier fourni');

    const photoUrl = `/uploads/avatars/${file.filename}`;
    await userRepo().update(userId, { photoUrl });

    return successResponse(res, { photoUrl }, 'Photo mise à jour');
  } catch (e) {
    next(e);
  }
}

  /* ══════════════════════════════════════════════════════════════════════════
     PUT /api/users/me/password — Changer son mot de passe
     ══════════════════════════════════════════════════════════════════════════ */
  static async changeMyPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getAuthUserId(req);
      if (!userId) throw new BadRequestError('Non authentifié');

      const { ancienMotDePasse, nouveauMotDePasse } = req.body;

      if (!ancienMotDePasse || !nouveauMotDePasse) {
        throw new BadRequestError('Ancien et nouveau mot de passe requis');
      }

      validatePasswordStrength(nouveauMotDePasse);

      const user = await userRepo()
        .createQueryBuilder('u')
        .addSelect('u.motDePasse')
        .where('u.id = :id', { id: userId })
        .getOne();

      if (!user) throw new NotFoundError('Utilisateur introuvable');

      const isValid = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
      if (!isValid) {
        throw new BadRequestError('Ancien mot de passe incorrect');
      }

      user.motDePasse = await bcrypt.hash(nouveauMotDePasse, 12);
      await userRepo().save(user);

      return successResponse(res, null, 'Mot de passe modifié');
    } catch (e) {
      next(e);
    }
  }
}