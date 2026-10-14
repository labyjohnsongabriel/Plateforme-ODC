<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
import { Session, StatutSession } from '../models/Session.entity';
import { User } from '../models/User.entity';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { NotificationService } from '../services/notification.service';
import { TypeNotification } from '../models/Notification.entity';
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

=======
// src/controllers/SelectionController.ts
import { Request, Response, NextFunction } from 'express';
import { In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Inscription } from '../entities/Inscription.entity';
import { Session } from '../entities/Session.entity';
import { User } from '../entities/User.entity';
import {
  StatutInscription,
  TypeNotification,
} from '../entities/enums'; // ⭐ Importer depuis enums
import { successResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../errors/AppError';
import { NotificationService } from '../services/notification.service';
import { logger } from '../config/logger';

/* ============================================================================
   HELPERS
   ============================================================================ */

const inscriptionRepo = () => AppDataSource.getRepository(Inscription);
const sessionRepo = () => AppDataSource.getRepository(Session);

/**
 * Récupère le nombre de places disponibles d'une session.
 */
async function getPlacesDisponibles(session: Session): Promise<number> {
  const acceptedCount = await inscriptionRepo().count({
    where: {
      sessionId: session.id,
      statut: StatutInscription.ACCEPTEE,
    },
  });

  // ⭐ Utilise placesMax (propriété TS), pas capacite
  const capacite = session.placesMax ?? 0;
  return Math.max(0, capacite - acceptedCount);
}

/**
 * Valide que le statut est modifiable manuellement.
 */
function validateStatutSelection(statut: unknown): asserts statut is StatutInscription {
  const allowed = [
    StatutInscription.ACCEPTEE,
    StatutInscription.REFUSEE,
    StatutInscription.LISTE_ATTENTE,
  ];

  if (!statut || !allowed.includes(statut as StatutInscription)) {
    throw new BadRequestError(
      `Statut invalide. Valeurs autorisées : ${allowed.join(', ')}`,
    );
  }
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class SelectionController {
  /* ==========================================================================
     GET /api/selections/session/:sessionId/candidats
     Liste des candidats d'une session (staff ODC)
     ========================================================================== */
  static async candidatsParSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { page, limit, skip } = getPagination(
        req.query.page,
        req.query.limit,
      );

      /* -------------------- Vérifier la session -------------------- */
      const session = await sessionRepo().findOne({
        where: { id: sessionId },
        relations: ['formation'],
      });

      if (!session) {
        throw new NotFoundError('Session introuvable');
      }

      /* -------------------- QueryBuilder -------------------- */
      const qb = inscriptionRepo()
        .createQueryBuilder('i')
        .leftJoinAndSelect('i.participant', 'p')
        .leftJoinAndSelect('p.role', 'r')
        // ⭐ CORRECTION : i.sessionId (propriété TS), pas i.session_id (colonne DB)
        .where('i.sessionId = :sid', { sid: sessionId });

      /* -------------------- Filtre statut -------------------- */
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      if (req.query.statut) {
        qb.andWhere('i.statut = :st', { st: req.query.statut });
      }

<<<<<<< HEAD
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
=======
      /* -------------------- Tri + Pagination -------------------- */
      // ⭐ CORRECTION : i.createdAt (propriété TS), pas i.date_inscription
      qb.orderBy('i.createdAt', 'ASC').skip(skip).take(limit);

      const [data, total] = await qb.getManyAndCount();

      /* -------------------- Statistiques -------------------- */
      const [enAttente, acceptees, refusees, listeAttente] = await Promise.all([
        inscriptionRepo().count({
          where: { sessionId, statut: StatutInscription.EN_ATTENTE },
        }),
        inscriptionRepo().count({
          where: { sessionId, statut: StatutInscription.ACCEPTEE },
        }),
        inscriptionRepo().count({
          where: { sessionId, statut: StatutInscription.REFUSEE },
        }),
        inscriptionRepo().count({
          where: { sessionId, statut: StatutInscription.LISTE_ATTENTE },
        }),
      ]);

      // ⭐ Utilise placesMax
      const capacite = session.placesMax ?? 0;
      const placesRestantes = Math.max(0, capacite - acceptees);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

      return res.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
<<<<<<< HEAD
        stats,
=======
        stats: {
          total,
          enAttente,
          acceptees,
          refusees,
          listeAttente,
          capacite,
          placesRestantes,
        },
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      });
    } catch (e) {
      next(e);
    }
  }

<<<<<<< HEAD
  /**
   * POST /api/selections/session/:sessionId/selectionner
   * Sélection en masse (accepter/refuser plusieurs candidats)
   */
  static async selectionnerEnMasse(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
=======
  /* ==========================================================================
     POST /api/selections/session/:sessionId/selectionner
     Sélection en masse
     ========================================================================== */
  static async selectionnerEnMasse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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

<<<<<<< HEAD
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
=======
      /* -------------------- Validation -------------------- */
      if (!Array.isArray(inscriptionIds) || inscriptionIds.length === 0) {
        throw new BadRequestError('Aucun candidat sélectionné');
      }

      validateStatutSelection(statut);

      /* -------------------- Vérifier la session -------------------- */
      const session = await sessionRepo().findOne({
        where: { id: sessionId },
        relations: ['formation'],
      });

      if (!session) {
        throw new NotFoundError('Session introuvable');
      }

      /* -------------------- Récupérer les inscriptions -------------------- */
      const inscriptions = await inscriptionRepo().find({
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
        where: { id: In(inscriptionIds), sessionId },
        relations: ['participant', 'session', 'session.formation'],
      });

      if (inscriptions.length !== inscriptionIds.length) {
<<<<<<< HEAD
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
=======
        throw new NotFoundError(
          `Certaines inscriptions sont introuvables (${inscriptions.length}/${inscriptionIds.length} trouvées)`,
        );
      }

      /* -------------------- Vérifier la capacité si acceptation -------------------- */
      if (statut === StatutInscription.ACCEPTEE) {
        const placesDisponibles = await getPlacesDisponibles(session);

        if (inscriptions.length > placesDisponibles) {
          throw new ConflictError(
            `Places insuffisantes. Disponibles : ${placesDisponibles}, Demandées : ${inscriptions.length}`,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
          );
        }
      }

<<<<<<< HEAD
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
=======
      /* -------------------- Mise à jour + notifications -------------------- */
      const updated: any[] = [];

      for (const inscription of inscriptions) {
        inscription.statut = statut;

        if (statut === StatutInscription.REFUSEE && motifRefus) {
          inscription.motifRefus = motifRefus;
        } else if (statut !== StatutInscription.REFUSEE) {
          inscription.motifRefus = null;
        }

        await inscriptionRepo().save(inscription);

        /* -------------------- Notification -------------------- */
        try {
          const participant = inscription.participant;
          const formationTitre = session.formation?.titre ?? 'la formation';

          let titre = '';
          let message = '';
          let type = TypeNotification.INFO;

          switch (statut) {
            case StatutInscription.ACCEPTEE:
              titre = '🎉 Inscription acceptée';
              message = `Vous êtes accepté(e) pour « ${formationTitre} »`;
              type = TypeNotification.SUCCESS;
              break;

            case StatutInscription.REFUSEE:
              titre = '❌ Inscription refusée';
              message = `Votre inscription à « ${formationTitre} » a été refusée.${
                motifRefus ? ` Motif : ${motifRefus}` : ''
              }`;
              type = TypeNotification.ERROR;
              break;

            case StatutInscription.LISTE_ATTENTE:
              titre = '⏳ Liste d\'attente';
              message = `Vous êtes en liste d'attente pour « ${formationTitre} »`;
              type = TypeNotification.WARNING;
              break;
          }

          await NotificationService.create({
            userId: inscription.participantId,
            titre,
            message,
            type,
            metadata: { sessionId, inscriptionId: inscription.id },
          });
        } catch (notifError) {
          // ⚠️ Ne pas bloquer si la notif échoue
          logger.warn(
            `[Selection] Notification échouée pour ${inscription.id}:`,
            notifError,
          );
        }

        updated.push({
          inscriptionId: inscription.id,
          participant: `${inscription.participant?.prenom ?? ''} ${
            inscription.participant?.nom ?? ''
          }`.trim(),
          email: inscription.participant?.email ?? '',
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
          statut,
        });
      }

<<<<<<< HEAD
      logger.info(`✅ ${inscriptions.length} inscriptions → ${statut}`);
=======
      logger.info(
        `✅ ${inscriptions.length} inscription(s) → ${statut} (session ${sessionId})`,
      );
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

      return successResponse(
        res,
        {
          traites: inscriptions.length,
          statut,
          details: updated,
        },
<<<<<<< HEAD
        `${inscriptions.length} candidat(s) traité(s)`
=======
        `${inscriptions.length} candidat(s) traité(s)`,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      );
    } catch (e) {
      next(e);
    }
  }

<<<<<<< HEAD
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
=======
  /* ==========================================================================
     POST /api/selections/auto/:sessionId
     Sélection automatique selon critères
     ========================================================================== */
  static async selectionAutomatique(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      /* -------------------- Vérifier la session -------------------- */
      const session = await sessionRepo().findOne({
        where: { id: sessionId },
        relations: ['formation'],
      });

      if (!session) {
        throw new NotFoundError('Session introuvable');
      }

      /* -------------------- Candidats en attente -------------------- */
      const candidats = await inscriptionRepo().find({
        where: {
          sessionId,
          statut: StatutInscription.EN_ATTENTE,
        },
        relations: ['participant', 'session', 'session.formation'],
        order: { createdAt: 'ASC' }, // ⭐ Propriété TS
      });

      /* -------------------- Places disponibles -------------------- */
      const placesDisponibles = await getPlacesDisponibles(session);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

      if (placesDisponibles === 0) {
        return successResponse(
          res,
          { acceptes: 0, refuses: 0, enAttente: candidats.length },
<<<<<<< HEAD
          'Aucune place disponible'
=======
          'Aucune place disponible',
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
        );
      }

      const aAccepter = candidats.slice(0, placesDisponibles);
      const aRefuser = candidats.slice(placesDisponibles);

<<<<<<< HEAD
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
=======
      const formationTitre = session.formation?.titre ?? 'la formation';

      /* -------------------- Accepter les premiers -------------------- */
      for (const c of aAccepter) {
        c.statut = StatutInscription.ACCEPTEE;
        c.motifRefus = null;
        await inscriptionRepo().save(c);

        try {
          await NotificationService.create({
            userId: c.participantId,
            titre: '🎉 Inscription acceptée',
            message: `Vous êtes accepté(e) pour « ${formationTitre} »`,
            type: TypeNotification.SUCCESS,
            metadata: { sessionId, inscriptionId: c.id },
          });
        } catch (err) {
          logger.warn(`[Selection auto] Notif échouée pour ${c.id}:`, err);
        }
      }

      /* -------------------- Refuser le reste -------------------- */
      for (const c of aRefuser) {
        c.statut = StatutInscription.REFUSEE;
        c.motifRefus = 'Capacité atteinte';
        await inscriptionRepo().save(c);

        try {
          await NotificationService.create({
            userId: c.participantId,
            titre: '❌ Inscription refusée',
            message: `Votre inscription à « ${formationTitre} » n'a pas été retenue (capacité atteinte)`,
            type: TypeNotification.WARNING,
            metadata: { sessionId, inscriptionId: c.id },
          });
        } catch (err) {
          logger.warn(`[Selection auto] Notif échouée pour ${c.id}:`, err);
        }
      }

      logger.info(
        `🤖 Sélection auto session ${sessionId} : ${aAccepter.length} acceptés, ${aRefuser.length} refusés`,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      );

      return successResponse(
        res,
        {
          acceptes: aAccepter.length,
          refuses: aRefuser.length,
          placesDisponibles,
        },
<<<<<<< HEAD
        'Sélection automatique terminée'
=======
        'Sélection automatique terminée',
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      );
    } catch (e) {
      next(e);
    }
  }

<<<<<<< HEAD
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

=======
  /* ==========================================================================
     GET /api/selections/stats/:sessionId
     Statistiques de sélection
     ========================================================================== */
  static async stats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      const session = await sessionRepo().findOne({
        where: { id: sessionId },
      });

      if (!session) {
        throw new NotFoundError('Session introuvable');
      }

      /* -------------------- Compter par statut -------------------- */
      const [total, enAttente, acceptees, refusees, listeAttente] =
        await Promise.all([
          inscriptionRepo().count({ where: { sessionId } }),
          inscriptionRepo().count({
            where: { sessionId, statut: StatutInscription.EN_ATTENTE },
          }),
          inscriptionRepo().count({
            where: { sessionId, statut: StatutInscription.ACCEPTEE },
          }),
          inscriptionRepo().count({
            where: { sessionId, statut: StatutInscription.REFUSEE },
          }),
          inscriptionRepo().count({
            where: { sessionId, statut: StatutInscription.LISTE_ATTENTE },
          }),
        ]);

      // ⭐ Utilise placesMax
      const capacite = session.placesMax ?? 0;
      const placesRestantes = Math.max(0, capacite - acceptees);
      const tauxRemplissage =
        capacite > 0 ? Math.round((acceptees / capacite) * 100) : 0;

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      return successResponse(res, {
        total,
        enAttente,
        acceptees,
        refusees,
        listeAttente,
<<<<<<< HEAD
        capacite: session.capacite,
        placesRestantes: Math.max(0, session.capacite - acceptees),
        tauxRemplissage: Math.round((acceptees / session.capacite) * 100),
=======
        capacite,
        placesRestantes,
        tauxRemplissage,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      });
    } catch (e) {
      next(e);
    }
  }

<<<<<<< HEAD
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
=======
  /* ==========================================================================
     DELETE /api/selections/session/:sessionId/reset
     Réinitialiser toutes les sélections
     ========================================================================== */
  static async reset(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      // Vérifier la session
      const session = await sessionRepo().findOne({
        where: { id: sessionId },
      });
      if (!session) {
        throw new NotFoundError('Session introuvable');
      }

      // ⭐ Utilise la propriété TS sessionId (pas session_id)
      const result = await inscriptionRepo()
        .createQueryBuilder()
        .update(Inscription)
        .set({
          statut: StatutInscription.EN_ATTENTE,
          motifRefus: null,
        })
        .where('sessionId = :sid', { sid: sessionId }) // ⭐ sessionId
        .andWhere('statut IN (:...statuts)', {
          statuts: [
            StatutInscription.ACCEPTEE,
            StatutInscription.REFUSEE,
            StatutInscription.LISTE_ATTENTE,
          ],
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
        })
        .execute();

      logger.info(`🔄 Reset sélections session ${sessionId}`);

      return successResponse(
        res,
<<<<<<< HEAD
        { reset: result.affected || 0 },
        'Sélections réinitialisées'
=======
        { reset: result.affected ?? 0 },
        'Sélections réinitialisées',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     POST /api/selections/session/:sessionId/candidat/:inscriptionId
     Sélectionner un seul candidat (raccourci)
     ========================================================================== */
  static async selectionnerUn(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId, inscriptionId } = req.params;
      const { statut, motifRefus } = req.body;

      validateStatutSelection(statut);

      const inscription = await inscriptionRepo().findOne({
        where: { id: inscriptionId, sessionId },
        relations: ['participant', 'session', 'session.formation'],
      });

      if (!inscription) {
        throw new NotFoundError('Inscription introuvable');
      }

      /* -------------------- Vérifier capacité -------------------- */
      if (statut === StatutInscription.ACCEPTEE) {
        const session = inscription.session;
        const placesDisponibles = await getPlacesDisponibles(session);

        if (placesDisponibles <= 0) {
          throw new ConflictError('Aucune place disponible');
        }
      }

      /* -------------------- Mise à jour -------------------- */
      inscription.statut = statut;
      if (statut === StatutInscription.REFUSEE && motifRefus) {
        inscription.motifRefus = motifRefus;
      } else {
        inscription.motifRefus = null;
      }

      await inscriptionRepo().save(inscription);

      return successResponse(
        res,
        inscription,
        'Candidat mis à jour',
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      );
    } catch (e) {
      next(e);
    }
  }
}