import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Inscription, StatutInscription } from '../entities/Inscription.entity';
import { Session, StatutSession } from '../entities/Session.entity';
import { User } from '../entities/User.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { NotificationService } from '../services/notification.service';
import { TypeNotification } from '../entities/Notification.entity';
import { logger } from '../config/logger';
import { In } from 'typeorm';

export class SelectionController {
  /**
   * GET /api/selections/session/:sessionId/candidats
   * Liste les candidats d'une session (staff ODC)
   */
  static async candidatsParSession(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sessionId } = req.params;
      const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

      // Vérifier la session
      const session = await AppDataSource.getRepository(Session).findOne({
        where: { id: sessionId },
        relations: ['formation'],
      });
      if (!session) throw new NotFoundError('Session introuvable');

      const qb = AppDataSource.getRepository(Inscription)
        .createQueryBuilder('i')
        .leftJoinAndSelect('i.participant', 'p')
        .leftJoinAndSelect('p.role', 'r')
        .where('i.session_id = :sid', { sid: sessionId });

      if (req.query.statut) {
        qb.andWhere('i.statut = :st', { st: req.query.statut });
      }

      qb.orderBy('i.date_inscription', 'ASC').skip(skip).take(limit);

      const [data, total] = await qb.getManyAndCount();

      // Statistiques de la session
      const stats = {
        total,
        enAttente: await AppDataSource.getRepository(Inscription).count({
          where: { sessionId, statut: StatutInscription.EN_ATTENTE },
        }),
        acceptees: await AppDataSource.getRepository(Inscription).count({
          where: { sessionId, statut: StatutInscription.ACCEPTEE },
        }),
        refusees: await AppDataSource.getRepository(Inscription).count({
          where: { sessionId, statut: StatutInscription.REFUSEE },
        }),
        capacite: session.capacite,
        placesRestantes: Math.max(
          0,
          session.capacite -
          (await AppDataSource.getRepository(Inscription).count({
            where: { sessionId, statut: StatutInscription.ACCEPTEE },
          }))
        ),
      };

      return res.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/selections/session/:sessionId/selectionner
   * Sélection en masse (accepter/refuser plusieurs candidats)
   */
  static async selectionnerEnMasse(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sessionId } = req.params;
      const {
        inscriptionIds,
        statut,
        motifRefus,
      }: {
        inscriptionIds: string[];
        statut: StatutInscription;
        motifRefus?: string;
      } = req.body;

      if (!Array.isArray(inscriptionIds) || inscriptionIds.length === 0) {
        throw new ConflictError('Aucun candidat sélectionné');
      }

      if (![StatutInscription.ACCEPTEE, StatutInscription.REFUSEE, StatutInscription.LISTE_ATTENTE].includes(statut)) {
        throw new ConflictError('Statut invalide');
      }

      // Vérifier la session
      const session = await AppDataSource.getRepository(Session).findOne({
        where: { id: sessionId },
        relations: ['formation'],
      });
      if (!session) throw new NotFoundError('Session introuvable');

      // Récupérer les inscriptions
      const repo = AppDataSource.getRepository(Inscription);
      const inscriptions = await repo.find({
        where: { id: In(inscriptionIds), sessionId },
        relations: ['participant', 'session', 'session.formation'],
      });

      if (inscriptions.length !== inscriptionIds.length) {
        throw new NotFoundError('Certaines inscriptions sont introuvables');
      }

      // Vérifier la capacité si on accepte
      if (statut === StatutInscription.ACCEPTEE) {
        const acceptedCount = await repo.count({
          where: { sessionId, statut: StatutInscription.ACCEPTEE },
        });
        const newTotal = acceptedCount + inscriptions.length;

        if (newTotal > session.capacite) {
          throw new ConflictError(
            `Capacité dépassée. Capacité: ${session.capacite}, Total demandé: ${newTotal}`
          );
        }
      }

      // Mettre à jour
      const updated: any[] = [];
      for (const inscription of inscriptions) {
        inscription.statut = statut;
        if (motifRefus) inscription.motifRefus = motifRefus;
        await repo.save(inscription);

        // Notification
        await NotificationService.create({
          userId: inscription.participantId,
          titre:
            statut === StatutInscription.ACCEPTEE
              ? '🎉 Inscription acceptée'
              : statut === StatutInscription.REFUSEE
                ? '❌ Inscription refusée'
                : '⏳ Liste d\'attente',
          message:
            statut === StatutInscription.ACCEPTEE
              ? `Vous êtes accepté pour « ${session.formation.titre} »`
              : statut === StatutInscription.REFUSEE
                ? `Votre inscription a été refusée. Motif: ${motifRefus || 'Non précisé'}`
                : `Vous êtes en liste d'attente pour « ${session.formation.titre} »`,
          type:
            statut === StatutInscription.ACCEPTEE
              ? TypeNotification.SUCCESS
              : statut === StatutInscription.REFUSEE
                ? TypeNotification.ERROR
                : TypeNotification.WARNING,
          metadata: { sessionId, inscriptionId: inscription.id },
        });

        updated.push({
          inscriptionId: inscription.id,
          participant: `${inscription.participant.prenom} ${inscription.participant.nom}`,
          email: inscription.participant.email,
          statut,
        });
      }

      logger.info(`✅ ${inscriptions.length} inscriptions → ${statut}`);

      return successResponse(
        res,
        {
          traites: inscriptions.length,
          statut,
          details: updated,
        },
        `${inscriptions.length} candidat(s) traité(s)`
      );
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/selections/auto/:sessionId
   * Sélection automatique selon critères (ordre d'inscription, motivation, etc.)
   */
  static async selectionAutomatique(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sessionId } = req.params;
      const { criteres } = req.body;

      const session = await AppDataSource.getRepository(Session).findOne({
        where: { id: sessionId },
        relations: ['formation'],
      });
      if (!session) throw new NotFoundError('Session introuvable');

      const repo = AppDataSource.getRepository(Inscription);

      // Candidats en attente, triés par date d'inscription
      const candidats = await repo.find({
        where: { sessionId, statut: StatutInscription.EN_ATTENTE },
        relations: ['participant', 'session', 'session.formation'],
        order: { dateInscription: 'ASC' },
      });

      // Places disponibles
      const acceptedCount = await repo.count({
        where: { sessionId, statut: StatutInscription.ACCEPTEE },
      });
      const placesDisponibles = Math.max(0, session.capacite - acceptedCount);

      if (placesDisponibles === 0) {
        return successResponse(
          res,
          { acceptes: 0, refuses: 0, enAttente: candidats.length },
          'Aucune place disponible'
        );
      }

      const aAccepter = candidats.slice(0, placesDisponibles);
      const aRefuser = candidats.slice(placesDisponibles);

      // Accepter les premiers
      for (const c of aAccepter) {
        c.statut = StatutInscription.ACCEPTEE;
        await repo.save(c);

        await NotificationService.create({
          userId: c.participantId,
          titre: '🎉 Inscription acceptée',
          message: `Vous êtes accepté pour « ${session.formation.titre} »`,
          type: TypeNotification.SUCCESS,
        });
      }

      // Refuser le reste
      for (const c of aRefuser) {
        c.statut = StatutInscription.REFUSEE;
        c.motifRefus = 'Capacité atteinte';
        await repo.save(c);

        await NotificationService.create({
          userId: c.participantId,
          titre: '❌ Inscription refusée',
          message: `Votre inscription à « ${session.formation.titre} » n'a pas été retenue (capacité atteinte)`,
          type: TypeNotification.WARNING,
        });
      }

      logger.info(
        `🤖 Sélection auto session ${sessionId} : ${aAccepter.length} acceptés, ${aRefuser.length} refusés`
      );

      return successResponse(
        res,
        {
          acceptes: aAccepter.length,
          refuses: aRefuser.length,
          placesDisponibles,
        },
        'Sélection automatique terminée'
      );
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/selections/stats/:sessionId
   * Statistiques de sélection d'une session
   */
  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;

      const session = await AppDataSource.getRepository(Session).findOne({
        where: { id: sessionId },
      });
      if (!session) throw new NotFoundError('Session introuvable');

      const repo = AppDataSource.getRepository(Inscription);

      const [total, enAttente, acceptees, refusees, listeAttente] =
        await Promise.all([
          repo.count({ where: { sessionId } }),
          repo.count({ where: { sessionId, statut: StatutInscription.EN_ATTENTE } }),
          repo.count({ where: { sessionId, statut: StatutInscription.ACCEPTEE } }),
          repo.count({ where: { sessionId, statut: StatutInscription.REFUSEE } }),
          repo.count({ where: { sessionId, statut: StatutInscription.LISTE_ATTENTE } }),
        ]);

      return successResponse(res, {
        total,
        enAttente,
        acceptees,
        refusees,
        listeAttente,
        capacite: session.capacite,
        placesRestantes: Math.max(0, session.capacite - acceptees),
        tauxRemplissage: Math.round((acceptees / session.capacite) * 100),
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * DELETE /api/selections/session/:sessionId/reset
   * Réinitialiser toutes les sélections
   */
  static async reset(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;

      const result = await AppDataSource.getRepository(Inscription)
        .createQueryBuilder()
        .update(Inscription)
        .set({ statut: StatutInscription.EN_ATTENTE, motifRefus: null })
        .where('session_id = :sid', { sid: sessionId })
        .andWhere('statut IN (:...statuts)', {
          statuts: [StatutInscription.ACCEPTEE, StatutInscription.REFUSEE],
        })
        .execute();

      logger.info(`🔄 Reset sélections session ${sessionId}`);

      return successResponse(
        res,
        { reset: result.affected || 0 },
        'Sélections réinitialisées'
      );
    } catch (e) {
      next(e);
    }
  }
}