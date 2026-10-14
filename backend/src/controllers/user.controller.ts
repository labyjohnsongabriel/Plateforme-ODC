<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { Role, RoleName } from '../models/Role.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { NotFoundError, ConflictError } from '../errors/AppError';
import bcrypt from 'bcrypt';

export class UserController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const existing = await repo.findOne({ where: { email: req.body.email } });
      if (existing) throw new ConflictError('Email deja utilise');
      const role = await AppDataSource.getRepository(Role).findOne({ where: { nom: req.body.roleNom as RoleName } });
      if (!role) throw new NotFoundError('Role introuvable');
      const user = repo.create({
        ...req.body,
        motDePasse: await bcrypt.hash(req.body.motDePasse, 12),
        roleId: role.id,
      });
      await repo.save(user);
      return successResponse(res, user, 'Utilisateur cree', 201);
    } catch (e) { next(e); }
  }
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
      const [data, total] = await AppDataSource.getRepository(User).findAndCount({
        relations: ['role'], skip, take: limit, order: { createdAt: 'DESC' },
      });
      return paginatedResponse(res, data, total, page, limit);
    } catch (e) { next(e); }
  }
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const u = await AppDataSource.getRepository(User).findOne({ where: { id: req.params.id }, relations: ['role'] });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      return successResponse(res, u);
    } catch (e) { next(e); }
  }
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const u = await repo.findOne({ where: { id: req.params.id } });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      Object.assign(u, req.body);
      await repo.save(u);
      return successResponse(res, u, 'Utilisateur mis a jour');
    } catch (e) { next(e); }
  }
  static async changeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const u = await repo.findOne({ where: { id: req.params.id } });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      const role = await AppDataSource.getRepository(Role).findOne({ where: { nom: req.body.roleNom as RoleName } });
      if (!role) throw new NotFoundError('Role introuvable');
      u.roleId = role.id;
      await repo.save(u);
      return successResponse(res, u, 'Role modifie');
    } catch (e) { next(e); }
  }
  static async toggleActif(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(User);
      const u = await repo.findOne({ where: { id: req.params.id } });
      if (!u) throw new NotFoundError('Utilisateur introuvable');
      u.actif = req.body.actif;
      await repo.save(u);
      return successResponse(res, u, 'Statut modifie');
    } catch (e) { next(e); }
  }
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await AppDataSource.getRepository(User).softDelete(req.params.id);
      return successResponse(res, null, 'Utilisateur supprime');
    } catch (e) { next(e); }
  }
  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await AppDataSource.getRepository(User).createQueryBuilder('u')
        .leftJoin('u.role', 'r').select('r.nom', 'role').addSelect('COUNT(u.id)', 'count')
        .where('u.actif = true').groupBy('r.nom').getRawMany();
      return successResponse(res, roles);
    } catch (e) { next(e); }
=======
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
  ForbiddenError,
} from '../errors/AppError';
import bcrypt from 'bcrypt';

/* ============================================================================
   HELPERS
   ============================================================================ */

const userRepo = () => AppDataSource.getRepository(User);
const roleRepo = () => AppDataSource.getRepository(Role);

/**
 * Retire les champs sensibles d'un user.
 */
function sanitizeUser(user: User | null): any {
  if (!user) return null;

  const {
    motDePasse,
    resetToken,
    resetTokenExpires,
    deletedAt,
    ...safe
  } = user;

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
 * ⭐ NEW : Vérifie qu'il reste au moins un administrateur actif.
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

/* ============================================================================
   CHAMPS AUTORISÉS
   ============================================================================ */

/** Champs qu'un ADMIN peut modifier sur un autre utilisateur */
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

/** Champs qu'un utilisateur peut modifier sur SON PROPRE profil */
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

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class UserController {
  /* ==========================================================================
     POST /api/admin/users — Admin — Créer un utilisateur
     ========================================================================== */
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, motDePasse, nom, prenom, telephone, roleNom } = req.body;

      /* -------------------- Validation -------------------- */
      if (!email || !motDePasse || !nom || !prenom) {
        throw new BadRequestError('Email, mot de passe, nom et prénom requis');
      }

      validatePasswordStrength(motDePasse);

      const normalizedEmail = email.toLowerCase().trim();

      /* -------------------- Email unique -------------------- */
      const existing = await userRepo().findOne({
        where: { email: normalizedEmail },
      });
      if (existing) {
        throw new ConflictError('Cet email est déjà utilisé');
      }

      /* -------------------- Rôle -------------------- */
      const role = await roleRepo().findOne({
        where: { nom: (roleNom as RoleName) || RoleName.PARTICIPANT },
      });
      if (!role) {
        throw new NotFoundError('Rôle introuvable');
      }

      /* -------------------- Création -------------------- */
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

      /* -------------------- Recharger avec relations -------------------- */
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

  /* ==========================================================================
     GET /api/admin/users — Admin — Liste paginée
     ========================================================================== */
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

  /* ==========================================================================
     GET /api/admin/users/:id — Admin — Détail
     ========================================================================== */
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

  /* ==========================================================================
     PUT /api/admin/users/:id — Admin — Mise à jour
     ========================================================================== */
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

      /* -------------------- ⭐ Whitelist des champs -------------------- */
      const updates: Partial<User> = {};

      for (const field of ADMIN_UPDATABLE_FIELDS) {
        if (req.body[field] !== undefined) {
          (updates as any)[field] = req.body[field];
        }
      }

      /* -------------------- Protection dernier admin -------------------- */
      // Si on désactive un admin, vérifier qu'il en reste un autre
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

  /* ==========================================================================
     PUT /api/admin/users/:id/role — Admin — Changer le rôle
     ⭐ CORRIGÉ : recharge les permissions + protection dernier admin
     ========================================================================== */
  static async changeRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { roleNom, roleId } = req.body;

      /* -------------------- Validation -------------------- */
      if (!roleNom && !roleId) {
        throw new BadRequestError('roleNom ou roleId est requis');
      }

      const user = await userRepo().findOne({
        where: { id: req.params.id },
        relations: ['role'],
      });

      if (!user) throw new NotFoundError('Utilisateur introuvable');

      /* -------------------- Trouver le rôle -------------------- */
      let role: Role | null = null;

      if (roleId) {
        role = await roleRepo().findOne({ where: { id: roleId } });
      } else {
        if (!Object.values(RoleName).includes(roleNom as RoleName)) {
          throw new BadRequestError(
            `Rôle invalide : "${roleNom}". Valeurs autorisées : ${Object.values(RoleName).join(', ')}`,
          );
        }
        role = await roleRepo().findOne({
          where: { nom: roleNom as RoleName },
        });
      }

      if (!role) {
        throw new NotFoundError(
          `Rôle "${roleNom ?? roleId}" introuvable`,
        );
      }

      /* -------------------- Protection dernier admin -------------------- */
      const isRemovingAdmin =
        user.role?.nom === RoleName.ADMINISTRATEUR &&
        role.nom !== RoleName.ADMINISTRATEUR;

      if (isRemovingAdmin) {
        await ensureNotLastAdmin(user.id);
      }

      /* -------------------- Appliquer -------------------- */
      user.roleId = role.id;
      await userRepo().save(user);

      /* -------------------- ⭐ Recharger avec permissions -------------------- */
      const updated = await userRepo().findOne({
        where: { id: user.id },
        relations: ['role', 'role.permissions'],
      });

      return successResponse(
        res,
        sanitizeUser(updated),
        `Rôle modifié en "${role.libelle}"`,
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     PUT /api/admin/users/:id/actif — Admin — Activer/Désactiver
     ⭐ CORRIGÉ : protection dernier admin
     ========================================================================== */
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

      /* -------------------- Protection dernier admin -------------------- */
      if (actif === false && user.role?.nom === RoleName.ADMINISTRATEUR) {
        await ensureNotLastAdmin(user.id);
      }

      /* -------------------- ⭐ Protection auto-désactivation -------------------- */
      const currentUserId = (req as any).user?.sub;
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

  /* ==========================================================================
     DELETE /api/admin/users/:id — Admin — Supprimer (soft delete)
     ⭐ CORRIGÉ : protection dernier admin
     ========================================================================== */
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

      /* -------------------- Auto-suppression interdite -------------------- */
      const currentUserId = (req as any).user?.sub;
      if (currentUserId === user.id) {
        throw new BadRequestError(
          'Vous ne pouvez pas supprimer votre propre compte',
        );
      }

      /* -------------------- Protection dernier admin -------------------- */
      if (user.role?.nom === RoleName.ADMINISTRATEUR) {
        await ensureNotLastAdmin(user.id);
      }

      await userRepo().softRemove(user);

      return successResponse(res, null, 'Utilisateur supprimé');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/admin/users/stats/roles — Admin — Statistiques par rôle
     ⭐ CORRIGÉ : inclut les inactifs
     ========================================================================== */
  static async stats(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      /* -------------------- Total & actifs -------------------- */
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

      /* -------------------- Répartition par rôle -------------------- */
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

  /* ==========================================================================
     POST /api/admin/users/:id/reset-password — Admin
     ========================================================================== */
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

  /* ==========================================================================
     GET /api/users/me — Utilisateur connecté
     ========================================================================== */
  static async getMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.sub;
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

  /* ==========================================================================
     PUT /api/users/me — Mettre à jour son propre profil
     ⭐ CORRIGÉ : whitelist stricte
     ========================================================================== */
  static async updateMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) throw new BadRequestError('Non authentifié');

      const user = await userRepo().findOne({ where: { id: userId } });
      if (!user) throw new NotFoundError('Utilisateur introuvable');

      /* -------------------- ⭐ Whitelist stricte -------------------- */
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

  /* ==========================================================================
     POST /api/users/me/avatar — Upload photo de profil
     ========================================================================== */
  static async uploadAvatar(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) throw new BadRequestError('Non authentifié');

      const file = (req as any).file;
      if (!file) throw new BadRequestError('Aucun fichier fourni');

      // TODO : uploader vers Cloudinary
      const photoUrl = `/uploads/avatars/${userId}-${Date.now()}-${file.originalname}`;

      await userRepo().update(userId, { photoUrl });

      return successResponse(res, { photoUrl }, 'Photo mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     PUT /api/users/me/password — Changer son mot de passe
     ========================================================================== */
  static async changeMyPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.sub;
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}