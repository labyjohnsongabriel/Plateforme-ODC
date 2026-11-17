// src/controllers/PartenaireController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Partenaire } from '../entities/Partenaire.entity';
import { User } from '../entities/User.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from '../errors/AppError';
import { logger } from '../config/logger';
import slugify from 'slugify';

export class PartenaireController {
  // ==========================================================================
  // 🌐 PUBLIC (sans authentification)
  // ==========================================================================

  /** GET /api/public/partenaires */
  static async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
      const [data, total] = await AppDataSource.getRepository(Partenaire).findAndCount({
        where: { actif: true, estPubliee: true },
        skip,
        take: limit,
        order: { ordreAffichage: 'ASC', nom: 'ASC' },
      });
      return paginatedResponse(res, data, total, page, limit, 'Partenaires publiés');
    } catch (e) { next(e); }
  }

  /** GET /api/public/partenaires/:slug */
  static async detailPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await AppDataSource.getRepository(Partenaire).findOne({
        where: { slug: req.params.slug, estPubliee: true, actif: true },
      });
      if (!p) throw new NotFoundError('Partenaire introuvable');
      return successResponse(res, p);
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 👤 PARTENAIRE CONNECTÉ (sa propre fiche)
  // ==========================================================================

  /**
   * GET /api/partenaire/fiche
   * Récupère la fiche du partenaire lié à l'utilisateur connecté.
   */
  static async moi(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AppDataSource.getRepository(User).findOne({
        where: { id: req.userId! },
      });
      if (!user) throw new NotFoundError('Utilisateur introuvable');

      // Chercher la fiche partenaire liée (par email de contact)
      let partenaire = await AppDataSource.getRepository(Partenaire).findOne({
        where: { contactEmail: user.email },
      });

      // Si aucune fiche n'existe, en créer une vide (1ère visite)
      if (!partenaire) {
        const slug = slugify(
          user.entreprise || `${user.prenom} ${user.nom}`,
          { lower: true, strict: true },
        );

        // Vérifier l'unicité du slug
        const existingSlug = await AppDataSource.getRepository(Partenaire).findOne({
          where: { slug },
        });
        const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

        partenaire = await AppDataSource.getRepository(Partenaire).save({
          nom: user.entreprise || `${user.prenom} ${user.nom}`,
          slug: finalSlug,
          contactEmail: user.email,
          contactTel: user.telephone,
          siteWeb: user.siteWeb,
          logoUrl: user.photoUrl,
          description: user.bio,
          actif: true,
          estPubliee: false,
        } as any);

        logger.info(`🤝 Fiche partenaire créée : ${user.email}`);
      }

      return successResponse(res, partenaire, 'Ma fiche partenaire');
    } catch (e) { next(e); }
  }

  /**
   * PUT /api/partenaire/fiche
   * Met à jour la fiche du partenaire connecté.
   */
  static async updateMoi(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AppDataSource.getRepository(User).findOne({
        where: { id: req.userId! },
      });
      if (!user) throw new NotFoundError('Utilisateur introuvable');

      const repo = AppDataSource.getRepository(Partenaire);
      let partenaire = await repo.findOne({
        where: { contactEmail: user.email },
      });
      if (!partenaire) throw new NotFoundError('Fiche partenaire introuvable');

      // Champs modifiables par le partenaire
      const EDITABLE = [
        'nom', 'secteur', 'description',
        'contactEmail', 'contactTel', 'siteWeb', 'logoUrl',
        'ordreAffichage',
      ] as const;

      for (const field of EDITABLE) {
        if (req.body[field] !== undefined) {
          (partenaire as any)[field] = req.body[field];
        }
      }

      // Re-slugifier si le nom change
      if (req.body.nom && req.body.nom !== partenaire.nom) {
        const slug = slugify(req.body.nom, { lower: true, strict: true });
        const existing = await repo.findOne({ where: { slug } });
        if (existing && existing.id !== partenaire.id) {
          throw new ConflictError('Ce nom est déjà utilisé');
        }
        partenaire.slug = slug;
      }

      await repo.save(partenaire);
      logger.info(`📝 Fiche partenaire mise à jour : ${user.email}`);
      return successResponse(res, partenaire, 'Fiche mise à jour');
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 🔒 ADMIN
  // ==========================================================================

  /** POST /api/admin/partenaires */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.nom) throw new BadRequestError('Nom requis');

      const slug = req.body.slug || slugify(req.body.nom, { lower: true, strict: true });

      const repo = AppDataSource.getRepository(Partenaire);
      if (await repo.findOne({ where: { slug } })) {
        throw new ConflictError('Un partenaire avec ce slug existe déjà');
      }

      const p = repo.create({ ...req.body, slug });
      await repo.save(p);

      logger.info(`🤝 Partenaire créé : ${p.nom}`);
      return successResponse(res, p, 'Partenaire créé', 201);
    } catch (e) { next(e); }
  }

  /** GET /api/admin/partenaires */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

      const qb = AppDataSource.getRepository(Partenaire).createQueryBuilder('p');

      if (req.query.q) {
        qb.andWhere('(p.nom ILIKE :q OR p.description ILIKE :q)', {
          q: `%${req.query.q}%`,
        });
      }
      if (req.query.actif !== undefined) {
        qb.andWhere('p.actif = :a', { a: req.query.actif === 'true' });
      }
      if (req.query.estPubliee !== undefined) {
        qb.andWhere('p.est_publiee = :e', { e: req.query.estPubliee === 'true' });
      }

      qb.orderBy('p.ordre_affichage', 'ASC')
        .addOrderBy('p.nom', 'ASC')
        .skip(skip)
        .take(limit);

      const [data, total] = await qb.getManyAndCount();
      return paginatedResponse(res, data, total, page, limit);
    } catch (e) { next(e); }
  }

  /** GET /api/admin/partenaires/:id */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await AppDataSource.getRepository(Partenaire).findOne({
        where: { id: req.params.id },
      });
      if (!p) throw new NotFoundError('Partenaire introuvable');
      return successResponse(res, p);
    } catch (e) { next(e); }
  }

  /** PUT /api/admin/partenaires/:id */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Partenaire);
      const p = await repo.findOne({ where: { id: req.params.id } });
      if (!p) throw new NotFoundError('Partenaire introuvable');

      // Re-slugifier si le nom change
      if (req.body.nom && req.body.nom !== p.nom && !req.body.slug) {
        req.body.slug = slugify(req.body.nom, { lower: true, strict: true });
      }

      // Vérifier collision de slug
      if (req.body.slug && req.body.slug !== p.slug) {
        const existing = await repo.findOne({ where: { slug: req.body.slug } });
        if (existing && existing.id !== p.id) {
          throw new ConflictError('Ce slug est déjà utilisé');
        }
      }

      Object.assign(p, req.body);
      await repo.save(p);

      logger.info(`📝 Partenaire mis à jour : ${p.nom}`);
      return successResponse(res, p, 'Partenaire mis à jour');
    } catch (e) { next(e); }
  }

  /** PUT /api/admin/partenaires/:id/publier */
  static async publier(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Partenaire);
      const p = await repo.findOne({ where: { id: req.params.id } });
      if (!p) throw new NotFoundError('Partenaire introuvable');

      p.estPubliee = !!req.body.estPubliee;
      await repo.save(p);

      logger.info(`${p.estPubliee ? '📢' : '📴'} Partenaire ${p.estPubliee ? 'publié' : 'dépublié'} : ${p.nom}`);
      return successResponse(res, p, p.estPubliee ? 'Partenaire publié' : 'Partenaire dépublié');
    } catch (e) { next(e); }
  }

  /** POST /api/admin/partenaires/:id/logo */
  static async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('Aucun fichier fourni');

      const repo = AppDataSource.getRepository(Partenaire);
      const p = await repo.findOne({ where: { id: req.params.id } });
      if (!p) throw new NotFoundError('Partenaire introuvable');

      p.logoUrl = `/uploads/logos/${req.file.filename}`;
      await repo.save(p);

      logger.info(`🖼️ Logo mis à jour : ${p.nom}`);
      return successResponse(res, p, 'Logo mis à jour');
    } catch (e) { next(e); }
  }

  /** DELETE /api/admin/partenaires/:id */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await AppDataSource.getRepository(Partenaire).findOne({
        where: { id: req.params.id },
      });
      if (!p) throw new NotFoundError('Partenaire introuvable');

      await AppDataSource.getRepository(Partenaire).softDelete(req.params.id);
      logger.info(`🗑️ Partenaire supprimé : ${p.nom}`);
      return successResponse(res, null, 'Partenaire supprimé');
    } catch (e) { next(e); }
  }
}