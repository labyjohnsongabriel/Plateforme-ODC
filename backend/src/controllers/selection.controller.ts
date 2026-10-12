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
      if (req.query.statut) {
        qb.andWhere('i.statut = :st', { st: req.query.statut });
      }

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

      return res.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          total,
          enAttente,
          acceptees,
          refusees,
          listeAttente,
          capacite,
          placesRestantes,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     POST /api/selections/session/:sessionId/selectionner
     Sélection en masse
     ========================================================================== */
  static async selectionnerEnMasse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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
        where: { id: In(inscriptionIds), sessionId },
        relations: ['participant', 'session', 'session.formation'],
      });

      if (inscriptions.length !== inscriptionIds.length) {
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
          );
        }
      }

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
          statut,
        });
      }

      logger.info(
        `✅ ${inscriptions.length} inscription(s) → ${statut} (session ${sessionId})`,
      );

      return successResponse(
        res,
        {
          traites: inscriptions.length,
          statut,
          details: updated,
        },
        `${inscriptions.length} candidat(s) traité(s)`,
      );
    } catch (e) {
      next(e);
    }
  }

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

      if (placesDisponibles === 0) {
        return successResponse(
          res,
          { acceptes: 0, refuses: 0, enAttente: candidats.length },
          'Aucune place disponible',
        );
      }

      const aAccepter = candidats.slice(0, placesDisponibles);
      const aRefuser = candidats.slice(placesDisponibles);

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
      );

      return successResponse(
        res,
        {
          acceptes: aAccepter.length,
          refuses: aRefuser.length,
          placesDisponibles,
        },
        'Sélection automatique terminée',
      );
    } catch (e) {
      next(e);
    }
  }

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

      return successResponse(res, {
        total,
        enAttente,
        acceptees,
        refusees,
        listeAttente,
        capacite,
        placesRestantes,
        tauxRemplissage,
      });
    } catch (e) {
      next(e);
    }
  }

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
        })
        .execute();

      logger.info(`🔄 Reset sélections session ${sessionId}`);

      return successResponse(
        res,
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
      );
    } catch (e) {
      next(e);
    }
  }
}