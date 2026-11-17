// src/controllers/inscription.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { InscriptionService } from '../services/inscription.service';
import { RoleName, StatutInscription } from '../entities/enums';
import { successResponse } from '../utils/response.util';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/AppError';
import { logger } from '../config/logger';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const VALID_SELECTION_STATUTS = [
  StatutInscription.ACCEPTEE,
  StatutInscription.REFUSEE,
  StatutInscription.LISTE_ATTENTE,
];

const VALID_STATUTS = [
  'EN_ATTENTE',
  'ACCEPTEE',
  'REFUSEE',
  'LISTE_ATTENTE',
  'ANNULEE',
];

function getUserId(req: Request): string {
  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) throw new BadRequestError('Utilisateur non authentifié');
  return userId;
}

function getUserRole(req: Request): RoleName {
  const role = (req as any).user?.role?.nom ?? (req as any).userRole;
  if (!role) throw new BadRequestError('Rôle manquant');
  return role as RoleName;
}

function validateEmail(email: unknown): void {
  if (!email || typeof email !== 'string') {
    throw new BadRequestError('Email requis');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequestError('Email invalide');
  }
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

function validateStatutSelection(
  statut: unknown,
): asserts statut is StatutInscription {
  if (!statut || !VALID_SELECTION_STATUTS.includes(statut as StatutInscription)) {
    throw new BadRequestError(
      `Statut invalide. Valeurs acceptées : ${VALID_SELECTION_STATUTS.join(', ')}`,
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAPPING SQL → OBJET IMBRIQUÉ
   ═══════════════════════════════════════════════════════════════════════════ */

function mapInscriptionRow(r: any) {
  return {
    id: r.id,
    statut: r.statut,
    dateInscription: r.dateInscription,
    motifRefus: r.motifRefus ?? null,
    motivation: r.motivation ?? null,
    participantId: r.participantId,
    sessionId: r.sessionId,

    /* ⭐ Participant (imbriqué) */
    participant: r.participantId
      ? {
          id: r.participantId,
          prenom: r.prenom ?? null,
          nom: r.nom ?? null,
          email: r.email ?? null,
          telephone: r.telephone ?? null,
          photoUrl: r.photoUrl ?? null,
        }
      : null,

    /* ⭐ Session (imbriquée) */
    session: r.sessionId
      ? {
          id: r.sessionId,
          codeSession: r.codeSession ?? null,
          dateDebut: r.dateDebut ?? null,
          dateFin: r.dateFin ?? null,
          lieu: r.lieu ?? null,
          lienVisio: r.lienVisio ?? null,
          capacite: r.capacite ?? null,
          statut: r.sessionStatut ?? null,

          /* ⭐ Formation (doublement imbriquée) */
          formation: r.formationId
            ? {
                id: r.formationId,
                titre: r.formationTitre ?? null,
                slug: r.formationSlug ?? null,
                description: r.formationDescription ?? null,
              }
            : null,

          /* ⭐ Formateur */
          formateur: r.formateurId
            ? {
                id: r.formateurId,
                prenom: r.formateurPrenom ?? null,
                nom: r.formateurNom ?? null,
                email: r.formateurEmail ?? null,
              }
            : null,
        }
      : null,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROLLER
   ═══════════════════════════════════════════════════════════════════════════ */

export class InscriptionController {
  /* ══════════════════════════════════════════════════════════════════════════
     🌐 PUBLIC — Inscription sans compte
     POST /api/public/inscriptions
     ══════════════════════════════════════════════════════════════════════════ */
  static async createPublic(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sessionId, email, nom, prenom, motivation, telephone } = req.body;

      if (!sessionId) throw new BadRequestError('sessionId requis');
      validateEmail(email);
      if (!nom || typeof nom !== 'string') throw new BadRequestError('Nom requis');
      if (!prenom || typeof prenom !== 'string') {
        throw new BadRequestError('Prénom requis');
      }

      const result = await InscriptionService.createPublic({
        sessionId,
        email: email.toLowerCase().trim(),
        nom: nom.trim(),
        prenom: prenom.trim(),
        motivation,
        telephone,
      });

      successResponse(res, result, 'Inscription envoyée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     🔒 PARTICIPANT — Inscription authentifié
     POST /api/participant/inscriptions
     ══════════════════════════════════════════════════════════════════════════ */
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { sessionId, motivation } = req.body;

      if (!sessionId) throw new BadRequestError('sessionId requis');

      const result = await InscriptionService.create(userId, sessionId, motivation);

      successResponse(res, result, 'Inscription envoyée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     📋 STAFF/ADMIN — Lister toutes les inscriptions
     GET /api/staff/inscriptions?statut=EN_ATTENTE&limit=5
     ══════════════════════════════════════════════════════════════════════════ */
  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const userRole = getUserRole(req);

      const statut = req.query.statut as string | undefined;
      const sessionId = req.query.sessionId as string | undefined;
      const participantId = req.query.participantId as string | undefined;
      const search = (req.query.search as string | undefined)?.trim();

      const limit = Math.min(Number(req.query.limit) || 20, 200);
      const offset = Math.max(Number(req.query.offset) || 0, 0);

      const params: unknown[] = [];
      const conditions: string[] = ['i.deleted_at IS NULL'];

      /* Formateur : uniquement ses sessions */
      if (userRole === RoleName.FORMATEUR) {
        params.push(userId);
        conditions.push(`s.formateur_id = $${params.length}`);
      } else if (
        userRole !== RoleName.STAFF_ODC &&
        userRole !== RoleName.ADMINISTRATEUR
      ) {
        throw new ForbiddenError('Vous ne pouvez pas consulter les inscriptions');
      }

      if (statut && VALID_STATUTS.includes(statut)) {
        params.push(statut);
        conditions.push(`i.statut = $${params.length}`);
      }

      if (sessionId) {
        params.push(sessionId);
        conditions.push(`i.session_id = $${params.length}`);
      }

      if (participantId) {
        params.push(participantId);
        conditions.push(`i.participant_id = $${params.length}`);
      }

      if (search) {
        params.push(`%${search}%`);
        conditions.push(
          `(u.prenom ILIKE $${params.length} OR u.nom ILIKE $${params.length} OR u.email ILIKE $${params.length})`,
        );
      }

      const whereClause = conditions.join(' AND ');

      const countRows = await AppDataSource.query(
        `SELECT COUNT(*)::int AS total
         FROM inscriptions i
         JOIN users u ON u.id = i.participant_id
         JOIN sessions s ON s.id = i.session_id
         WHERE ${whereClause}`,
        params,
      );
      const total = countRows[0]?.total ?? 0;

      params.push(limit, offset);
      const rows = await AppDataSource.query(
        `SELECT
           i.id,
           i.statut,
           i.created_at AS "dateInscription",
           i.motif_refus AS "motifRefus",
           i.motivation,
           i.participant_id AS "participantId",
           i.session_id AS "sessionId",
           u.prenom,
           u.nom,
           u.email,
           u.telephone,
           u.photo_url AS "photoUrl",
           s.code_session AS "codeSession",
           s.date_debut AS "dateDebut",
           s.date_fin AS "dateFin",
           s.lieu,
           s.lien_visio AS "lienVisio",
           s.capacite,
           s.statut AS "sessionStatut",
           f.id AS "formationId",
           f.titre AS "formationTitre",
           f.slug AS "formationSlug",
           f.description AS "formationDescription",
           form.id AS "formateurId",
           form.prenom AS "formateurPrenom",
           form.nom AS "formateurNom",
           form.email AS "formateurEmail"
         FROM inscriptions i
         JOIN users u ON u.id = i.participant_id
         JOIN sessions s ON s.id = i.session_id
         LEFT JOIN formations f ON f.id = s.formation_id
         LEFT JOIN users form ON form.id = s.formateur_id
         WHERE ${whereClause}
         ORDER BY i.created_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      );

      const inscriptions = rows.map(mapInscriptionRow);

      const [stats] = await AppDataSource.query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE statut = 'EN_ATTENTE')::int AS "enAttente",
           COUNT(*) FILTER (WHERE statut = 'ACCEPTEE')::int AS acceptees,
           COUNT(*) FILTER (WHERE statut = 'REFUSEE')::int AS refusees,
           COUNT(*) FILTER (WHERE statut = 'LISTE_ATTENTE')::int AS "listeAttente",
           COUNT(*) FILTER (WHERE statut = 'ANNULEE')::int AS annulees
         FROM inscriptions
         WHERE deleted_at IS NULL`,
      );

      logger.info('[INSCRIPTION] findAll', {
        statut, sessionId, limit, offset, total, userId, userRole,
      });

      successResponse(
        res,
        {
          inscriptions,
          pagination: { total, limit, offset, count: inscriptions.length },
          stats,
        },
        'Inscriptions',
      );
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     📋 DÉTAIL D'UNE INSCRIPTION
     GET /api/staff/inscriptions/:id
     ══════════════════════════════════════════════════════════════════════════ */
  static async findOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      validateUuid(id, 'id');

      const userId = getUserId(req);
      const userRole = getUserRole(req);

      const rows = await AppDataSource.query(
        `SELECT
           i.id,
           i.statut,
           i.created_at AS "dateInscription",
           i.motif_refus AS "motifRefus",
           i.motivation,
           i.participant_id AS "participantId",
           i.session_id AS "sessionId",
           u.prenom,
           u.nom,
           u.email,
           u.telephone,
           u.photo_url AS "photoUrl",
           s.code_session AS "codeSession",
           s.date_debut AS "dateDebut",
           s.date_fin AS "dateFin",
           s.lieu,
           s.lien_visio AS "lienVisio",
           s.capacite,
           s.statut AS "sessionStatut",
           s.formateur_id AS "formateurId",
           f.id AS "formationId",
           f.titre AS "formationTitre",
           f.slug AS "formationSlug",
           f.description AS "formationDescription",
           form.prenom AS "formateurPrenom",
           form.nom AS "formateurNom",
           form.email AS "formateurEmail"
         FROM inscriptions i
         JOIN users u ON u.id = i.participant_id
         JOIN sessions s ON s.id = i.session_id
         LEFT JOIN formations f ON f.id = s.formation_id
         LEFT JOIN users form ON form.id = s.formateur_id
         WHERE i.id = $1`,
        [id],
      );

      const raw = rows[0];
      if (!raw) throw new NotFoundError('Inscription introuvable');

      const canManage =
        userRole === RoleName.ADMINISTRATEUR ||
        userRole === RoleName.STAFF_ODC ||
        (userRole === RoleName.FORMATEUR && raw.formateurId === userId) ||
        raw.participantId === userId;

      if (!canManage) {
        throw new ForbiddenError('Vous ne pouvez pas consulter cette inscription');
      }

      successResponse(res, mapInscriptionRow(raw), "Détail de l'inscription");
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     🔒 STAFF — Sélectionner (accepter/refuser)
     PATCH /api/staff/inscriptions/:id/selectionner
     ══════════════════════════════════════════════════════════════════════════ */
  static async selectionner(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { statut, motifRefus } = req.body;

      validateStatutSelection(statut);

      const result = await InscriptionService.selectionner(
        req.params.id,
        statut,
        motifRefus,
        userId,
      );

      successResponse(res, result, 'Sélection effectuée');
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     🔒 PARTICIPANT — Annuler son inscription
     DELETE /api/participant/inscriptions/:id
     ══════════════════════════════════════════════════════════════════════════ */
  static async annuler(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      await InscriptionService.annuler(req.params.id, userId);
      successResponse(res, null, 'Inscription annulée');
    } catch (e) {
      next(e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     🔒 PARTICIPANT — Mes inscriptions
     GET /api/participant/inscriptions
     ══════════════════════════════════════════════════════════════════════════ */
  static async mesInscriptions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const userRole = getUserRole(req);

      if (userRole !== RoleName.PARTICIPANT) {
        throw new ForbiddenError('Cette route est réservée aux participants');
      }

      const statut = req.query.statut as string | undefined;
      const limit = Math.min(Number(req.query.limit) || 100, 200);
      const offset = Math.max(Number(req.query.offset) || 0, 0);

      const params: unknown[] = [userId];
      const conditions: string[] = [
        'i.deleted_at IS NULL',
        'i.participant_id = $1',
      ];

      if (statut && VALID_STATUTS.includes(statut)) {
        params.push(statut);
        conditions.push(`i.statut = $${params.length}`);
      }

      const whereClause = conditions.join(' AND ');

      const countRows = await AppDataSource.query(
        `SELECT COUNT(*)::int AS total
         FROM inscriptions i
         WHERE ${whereClause}`,
        params,
      );
      const total = countRows[0]?.total ?? 0;

      params.push(limit, offset);
      const rows = await AppDataSource.query(
        `SELECT
           i.id,
           i.statut,
           i.created_at AS "dateInscription",
           i.motif_refus AS "motifRefus",
           i.motivation,
           i.participant_id AS "participantId",
           i.session_id AS "sessionId",
           u.prenom,
           u.nom,
           u.email,
           u.telephone,
           u.photo_url AS "photoUrl",
           s.code_session AS "codeSession",
           s.date_debut AS "dateDebut",
           s.date_fin AS "dateFin",
           s.lieu,
           s.lien_visio AS "lienVisio",
           s.capacite,
           s.statut AS "sessionStatut",
           f.id AS "formationId",
           f.titre AS "formationTitre",
           f.slug AS "formationSlug",
           f.description AS "formationDescription",
           form.id AS "formateurId",
           form.prenom AS "formateurPrenom",
           form.nom AS "formateurNom",
           form.email AS "formateurEmail"
         FROM inscriptions i
         JOIN users u ON u.id = i.participant_id
         JOIN sessions s ON s.id = i.session_id
         LEFT JOIN formations f ON f.id = s.formation_id
         LEFT JOIN users form ON form.id = s.formateur_id
         WHERE ${whereClause}
         ORDER BY i.created_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      );

      const inscriptions = rows.map(mapInscriptionRow);

      const [stats] = await AppDataSource.query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE statut = 'EN_ATTENTE')::int AS "enAttente",
           COUNT(*) FILTER (WHERE statut = 'ACCEPTEE')::int AS acceptees,
           COUNT(*) FILTER (WHERE statut = 'REFUSEE')::int AS refusees,
           COUNT(*) FILTER (WHERE statut = 'LISTE_ATTENTE')::int AS "listeAttente",
           COUNT(*) FILTER (WHERE statut = 'ANNULEE')::int AS annulees
         FROM inscriptions
         WHERE participant_id = $1 AND deleted_at IS NULL`,
        [userId],
      );

      logger.info('[INSCRIPTION] mesInscriptions', { userId, total, limit, offset });

      successResponse(
        res,
        {
          inscriptions,
          pagination: { total, limit, offset, count: inscriptions.length },
          stats,
        },
        'Mes inscriptions',
      );
    } catch (e) {
      next(e);
    }
  }
}