// src/controllers/ReseautageController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { Connection } from '../entities/Connection.entity';
import { StatutConnection, TypeNotification } from '../entities/enums';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from '../errors/AppError';
import { notificationService } from '../services/notification.service';
import { logger } from '../config/logger';

export class ReseautageController {
  // ==========================================================================
  // 📇 ANNUAIRE
  // ==========================================================================
  /** GET /api/reseau/annuaire */
  static async annuaire(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination(
        typeof req.query.page === 'string' ? req.query.page : undefined,
        typeof req.query.limit === 'string' ? req.query.limit : undefined
      );

      const qb = AppDataSource.getRepository(User)
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.role', 'r')
        .where('u.id != :uid', { uid: req.userId! })
        .andWhere('u.actif = true')
        .andWhere('u.profil_public = true');

      if (req.query.q) {
        qb.andWhere(
          '(u.nom ILIKE :q OR u.prenom ILIKE :q OR u.entreprise ILIKE :q OR u.competences::text ILIKE :q)',
          { q: `%${req.query.q}%` }
        );
      }
      if (req.query.roleId) {
        qb.andWhere('u.role_id = :rid', { rid: req.query.roleId });
      }
      if (req.query.role) {
        qb.andWhere('r.nom = :role', { role: req.query.role });
      }
      if (typeof req.query.ville === 'string' && req.query.ville.trim()) {
        qb.andWhere('u.ville ILIKE :ville', {
          ville: `%${req.query.ville.trim()}%`,
        });
      }
      if (typeof req.query.competence === 'string' && req.query.competence.trim()) {
        qb.andWhere('u.competences::text ILIKE :competence', {
          competence: `%${req.query.competence.trim()}%`,
        });
      }

      qb.orderBy('u.createdAt', 'DESC').skip(skip).take(limit);

      const [data, total] = await qb.getManyAndCount();
      return paginatedResponse(res, data, total, page, limit, 'Annuaire');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // 📨 DEMANDES DE CONNEXION
  // ==========================================================================
  /** POST /api/reseau/demandes/:destinataireId */
  static async envoyerDemande(req: Request, res: Response, next: NextFunction) {
    try {
      const { destinataireId } = req.params;
      const { message } = req.body;

      if (destinataireId === req.userId) {
        throw new BadRequestError("Impossible de s'ajouter soi-même");
      }

      const destinataire = await AppDataSource.getRepository(User).findOne({
        where: { id: destinataireId },
      });
      if (!destinataire || !destinataire.actif) {
        throw new NotFoundError('Destinataire introuvable');
      }

      const repo = AppDataSource.getRepository(Connection);
      const existing = await repo.findOne({
        where: [
          { expediteurId: req.userId!, destinataireId },
          { expediteurId: destinataireId, destinataireId: req.userId! },
        ],
      });
      if (existing) {
        if (existing.statut === StatutConnection.REFUSEE) {
          throw new ConflictError('Cette demande a déjà été refusée');
        }
        if (existing.statut === StatutConnection.ACCEPTEE) {
          throw new ConflictError('Vous êtes déjà connectés');
        }
        throw new ConflictError('Demande déjà en attente');
      }

      const conn = repo.create({
        expediteurId: req.userId!,
        destinataireId,
        message,
        statut: StatutConnection.EN_ATTENTE,
      });
      await repo.save(conn);

      await notificationService.create({
        userId: destinataireId,
        titre: '👥 Nouvelle demande de connexion',
        message: 'Vous avez reçu une nouvelle demande de connexion',
        type: TypeNotification.INFO,
        metadata: { connectionId: conn.id, expediteurId: req.userId },
      });

      logger.info(`👥 Demande : ${req.userId} → ${destinataireId}`);
      return successResponse(res, conn, 'Demande envoyée', 201);
    } catch (e) {
      next(e);
    }
  }

  /** PUT /api/reseau/demandes/:id — Répondre (accepter/refuser) */
  static async repondre(req: Request, res: Response, next: NextFunction) {
    try {
      const { statut } = req.body as { statut: StatutConnection };
      if (![StatutConnection.ACCEPTEE, StatutConnection.REFUSEE].includes(statut)) {
        throw new BadRequestError('Statut invalide : ACCEPTEE ou REFUSEE');
      }

      const repo = AppDataSource.getRepository(Connection);
      const conn = await repo.findOne({ where: { id: req.params.id } });
      if (!conn) throw new NotFoundError('Demande introuvable');
      if (conn.destinataireId !== req.userId) throw new ForbiddenError('Accès refusé');
      if (conn.statut !== StatutConnection.EN_ATTENTE) {
        throw new ConflictError('Demande déjà traitée');
      }

      conn.statut = statut;
      conn.dateReponse = new Date();
      await repo.save(conn);

      await notificationService.create({
        userId: conn.expediteurId,
        titre:
          statut === StatutConnection.ACCEPTEE ? '✅ Connexion acceptée' : '❌ Connexion refusée',
        message:
          statut === StatutConnection.ACCEPTEE
            ? 'Votre demande de connexion a été acceptée'
            : 'Votre demande de connexion a été refusée',
        type:
          statut === StatutConnection.ACCEPTEE
            ? TypeNotification.SUCCESS
            : TypeNotification.WARNING,
      });

      return successResponse(res, conn, 'Réponse enregistrée');
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/reseau/demandes/en-attente — Reçues */
  static async demandesEnAttente(req: Request, res: Response, next: NextFunction) {
    try {
      const demandes = await AppDataSource.getRepository(Connection).find({
        where: { destinataireId: req.userId!, statut: StatutConnection.EN_ATTENTE },
        relations: ['expediteur', 'expediteur.role'],
        order: { createdAt: 'DESC' },
      });
      return successResponse(res, demandes, 'Demandes en attente');
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/reseau/demandes/envoyees — Envoyées */
  static async demandesEnvoyees(req: Request, res: Response, next: NextFunction) {
    try {
      const demandes = await AppDataSource.getRepository(Connection).find({
        where: { expediteurId: req.userId!, statut: StatutConnection.EN_ATTENTE },
        relations: ['destinataire', 'destinataire.role'],
        order: { createdAt: 'DESC' },
      });
      return successResponse(res, demandes, 'Demandes envoyées');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // 🤝 CONNEXIONS
  // ==========================================================================
  /** GET /api/reseau/connections */
  static async mesConnections(req: Request, res: Response, next: NextFunction) {
    try {
      const connections = await AppDataSource.getRepository(Connection).find({
        where: [
          { expediteurId: req.userId!, statut: StatutConnection.ACCEPTEE },
          { destinataireId: req.userId!, statut: StatutConnection.ACCEPTEE },
        ],
        relations: ['expediteur', 'expediteur.role', 'destinataire', 'destinataire.role'],
      });

      const contacts = connections.map((c) => ({
        connectionId: c.id,
        since: c.dateReponse ?? c.updatedAt,
        user: c.expediteurId === req.userId ? c.destinataire : c.expediteur,
      }));

      return successResponse(res, contacts, 'Mes connexions');
    } catch (e) {
      next(e);
    }
  }

  /** DELETE /api/reseau/connections/:id */
  static async supprimerConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Connection);
      const conn = await repo.findOne({ where: { id } });
      if (!conn) throw new NotFoundError('Connexion introuvable');

      if (conn.expediteurId !== req.userId && conn.destinataireId !== req.userId) {
        throw new ForbiddenError('Accès refusé');
      }

      await repo.softDelete(id);

      const otherId = conn.expediteurId === req.userId ? conn.destinataireId : conn.expediteurId;

      await notificationService.create({
        userId: otherId,
        titre: '🔌 Connexion retirée',
        message: 'Une de vos connexions a été retirée',
        type: TypeNotification.INFO,
      });

      logger.info(`🗑️ Connexion supprimée : ${id}`);
      return successResponse(res, null, 'Connexion supprimée');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // 💡 SUGGESTIONS
  // ==========================================================================
  /** GET /api/reseau/suggestions */
  static async suggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(50, Number(req.query.limit) || 10);
      const connRepo = AppDataSource.getRepository(Connection);

      const existing = await connRepo.find({
        where: [{ expediteurId: req.userId! }, { destinataireId: req.userId! }],
      });

      const excludedIds = new Set<string>([req.userId!]);
      for (const c of existing) {
        excludedIds.add(c.expediteurId === req.userId ? c.destinataireId : c.expediteurId);
      }

      const users = await AppDataSource.getRepository(User)
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.role', 'r')
        .where('u.actif = true')
        .andWhere('u.profil_public = true')
        .andWhere('u.id NOT IN (:...ids)', { ids: [...excludedIds] })
        .orderBy('RANDOM()')
        .limit(limit)
        .getMany();

      return successResponse(res, users, 'Suggestions de connexion');
    } catch (e) {
      next(e);
    }
  }

  // ==========================================================================
  // 📊 STATS
  // ==========================================================================
  /** GET /api/reseau/stats */
  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Connection);

      const [connections, envoyees, recues] = await Promise.all([
        repo.count({
          where: [
            { expediteurId: req.userId!, statut: StatutConnection.ACCEPTEE },
            { destinataireId: req.userId!, statut: StatutConnection.ACCEPTEE },
          ],
        }),
        repo.count({
          where: { expediteurId: req.userId!, statut: StatutConnection.EN_ATTENTE },
        }),
        repo.count({
          where: { destinataireId: req.userId!, statut: StatutConnection.EN_ATTENTE },
        }),
      ]);

      return successResponse(
        res,
        {
          connections,
          demandesEnvoyees: envoyees,
          demandesRecues: recues,
        },
        'Statistiques réseau'
      );
    } catch (e) {
      next(e);
    }
  }
  /** GET /api/reseau/profil/:id — Profil public d'un membre */
  static async getProfil(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUserId = req.userId!;

      // Debug (à retirer en prod)
      logger.info(`[getProfil] id=${id} currentUserId=${currentUserId}`);

      // 1. Charger l'utilisateur
      const user = await AppDataSource.getRepository(User).findOne({
        where: { id },
        relations: ['role'],
      });

      if (!user) {
        throw new NotFoundError('Utilisateur introuvable');
      }

      // 2. Vérifier que le compte est actif
      if (!user.actif) {
        throw new ForbiddenError('Ce compte est désactivé');
      }

      // 3. Vérifier la visibilité du profil
      // ✅ CORRECTION : rejeter uniquement si false explicite
      // (NULL = accessible par défaut)
      if ((user as any).profil_public === false) {
        throw new ForbiddenError("Ce profil n'est pas accessible");
      }

      // 4. Connexion avec le user courant
      const connRepo = AppDataSource.getRepository(Connection);
      let isConnected = false;
      let hasPendingRequest = false;

      if (currentUserId && currentUserId !== id) {
        const connection = await connRepo.findOne({
          where: [
            {
              expediteurId: currentUserId,
              destinataireId: id,
              statut: StatutConnection.ACCEPTEE,
            },
            {
              expediteurId: id,
              destinataireId: currentUserId,
              statut: StatutConnection.ACCEPTEE,
            },
          ],
        });
        isConnected = !!connection;

        if (!isConnected) {
          const pending = await connRepo.findOne({
            where: [
              {
                expediteurId: currentUserId,
                destinataireId: id,
                statut: StatutConnection.EN_ATTENTE,
              },
              {
                expediteurId: id,
                destinataireId: currentUserId,
                statut: StatutConnection.EN_ATTENTE,
              },
            ],
          });
          hasPendingRequest = !!pending;
        }
      }

      // 5. Nombre de connexions
      const connectionsCount = await connRepo.count({
        where: [
          { expediteurId: id, statut: StatutConnection.ACCEPTEE },
          { destinataireId: id, statut: StatutConnection.ACCEPTEE },
        ],
      });

      // 6. Compétences
      const competences: string[] = Array.isArray((user as any).competences)
        ? (user as any).competences
        : [];

      // 7. Réponse
      return successResponse(
        res,
        {
          id: user.id,
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          photoUrl: user.photoUrl,
          telephone: (user as any).telephone ?? null,
          ville: (user as any).ville ?? null,
          pays: (user as any).pays ?? null,
          entreprise: (user as any).entreprise ?? null,
          poste: (user as any).poste ?? null,
          bio: (user as any).bio ?? null,
          siteWeb: (user as any).siteWeb ?? null,
          linkedinUrl: (user as any).linkedinUrl ?? null,
          createdAt: user.createdAt,
          role: user.role
            ? {
                nom: user.role.nom,
                libelle: (user.role as any).libelle ?? user.role.nom,
              }
            : null,
          competences,
          isConnected,
          hasPendingRequest,
          stats: {
            connections: connectionsCount,
          },
        },
        'Profil récupéré'
      );
    } catch (e) {
      next(e);
    }
  }
}
