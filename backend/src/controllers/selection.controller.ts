// src/controllers/selection.controller.ts
import { Request, Response, NextFunction } from 'express';
import { In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Inscription } from '../entities/Inscription.entity';
import { Session } from '../entities/Session.entity';
import {
  StatutInscription,
  TypeNotification,
  RoleName,
} from '../entities/enums';
import { successResponse } from '../utils/response.util';
import { getPagination } from '../utils/pagination.util';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from '../errors/AppError';
import { NotificationService } from '../services/notification.service';
import { logger } from '../config/logger';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const inscriptionRepo = () => AppDataSource.getRepository(Inscription);
const sessionRepo = () => AppDataSource.getRepository(Session);

function getUserId(req: Request): string {
  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) throw new BadRequestError('Utilisateur non authentifié');
  return userId;
}

function getUserRole(req: Request): RoleName {
  const role = (req as any).userRole ?? (req as any).user?.role?.nom;
  if (!role) throw new ForbiddenError('Rôle utilisateur introuvable');
  return role;
}

function validateUuid(value: string, field: string): void {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new BadRequestError(`${field} doit être un UUID valide`);
  }
}

function canManageSession(
  session: { formateurId?: string | null },
  userId: string,
  userRole: RoleName,
): boolean {
  return (
    userRole === RoleName.ADMINISTRATEUR ||
    userRole === RoleName.STAFF_ODC ||
    (userRole === RoleName.FORMATEUR && session.formateurId === userId)
  );
}

/**
 * ⭐ Récupère la capacité avec fallback multiple
 */
function getCapacite(session: Session): number {
  const s = session as any;
  const cap =
    s.placesMax ?? s.capacite ?? s.places_max ?? 0;
  return Math.max(0, Number(cap) || 0);
}

/**
 * ⭐ Récupère les places disponibles (avec fallback illimité si 0)
 */
async function getPlacesDisponibles(session: Session): Promise<number> {
  const capacite = getCapacite(session);

  const acceptedCount = await inscriptionRepo().count({
    where: {
      sessionId: session.id,
      statut: StatutInscription.ACCEPTEE,
    },
  });

  /* ⭐ Si capacité = 0 → illimité (permet quand même d'accepter) */
  if (capacite <= 0) {
    logger.warn('[Selection] Session sans capacité → illimité', {
      sessionId: session.id,
      codeSession: session.codeSession,
      placesMax: (session as any).placesMax,
      capacite: (session as any).capacite,
    });
    return 999;
  }

  return Math.max(0, capacite - acceptedCount);
}

function validateStatutSelection(
  statut: unknown,
): asserts statut is StatutInscription {
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

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROLLER
   ═══════════════════════════════════════════════════════════════════════════ */

export class SelectionController {
  /* ══════════════════════════════════════════════════════════════════════════
     📋 LISTER LES CANDIDATS
     ══════════════════════════════════════════════════════════════════════════ */
  static async findCandidats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      validateUuid(sessionId, 'sessionId');

      const userId = getUserId(req);
      const userRole = getUserRole(req);

      /* 1. Session */
      const session = await sessionRepo().findOne({
        where: { id: sessionId },
        relations: ['formation'],
      });

      if (!session) {
        throw new NotFoundError('Session introuvable');
      }

      /* 2. Vérifier droits */
      if (
        !canManageSession(
          { formateurId: session.formateurId },
          userId,
          userRole,
        )
      ) {
        throw new ForbiddenError(
          'Vous ne pouvez pas consulter les candidats de cette session',
        );
      }

      /* 3. QueryBuilder */
      const qb = inscriptionRepo()
        .createQueryBuilder('i')
        .leftJoinAndSelect('i.participant', 'p')
        .where('i.sessionId = :sid', { sid: sessionId });

      const statutFilter = req.query.statut as string | undefined;
      if (
        statutFilter &&
        ['EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'LISTE_ATTENTE'].includes(
          statutFilter,
        )
      ) {
        qb.andWhere('i.statut = :st', { st: statutFilter });
      }

      const limit = Math.min(Number(req.query.limit) || 200, 500);
      const offset = Math.max(Number(req.query.offset) || 0, 0);

      qb.orderBy('i.createdAt', 'ASC').skip(offset).take(limit);

      const [inscriptions, total] = await qb.getManyAndCount();

      /* ⭐ Transformer en candidats (format attendu par le front) */
      const candidats = inscriptions
        .filter((i) => i.participant)
        .map((i) => ({
          id: i.id,
          inscriptionId: i.id,
          statut: i.statut,
          dateInscription: i.createdAt,
          participantId: i.participant?.id,
          prenom: i.participant?.prenom ?? '',
          nom: i.participant?.nom ?? '',
          email: i.participant?.email ?? '',
          telephone: i.participant?.telephone ?? null,
          photoUrl: i.participant?.photoUrl ?? null,
          motivation: i.motivation ?? null,
          /* ⭐ Aussi en objet imbriqué pour compatibilité */
          participant: {
            id: i.participant?.id,
            prenom: i.participant?.prenom ?? '',
            nom: i.participant?.nom ?? '',
            email: i.participant?.email ?? '',
            telephone: i.participant?.telephone ?? null,
          },
        }));

      /* ⭐ Stats */
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

      const capacite = getCapacite(session);
      const placesRestantes =
        capacite > 0 ? Math.max(0, capacite - acceptees) : 999;

      logger.info('[SELECTION] Candidats récupérés', {
        sessionId,
        codeSession: session.codeSession,
        total,
        enAttente,
        acceptees,
        refusees,
        capacite,
        placesRestantes,
        userId,
        userRole,
      });

      successResponse(
        res,
        {
          sessionId,
          codeSession: session.codeSession,
          session: {
            id: session.id,
            codeSession: session.codeSession,
            placesMax: capacite,
            capacite,
            placesRestantes,
            formation: session.formation
              ? {
                  id: session.formation.id,
                  titre: session.formation.titre,
                }
              : null,
          },
          candidats,
          stats: {
            total,
            enAttente,
            acceptes: acceptees,
            acceptees,
            refuses: refusees,
            refusees,
            listeAttente,
            capacite,
            placesRestantes,
            tauxRemplissage:
              capacite > 0
                ? Math.round((acceptees / capacite) * 100)
                : 0,
          },
          pagination: {
            limit,
            offset,
            count: candidats.length,
            total,
          },
        },
        'Candidats de la session',
      );
    } catch (e) {
      logger.error('[SELECTION] findCandidats failed', {
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack?.split('\n').slice(0, 3) : undefined,
      });
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ✅ ACCEPTER UN CANDIDAT (individuel)
     ══════════════════════════════════════════════════════════════════════════ */
  static async accepter(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { inscriptionId } = req.params;
      validateUuid(inscriptionId, 'inscriptionId');

      const userId = getUserId(req);
      const userRole = getUserRole(req);

      const inscription = await inscriptionRepo().findOne({
        where: { id: inscriptionId },
        relations: ['participant', 'session', 'session.formation'],
      });

      if (!inscription) {
        throw new NotFoundError('Inscription introuvable');
      }

      if (
        !canManageSession(
          { formateurId: inscription.session?.formateurId },
          userId,
          userRole,
        )
      ) {
        throw new ForbiddenError(
          'Vous ne pouvez pas accepter cette inscription',
        );
      }

      if (inscription.statut === StatutInscription.ACCEPTEE) {
        successResponse(
          res,
          { inscriptionId, statut: 'ACCEPTEE' },
          'Déjà acceptée',
        );
        return;
      }

      if (inscription.session) {
        const placesDisponibles = await getPlacesDisponibles(
          inscription.session,
        );
        if (placesDisponibles <= 0) {
          throw new ConflictError('Aucune place disponible');
        }
      }

      inscription.statut = StatutInscription.ACCEPTEE;
      inscription.motifRefus = null;
      await inscriptionRepo().save(inscription);

      try {
        const formationTitre =
          inscription.session?.formation?.titre ?? 'la formation';
        await NotificationService.create({
          userId: inscription.participantId,
          titre: '🎉 Inscription acceptée',
          message: `Vous êtes accepté(e) pour « ${formationTitre} »`,
          type: TypeNotification.SUCCESS,
          metadata: {
            sessionId: inscription.sessionId,
            inscriptionId: inscription.id,
          },
        });
      } catch (notifError) {
        logger.warn(
          `[Selection] Notification échouée pour ${inscription.id}:`,
          notifError,
        );
      }

      logger.info(
        `✅ Candidat accepté : inscription=${inscriptionId} session=${inscription.session?.codeSession} par=${userId}`,
      );

      successResponse(
        res,
        { inscriptionId, statut: 'ACCEPTEE' },
        'Candidat accepté',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ❌ REFUSER UN CANDIDAT (individuel)
     ══════════════════════════════════════════════════════════════════════════ */
  static async refuser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { inscriptionId } = req.params;
      validateUuid(inscriptionId, 'inscriptionId');

      const userId = getUserId(req);
      const userRole = getUserRole(req);
      const motifRefus =
        (req.body?.motif as string | undefined) ??
        (req.body?.motifRefus as string | undefined);

      const inscription = await inscriptionRepo().findOne({
        where: { id: inscriptionId },
        relations: ['participant', 'session', 'session.formation'],
      });

      if (!inscription) {
        throw new NotFoundError('Inscription introuvable');
      }

      if (
        !canManageSession(
          { formateurId: inscription.session?.formateurId },
          userId,
          userRole,
        )
      ) {
        throw new ForbiddenError(
          'Vous ne pouvez pas refuser cette inscription',
        );
      }

      if (inscription.statut === StatutInscription.REFUSEE) {
        successResponse(
          res,
          { inscriptionId, statut: 'REFUSEE' },
          'Déjà refusée',
        );
        return;
      }

      inscription.statut = StatutInscription.REFUSEE;
      if (motifRefus) inscription.motifRefus = motifRefus;
      await inscriptionRepo().save(inscription);

      try {
        const formationTitre =
          inscription.session?.formation?.titre ?? 'la formation';
        await NotificationService.create({
          userId: inscription.participantId,
          titre: '❌ Inscription refusée',
          message: `Votre inscription à « ${formationTitre} » a été refusée.${
            motifRefus ? ` Motif : ${motifRefus}` : ''
          }`,
          type: TypeNotification.ERROR,
          metadata: {
            sessionId: inscription.sessionId,
            inscriptionId: inscription.id,
          },
        });
      } catch (notifError) {
        logger.warn(
          `[Selection] Notification échouée pour ${inscription.id}:`,
          notifError,
        );
      }

      logger.info(
        `❌ Candidat refusé : inscription=${inscriptionId} session=${inscription.session?.codeSession} par=${userId}`,
      );

      successResponse(
        res,
        { inscriptionId, statut: 'REFUSEE' },
        'Candidat refusé',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     📋 SÉLECTION EN MASSE
     ══════════════════════════════════════════════════════════════════════════ */
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

      if (!Array.isArray(inscriptionIds) || inscriptionIds.length === 0) {
        throw new BadRequestError('Aucun candidat sélectionné');
      }

      validateStatutSelection(statut);

      const session = await sessionRepo().findOne({
        where: { id: sessionId },
        relations: ['formation'],
      });

      if (!session) {
        throw new NotFoundError('Session introuvable');
      }

      const userId = getUserId(req);
      const userRole = getUserRole(req);

      if (
        !canManageSession(
          { formateurId: session.formateurId },
          userId,
          userRole,
        )
      ) {
        throw new ForbiddenError(
          'Vous ne pouvez pas gérer les candidats de cette session',
        );
      }

      const inscriptions = await inscriptionRepo().find({
        where: { id: In(inscriptionIds), sessionId },
        relations: ['participant', 'session', 'session.formation'],
      });

      if (inscriptions.length !== inscriptionIds.length) {
        throw new NotFoundError(
          `Certaines inscriptions sont introuvables (${inscriptions.length}/${inscriptionIds.length})`,
        );
      }

      /* ⭐ Vérification capacité relâchée */
      if (statut === StatutInscription.ACCEPTEE) {
        const placesDisponibles = await getPlacesDisponibles(session);

        logger.info('[Selection] Vérification capacité', {
          sessionId,
          placesDisponibles,
          demandees: inscriptions.length,
          placesMax: (session as any).placesMax,
          capacite: (session as any).capacite,
        });

        /* ⭐ Rejeter SEULEMENT si placesDisponibles < demandées ET capacité > 0 */
        if (
          placesDisponibles < inscriptions.length &&
          placesDisponibles !== 999
        ) {
          throw new ConflictError(
            `Places insuffisantes. Disponibles : ${placesDisponibles}, Demandées : ${inscriptions.length}`,
          );
        }
      }

      const updated: any[] = [];

      for (const inscription of inscriptions) {
        inscription.statut = statut;

        if (statut === StatutInscription.REFUSEE && motifRefus) {
          inscription.motifRefus = motifRefus;
        } else if (statut !== StatutInscription.REFUSEE) {
          inscription.motifRefus = null;
        }

        await inscriptionRepo().save(inscription);

        try {
          const formationTitre =
            session.formation?.titre ?? 'la formation';

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

      successResponse(
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

  /* ══════════════════════════════════════════════════════════════════════════
     🤖 SÉLECTION AUTOMATIQUE
     ══════════════════════════════════════════════════════════════════════════ */
  static async selectionAutomatique(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      const session = await sessionRepo().findOne({
        where: { id: sessionId },
        relations: ['formation'],
      });

      if (!session) {
        throw new NotFoundError('Session introuvable');
      }

      const userId = getUserId(req);
      const userRole = getUserRole(req);

      if (
        !canManageSession(
          { formateurId: session.formateurId },
          userId,
          userRole,
        )
      ) {
        throw new ForbiddenError(
          'Vous ne pouvez pas gérer les candidats de cette session',
        );
      }

      const candidats = await inscriptionRepo().find({
        where: {
          sessionId,
          statut: StatutInscription.EN_ATTENTE,
        },
        relations: ['participant', 'session', 'session.formation'],
        order: { createdAt: 'ASC' },
      });

      const placesDisponibles = await getPlacesDisponibles(session);

      if (placesDisponibles === 0) {
        successResponse(
          res,
          { acceptes: 0, refuses: 0, enAttente: candidats.length },
          'Aucune place disponible',
        );
        return;
      }

      /* ⭐ Si illimité, accepter tout */
      const aAccepter =
        placesDisponibles === 999
          ? candidats
          : candidats.slice(0, placesDisponibles);

      const aRefuser =
        placesDisponibles === 999
          ? []
          : candidats.slice(placesDisponibles);

      const formationTitre = session.formation?.titre ?? 'la formation';

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

      successResponse(
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

  /* ══════════════════════════════════════════════════════════════════════════
     📊 STATISTIQUES
     ══════════════════════════════════════════════════════════════════════════ */
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

      const capacite = getCapacite(session);
      const placesRestantes =
        capacite > 0 ? Math.max(0, capacite - acceptees) : 999;
      const tauxRemplissage =
        capacite > 0 ? Math.round((acceptees / capacite) * 100) : 0;

      successResponse(res, {
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

  /* ══════════════════════════════════════════════════════════════════════════
     🔄 RESET
     ══════════════════════════════════════════════════════════════════════════ */
  static async reset(
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

      const result = await inscriptionRepo()
        .createQueryBuilder()
        .update(Inscription)
        .set({
          statut: StatutInscription.EN_ATTENTE,
          motifRefus: null,
        })
        .where('sessionId = :sid', { sid: sessionId })
        .andWhere('statut IN (:...statuts)', {
          statuts: [
            StatutInscription.ACCEPTEE,
            StatutInscription.REFUSEE,
            StatutInscription.LISTE_ATTENTE,
          ],
        })
        .execute();

      logger.info(`🔄 Reset sélections session ${sessionId}`);

      successResponse(
        res,
        { reset: result.affected ?? 0 },
        'Sélections réinitialisées',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     📋 SÉLECTIONNER UN SEUL
     ══════════════════════════════════════════════════════════════════════════ */
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

      if (statut === StatutInscription.ACCEPTEE) {
        const session = inscription.session;
        const placesDisponibles = await getPlacesDisponibles(session);

        if (placesDisponibles <= 0) {
          throw new ConflictError('Aucune place disponible');
        }
      }

      inscription.statut = statut;
      if (statut === StatutInscription.REFUSEE && motifRefus) {
        inscription.motifRefus = motifRefus;
      } else {
        inscription.motifRefus = null;
      }

      await inscriptionRepo().save(inscription);

      successResponse(res, inscription, 'Candidat mis à jour');
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     📋 ALIAS
     ══════════════════════════════════════════════════════════════════════════ */
  static async candidatsParSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    return SelectionController.findCandidats(req, res, next);
  }
}