// src/controllers/domaine.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Domaine } from '../entities/Domaine.entity';
import { Formation } from '../entities/Formation.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { BadRequestError, NotFoundError } from '../errors/AppError';
import { slugify } from '../utils/string.util';

/* ============================================================================
   REPOSITORY
   ============================================================================ */

// ⭐ CRUCIAL : toujours appeler AppDataSource.getRepository() DANS la fonction
const domaineRepo = () => AppDataSource.getRepository(Domaine);

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
     🌐 PUBLIC — Liste
     ========================================================================== */
  static async listPublic(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const domaines = await domaineRepo().find({
        where: { actif: true, estPubliee: true },
        order: { ordreAffichage: 'ASC', nom: 'ASC' }, // ⭐ propriétés TS
      });

      return successResponse(res, domaines, 'Domaines publics');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🌐 PUBLIC — Détail par slug
     ========================================================================== */
  static async detailPublic(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { slug } = req.params;

      if (!slug) throw new BadRequestError('Slug requis');

      const domaine = await domaineRepo().findOne({
        where: { slug, actif: true, estPubliee: true },
        relations: ['formations'],
      });

      if (!domaine) {
        throw new NotFoundError(`Domaine "${slug}" introuvable`);
      }

      return successResponse(res, domaine);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Liste paginée
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
        .where('d.deletedAt IS NULL');

      if (q) {
        qb.andWhere('(d.nom ILIKE :q OR d.slug ILIKE :q)', {
          q: `%${q}%`,
        });
      }

      if (actif !== undefined) {
        qb.andWhere('d.actif = :actif', { actif: actif === 'true' });
      }

      if (estPubliee !== undefined) {
        qb.andWhere('d.estPubliee = :estPubliee', {
          estPubliee: estPubliee === 'true',
        });
      }

      // ⭐ Propriétés TS : createdAt, updatedAt, ordreAffichage
      qb.orderBy('d.ordreAffichage', 'ASC')
        .addOrderBy('d.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      const [data, total] = await qb.getManyAndCount();

      return paginatedResponse(
        res,
        data,
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
     🔒 ADMIN — Détail par ID
     ========================================================================== */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const domaine = await domaineRepo().findOne({
        where: { id: req.params.id },
        relations: ['formations'],
      });

      if (!domaine) {
        throw new NotFoundError('Domaine introuvable');
      }

      return successResponse(res, domaine);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ⭐🔒 ADMIN — Créer (LIGNE 98 CORRIGÉE)
     ========================================================================== */
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { nom, description, couleur, icone, ordreAffichage } = req.body;

      /* -------------------- Validation -------------------- */
      if (!nom || typeof nom !== 'string') {
        throw new BadRequestError('Le nom est requis');
      }

      /* -------------------- Slug auto -------------------- */
      const slug = req.body.slug || slugify(nom);

      /* -------------------- Vérifier unicité -------------------- */
      const existing = await domaineRepo().findOne({
        where: [{ nom }, { slug }],
      });

      if (existing) {
        throw new BadRequestError(
          existing.nom === nom
            ? 'Un domaine avec ce nom existe déjà'
            : 'Un domaine avec ce slug existe déjà',
        );
      }

      /* -------------------- ⭐ FIX LIGNE 98 -------------------- */
      // ❌ AVANT (bug) : const domaine = await domaineService.create(req.body);
      // ✅ APRÈS : utilise domaineRepo() qui est correctement défini
      const domaine = domaineRepo().create({
        nom: nom.trim(),
        slug,
        description: description ?? null,
        couleur: couleur ?? null,
        icone: icone ?? null,
        ordreAffichage: ordreAffichage ?? 0,
        actif: true,
        estPubliee: true,
      });

      await domaineRepo().save(domaine);

      return successResponse(res, domaine, 'Domaine créé', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Mettre à jour
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

      /* -------------------- Champs modifiables -------------------- */
      const { nom, description, couleur, icone, ordreAffichage } = req.body;

      if (nom !== undefined) {
        // Vérifier unicité du nouveau nom
        const existing = await domaineRepo().findOne({
          where: { nom },
        });
        if (existing && existing.id !== domaine.id) {
          throw new BadRequestError('Un domaine avec ce nom existe déjà');
        }

        domaine.nom = nom.trim();
        // Régénérer le slug si le nom change
        if (req.body.slug === undefined) {
          domaine.slug = slugify(nom);
        }
      }

      if (description !== undefined) domaine.description = description;
      if (couleur !== undefined) domaine.couleur = couleur;
      if (icone !== undefined) domaine.icone = icone;
      if (ordreAffichage !== undefined) domaine.ordreAffichage = ordreAffichage;
      if (req.body.slug !== undefined) domaine.slug = req.body.slug;

      await domaineRepo().save(domaine);

      return successResponse(res, domaine, 'Domaine mis à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Publier / Dépublier
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
          : !domaine.estPubliee; // toggle

      domaine.estPubliee = estPubliee;
      await domaineRepo().save(domaine);

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

      domaine.actif = !domaine.actif;
      await domaineRepo().save(domaine);

      return successResponse(
        res,
        domaine,
        domaine.actif ? 'Domaine activé' : 'Domaine désactivé',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Upload image
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

      /* -------------------- URL du fichier -------------------- */
      const filename =
        (req.file as any).filename ?? req.file.originalname ?? 'image';
      const imageUrl = `/uploads/domaines/${Date.now()}-${filename}`;

      domaine.imageUrl = imageUrl;
      await domaineRepo().save(domaine);

      return successResponse(
        res,
        domaine,
        'Image mise à jour',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Supprimer
     ========================================================================== */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const domaine = await domaineRepo().findOne({
        where: { id: req.params.id },
        relations: ['formations'],
      });

      if (!domaine) {
        throw new NotFoundError('Domaine introuvable');
      }

      /* -------------------- Vérifier formations liées -------------------- */
      if (domaine.formations && domaine.formations.length > 0) {
        throw new BadRequestError(
          `Impossible de supprimer ce domaine : ${domaine.formations.length} formation(s) y sont rattachées`,
        );
      }

      await domaineRepo().softRemove(domaine);

      return successResponse(res, null, 'Domaine supprimé');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Statistiques par domaine
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
        ...s,
        nbFormations: Number(s.nbFormations),
      }));

      return successResponse(res, formatted);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔒 ADMIN — Réorganiser l'ordre d'affichage
     ========================================================================== */
  static async reorder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { orderedIds }: { orderedIds: string[] } = req.body;

      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        throw new BadRequestError('orderedIds requis (tableau)');
      }

      await Promise.all(
        orderedIds.map((id, index) =>
          domaineRepo().update(id, { ordreAffichage: index }),
        ),
      );

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