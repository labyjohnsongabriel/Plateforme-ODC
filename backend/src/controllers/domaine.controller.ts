// src/controllers/domaine.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Domaine } from '../entities/Domaine.entity';
import { Formation } from '../entities/Formation.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { BadRequestError, NotFoundError } from '../errors/AppError';
import { slugify } from '../utils/string.util';
import { logger } from '../config/logger';

/* ============================================================================
   REPOSITORY — Toujours appeler getRepository() dans la fonction
   ============================================================================ */

const domaineRepo = () => AppDataSource.getRepository(Domaine);
const formationRepo = () => AppDataSource.getRepository(Formation);

/* ============================================================================
   TYPES
   ============================================================================ */

interface DomaineQuery {
  page?: string | number;
  limit?: string | number;
  q?: string;
  actif?: string;
  estPubliee?: string;
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class DomaineController {
  /* ==========================================================================
     🌐 PUBLIC — Liste des domaines publiés
     GET /api/public/domaines
     ========================================================================== */
  static async listPublic(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const domaines = await domaineRepo()
        .createQueryBuilder('d')
        .leftJoin('d.formations', 'f')
        .loadRelationCountAndMap('d.formationsCount', 'd.formations')
        .where('d.actif = :actif', { actif: true })
        .andWhere('d.estPubliee = :publiee', { publiee: true })
        .andWhere('d.deletedAt IS NULL')
        .orderBy('d.ordreAffichage', 'ASC')
        .addOrderBy('d.nom', 'ASC')
        .getMany();

      return successResponse(res, domaines, 'Domaines publics');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🌐 PUBLIC — Détail par slug
     GET /api/public/domaines/:slug
     ========================================================================== */
  static async detailPublic(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { slug } = req.params;

      if (!slug) {
        throw new BadRequestError('Slug requis');
      }

      const domaine = await domaineRepo()
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.formations', 'f')
        .loadRelationCountAndMap('d.formationsCount', 'd.formations')
        .where('d.slug = :slug', { slug })
        .andWhere('d.actif = :actif', { actif: true })
        .andWhere('d.estPubliee = :publiee', { publiee: true })
        .andWhere('d.deletedAt IS NULL')
        .getOne();

      if (!domaine) {
        throw new NotFoundError(`Domaine "${slug}" introuvable`);
      }

      return successResponse(res, domaine);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Liste paginée avec compteurs
     GET /api/admin/domaines
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

      const { q, actif, estPubliee } = req.query as DomaineQuery;

      const qb = domaineRepo()
        .createQueryBuilder('d')
        // ⭐ Compteur de formations
        .loadRelationCountAndMap('d.formationsCount', 'd.formations')
        .where('d.deletedAt IS NULL');

      /* -------------------- Recherche -------------------- */
      if (q && String(q).trim()) {
        qb.andWhere(
          '(d.nom ILIKE :q OR d.slug ILIKE :q OR d.description ILIKE :q)',
          { q: `%${q}%` },
        );
      }

      /* -------------------- Filtre actif -------------------- */
      if (actif !== undefined && actif !== 'all') {
        qb.andWhere('d.actif = :actif', {
          actif: actif === 'true',
        });
      }

      /* -------------------- Filtre estPubliee -------------------- */
      if (estPubliee !== undefined && estPubliee !== 'all') {
        qb.andWhere('d.estPubliee = :estPubliee', {
          estPubliee: estPubliee === 'true',
        });
      }

      /* -------------------- Tri + Pagination -------------------- */
      qb.orderBy('d.ordreAffichage', 'ASC')
        .addOrderBy('d.createdAt', 'DESC')
        .offset(skip)
        .limit(limit);

      const total = await qb.getCount();
      const data = await qb.getMany();

      /* -------------------- Normalisation -------------------- */
      const normalized = data.map((d) => ({
        ...d,
        formationsCount: Number(
          (d as any).formationsCount ?? 0,
        ),
      }));

      return paginatedResponse(
        res,
        normalized,
        total,
        page,
        limit,
        'Liste des domaines',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐ ADMIN — Statistiques globales des domaines
     GET /api/admin/domaines/stats
     ⚠️ Route spécifique AVANT /:id
     ========================================================================== */
  static async stats(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const [total, published, draft, actifs] = await Promise.all([
        domaineRepo().count(),
        domaineRepo().count({ where: { estPubliee: true } }),
        domaineRepo().count({ where: { estPubliee: false } }),
        domaineRepo().count({ where: { actif: true } }),
      ]);

      /* -------------------- Nombre total de formations -------------------- */
      const totalFormations = await formationRepo().count();

      return successResponse(res, {
        total,
        published,
        draft,
        actifs,
        totalFormations,
      });
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐ ADMIN — Statistiques par domaine (nb formations)
     GET /api/admin/domaines/stats/formations
     ⚠️ Route spécifique AVANT /:id
     ========================================================================== */
  static async statsByDomaine(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await domaineRepo()
        .createQueryBuilder('d')
        .leftJoin('d.formations', 'f')
        .select('d.id', 'id')
        .addSelect('d.nom', 'nom')
        .addSelect('d.slug', 'slug')
        .addSelect('d.couleur', 'couleur')
        .addSelect('COUNT(f.id)', 'nbFormations')
        .where('d.deletedAt IS NULL')
        .groupBy('d.id')
        .addGroupBy('d.nom')
        .addGroupBy('d.slug')
        .addGroupBy('d.couleur')
        .orderBy('nbFormations', 'DESC')
        .getRawMany();

      const formatted = stats.map((s) => ({
        id: s.id,
        nom: s.nom,
        slug: s.slug,
        couleur: s.couleur ?? '#6B7280',
        nbFormations: Number(s.nbFormations),
      }));

      return successResponse(res, formatted);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Détail par ID
     GET /api/admin/domaines/:id
     ========================================================================== */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const domaine = await domaineRepo()
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.formations', 'f')
        .loadRelationCountAndMap('d.formationsCount', 'd.formations')
        .where('d.id = :id', { id: req.params.id })
        .andWhere('d.deletedAt IS NULL')
        .getOne();

      if (!domaine) {
        throw new NotFoundError('Domaine introuvable');
      }

      return successResponse(res, {
        ...domaine,
        formationsCount: Number(
          (domaine as any).formationsCount ?? 0,
        ),
      });
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Créer un domaine
     POST /api/admin/domaines
     ========================================================================== */
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        nom,
        description,
        couleur,
        icone,
        ordreAffichage,
        actif,
        estPubliee,
      } = req.body;

      /* -------------------- Validation -------------------- */
      if (!nom || typeof nom !== 'string') {
        throw new BadRequestError('Le nom est requis');
      }

      if (nom.trim().length < 2) {
        throw new BadRequestError(
          'Le nom doit contenir au moins 2 caractères',
        );
      }

      /* -------------------- Slug auto -------------------- */
      const slug = req.body.slug || slugify(nom);

      /* -------------------- Vérifier unicité -------------------- */
      const existing = await domaineRepo().findOne({
        where: [{ nom: nom.trim() }, { slug }],
      });

      if (existing) {
        throw new BadRequestError(
          existing.nom === nom.trim()
            ? 'Un domaine avec ce nom existe déjà'
            : 'Un domaine avec ce slug existe déjà',
        );
      }

      /* -------------------- Création -------------------- */
      const domaine = domaineRepo().create({
        nom: nom.trim(),
        slug,
        description: description ?? null,
        couleur: couleur ?? null,
        icone: icone ?? null,
        ordreAffichage: Number(ordreAffichage) || 0,
        actif: actif !== undefined ? actif : true,
        estPubliee: estPubliee !== undefined ? estPubliee : true,
      });

      await domaineRepo().save(domaine);

      logger.info(`📁 Domaine créé : ${domaine.nom} (${domaine.slug})`);

      return successResponse(res, domaine, 'Domaine créé', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Mettre à jour un domaine
     PUT /api/admin/domaines/:id
     ========================================================================== */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const domaine = await domaineRepo().findOne({
        where: { id: req.params.id },
      });

      if (!domaine) {
        throw new NotFoundError('Domaine introuvable');
      }

      const {
        nom,
        description,
        couleur,
        icone,
        ordreAffichage,
        actif,
        estPubliee,
        slug: newSlug,
      } = req.body;

      /* -------------------- Nom + slug -------------------- */
      if (nom !== undefined && nom !== domaine.nom) {
        const trimmedNom = nom.trim();

        // Vérifier unicité du nouveau nom
        const existing = await domaineRepo().findOne({
          where: { nom: trimmedNom },
        });

        if (existing && existing.id !== domaine.id) {
          throw new BadRequestError(
            'Un domaine avec ce nom existe déjà',
          );
        }

        domaine.nom = trimmedNom;

        // Régénérer le slug si le nom change et pas de slug fourni
        if (newSlug === undefined) {
          domaine.slug = slugify(trimmedNom);
        }
      }

      /* -------------------- Slug manuel -------------------- */
      if (newSlug !== undefined) {
        const existingSlug = await domaineRepo().findOne({
          where: { slug: newSlug },
        });

        if (existingSlug && existingSlug.id !== domaine.id) {
          throw new BadRequestError(
            'Un domaine avec ce slug existe déjà',
          );
        }

        domaine.slug = newSlug;
      }

      /* -------------------- Autres champs -------------------- */
      if (description !== undefined) domaine.description = description;
      if (couleur !== undefined) domaine.couleur = couleur;
      if (icone !== undefined) domaine.icone = icone;
      if (ordreAffichage !== undefined) {
        domaine.ordreAffichage = Number(ordreAffichage) || 0;
      }
      if (actif !== undefined) domaine.actif = actif;
      if (estPubliee !== undefined) domaine.estPubliee = estPubliee;

      await domaineRepo().save(domaine);

      logger.info(`📝 Domaine mis à jour : ${domaine.nom}`);

      return successResponse(res, domaine, 'Domaine mis à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Publier / Dépublier
     PUT /api/admin/domaines/:id/publier
     ========================================================================== */
  static async publier(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const domaine = await domaineRepo().findOne({
        where: { id: req.params.id },
      });

      if (!domaine) {
        throw new NotFoundError('Domaine introuvable');
      }

      const estPubliee =
        typeof req.body.estPubliee === 'boolean'
          ? req.body.estPubliee
          : !domaine.estPubliee;

      domaine.estPubliee = estPubliee;
      await domaineRepo().save(domaine);

      logger.info(
        `${estPubliee ? '📢' : '📴'} Domaine ${
          estPubliee ? 'publié' : 'dépublié'
        } : ${domaine.nom}`,
      );

      return successResponse(
        res,
        domaine,
        estPubliee ? 'Domaine publié' : 'Domaine dépublié',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Toggle actif/inactif
     PUT /api/admin/domaines/:id/actif
     ========================================================================== */
  static async toggleActif(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const domaine = await domaineRepo().findOne({
        where: { id: req.params.id },
      });

      if (!domaine) {
        throw new NotFoundError('Domaine introuvable');
      }

      const actif =
        typeof req.body.actif === 'boolean'
          ? req.body.actif
          : !domaine.actif;

      domaine.actif = actif;
      await domaineRepo().save(domaine);

      return successResponse(
        res,
        domaine,
        actif ? 'Domaine activé' : 'Domaine désactivé',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Upload image
     POST /api/admin/domaines/:id/image
     ========================================================================== */
  static async uploadImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError('Aucun fichier fourni');
      }

      const domaine = await domaineRepo().findOne({
        where: { id: req.params.id },
      });

      if (!domaine) {
        throw new NotFoundError('Domaine introuvable');
      }

      const filename =
        (req.file as any).filename ?? req.file.originalname ?? 'image';
      const imageUrl = `/uploads/domaines/${Date.now()}-${filename}`;

      domaine.imageUrl = imageUrl;
      await domaineRepo().save(domaine);

      logger.info(`🖼️ Image mise à jour pour ${domaine.nom}`);

      return successResponse(res, domaine, 'Image mise à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Supprimer un domaine
     DELETE /api/admin/domaines/:id
     ========================================================================== */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const domaine = await domaineRepo()
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.formations', 'f')
        .loadRelationCountAndMap('d.formationsCount', 'd.formations')
        .where('d.id = :id', { id: req.params.id })
        .getOne();

      if (!domaine) {
        throw new NotFoundError('Domaine introuvable');
      }

      const formationsCount = Number(
        (domaine as any).formationsCount ?? 0,
      );

      if (formationsCount > 0) {
        throw new BadRequestError(
          `Impossible de supprimer ce domaine : ${formationsCount} formation(s) y sont rattachées`,
        );
      }

      await domaineRepo().softRemove(domaine);

      logger.info(`🗑️ Domaine supprimé : ${domaine.nom}`);

      return successResponse(res, null, 'Domaine supprimé');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Réorganiser l'ordre d'affichage
     PUT /api/admin/domaines/reorder
     ⚠️ Route spécifique AVANT /:id
     ========================================================================== */
  static async reorder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { orderedIds }: { orderedIds: string[] } = req.body;

      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        throw new BadRequestError('orderedIds requis (tableau non vide)');
      }

      await Promise.all(
        orderedIds.map((id, index) =>
          domaineRepo().update(id, { ordreAffichage: index }),
        ),
      );

      logger.info(`🔀 ${orderedIds.length} domaines réordonnés`);

      return successResponse(
        res,
        { count: orderedIds.length },
        'Ordre mis à jour',
      );
    } catch (e) {
      next(e);
    }
  }
}