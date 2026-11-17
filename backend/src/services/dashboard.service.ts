// src/services/dashboard.service.ts
import { In } from 'typeorm';
import { AppDataSource } from '../config/database';

import { User } from '../entities/User.entity';
import { Formation } from '../entities/Formation.entity';
import { Session } from '../entities/Session.entity';
import { Inscription } from '../entities/Inscription.entity';
import { Attestation } from '../entities/Attestation.entity';
import { Presence } from '../entities/Presence.entity';
import { Partenaire } from '../entities/Partenaire.entity';

import {
  RoleName,
  StatutSession,
  StatutInscription,
  StatutPresence,
} from '../entities/enums';

import { logger } from '../config/logger';

/* ═══════════════════════════════════════════════════════════════════════════
   REPOSITORY FACTORIES
   ═══════════════════════════════════════════════════════════════════════════ */

const userRepo = () => AppDataSource.getRepository(User);
const formationRepo = () => AppDataSource.getRepository(Formation);
const sessionRepo = () => AppDataSource.getRepository(Session);
const inscriptionRepo = () => AppDataSource.getRepository(Inscription);
const attestationRepo = () => AppDataSource.getRepository(Attestation);
const presenceRepo = () => AppDataSource.getRepository(Presence);
const partenaireRepo = () => AppDataSource.getRepository(Partenaire);

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function n(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function nOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function hasRelation(entity: any, relationName: string): boolean {
  try {
    const meta = AppDataSource.getMetadata(entity);
    return meta.relations.some((r: any) => r.propertyName === relationName);
  } catch {
    return false;
  }
}

function getDomaineRelationName(): string | null {
  for (const name of ['domaineRelation', 'domaine', 'category']) {
    if (hasRelation(Formation, name)) return name;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface AdminStats {
  kpis: {
    totalUsers: number;
    usersActifs: number;
    totalFormations: number;
    formationsPubliees: number;
    totalSessions: number;
    sessionsOuvertes: number;
    sessionsEnCours: number;
    totalInscriptions: number;
    inscriptionsEnAttente: number;
    inscriptionsAcceptees: number;
    inscriptionsRefusees: number;
    totalAttestations: number;
    totalPartenaires: number;
    totalPresences: number;
    tauxPresenceMoyen: number | null;
  };
  trends: {
    users: number;
    formations: number;
    sessions: number;
    inscriptions: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  topFormations: Array<{
    id: string;
    titre: string;
    slug: string;
    domaine: string;
    inscriptions: number;
  }>;
  inscriptionsParMois: Array<{ mois: string; count: number }>;
  formationsByDomaine: Array<{ domaine: string; couleur: string; count: number }>;
  sessionsParStatut: Array<{ statut: string; count: number }>;
}

export interface StaffStats {
  inscriptionsEnAttente: number;
  sessionsActives: number;
  inscriptionsDuJour: number;
  tauxPresenceMoyen: number | null;
  totalSessions: number;
  sessionsOuvertes: number;
  formationsPubliees: number;
  totalPartenaires: number;
  totalInscriptions: number;
  totalUsers: number;
}

export interface FormateurStats {
  totalSessions: number;
  sessionsEnCours: number;
  sessionsTerminees: number;
  sessionsOuvertes: number;
  sessionsAVenir: number;
  totalParticipants: number;
  inscriptionsEnAttente: number;
  tauxPresenceMoyen: number | null;
  prochainesSessions: Array<{
    id: string;
    code: string;
    formation: string;
    dateDebut: Date;
    lieu: string;
  }>;
}

export interface ParticipantStats {
  totalInscriptions: number;
  inscriptionsAcceptees: number;
  inscriptionsEnAttente: number;
  inscriptionsRefusees: number;
  inscriptionsEnListeAttente: number;
  inscriptionsAnnulees: number;
  formationsEnCours: number;
  formationsTerminees: number;
  attestationsObtenues: number;
  totalPresences: number;
  tauxPresenceMoyen: number | null;
  prochainesSessions: Array<{
    inscriptionId: string;
    formation: string;
    dateDebut: Date;
    statut: StatutInscription;
    lieu?: string;
  }>;
}

export interface PartenaireStats {
  chiffres: {
    totalFormations: number;
    totalSessions: number;
    totalParticipants: number;
    totalAttestations: number;
  };
  formationsPubliees: number;
  sessionsPubliques: number;
  parDomaine: Array<{ domaine: string; count: number }>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICE
   ═══════════════════════════════════════════════════════════════════════════ */

export class DashboardService {
  /* ══════════════════════════════════════════════════════════════════════════
     🎯 POINT D'ENTRÉE UNIFIÉ
     ══════════════════════════════════════════════════════════════════════════ */
  static async getStats(role: RoleName, userId: string) {
    try {
      switch (role) {
        case RoleName.ADMINISTRATEUR:
          return this.getAdminStats();
        case RoleName.STAFF_ODC:
          return this.getStaffStats();
        case RoleName.FORMATEUR:
          return this.getFormateurStats(userId);
        case RoleName.PARTICIPANT:
          return this.getParticipantStats(userId);
        case RoleName.PARTENAIRE:
          return this.getPartenaireStats();
        default:
          logger.warn(`[DashboardService] Rôle inconnu : ${role}`);
          return {};
      }
    } catch (e: any) {
      logger.error(`❌ getStats(${role}) : ${e.message}`, {
        stack: e.stack?.split('\n').slice(0, 3),
        userId,
      });
      throw e;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     👑 ADMINISTRATEUR
     ══════════════════════════════════════════════════════════════════════════ */
  static async getAdminStats(): Promise<AdminStats> {
    try {
      const [row] = await AppDataSource.query(`
        SELECT
          (SELECT COUNT(*)::int FROM users WHERE deleted_at IS NULL) AS "totalUsers",
          (SELECT COUNT(*)::int FROM users WHERE actif = true AND deleted_at IS NULL) AS "usersActifs",
          (SELECT COUNT(*)::int FROM formations WHERE deleted_at IS NULL) AS "totalFormations",
          (SELECT COUNT(*)::int FROM formations WHERE est_publiee = true AND deleted_at IS NULL) AS "formationsPubliees",
          (SELECT COUNT(*)::int FROM sessions WHERE deleted_at IS NULL) AS "totalSessions",
          (SELECT COUNT(*)::int FROM sessions WHERE LOWER(statut) = 'ouverte' AND deleted_at IS NULL) AS "sessionsOuvertes",
          (SELECT COUNT(*)::int FROM sessions WHERE LOWER(statut) = 'en_cours' AND deleted_at IS NULL) AS "sessionsEnCours",
          (SELECT COUNT(*)::int FROM inscriptions WHERE deleted_at IS NULL) AS "totalInscriptions",
          (SELECT COUNT(*)::int FROM inscriptions WHERE LOWER(statut) = 'en_attente' AND deleted_at IS NULL) AS "inscriptionsEnAttente",
          (SELECT COUNT(*)::int FROM inscriptions WHERE LOWER(statut) = 'acceptee' AND deleted_at IS NULL) AS "inscriptionsAcceptees",
          (SELECT COUNT(*)::int FROM inscriptions WHERE LOWER(statut) = 'refusee' AND deleted_at IS NULL) AS "inscriptionsRefusees",
          (SELECT COUNT(*)::int FROM attestations WHERE valide = true AND deleted_at IS NULL) AS "totalAttestations",
          (SELECT COUNT(*)::int FROM partenaires WHERE deleted_at IS NULL) AS "totalPartenaires",
          (SELECT COUNT(*)::int FROM presences WHERE deleted_at IS NULL) AS "totalPresences",
          (SELECT
             CASE WHEN COUNT(*) = 0 THEN NULL
             ELSE ROUND(
               (COUNT(*) FILTER (WHERE LOWER(statut) IN ('present', 'retard'))::numeric
                / COUNT(*)::numeric) * 100, 1)
             END
           FROM presences WHERE deleted_at IS NULL) AS "tauxPresenceMoyen"
      `);

      const kpis = {
        totalUsers: n(row?.totalUsers),
        usersActifs: n(row?.usersActifs),
        totalFormations: n(row?.totalFormations),
        formationsPubliees: n(row?.formationsPubliees),
        totalSessions: n(row?.totalSessions),
        sessionsOuvertes: n(row?.sessionsOuvertes),
        sessionsEnCours: n(row?.sessionsEnCours),
        totalInscriptions: n(row?.totalInscriptions),
        inscriptionsEnAttente: n(row?.inscriptionsEnAttente),
        inscriptionsAcceptees: n(row?.inscriptionsAcceptees),
        inscriptionsRefusees: n(row?.inscriptionsRefusees),
        totalAttestations: n(row?.totalAttestations),
        totalPartenaires: n(row?.totalPartenaires),
        totalPresences: n(row?.totalPresences),
        tauxPresenceMoyen: nOrNull(row?.tauxPresenceMoyen),
      };

      const [usersByRole, topFormations, inscriptionsParMois, formationsByDomaine, sessionsParStatut, trends] =
        await Promise.all([
          this.getUsersByRole(),
          this.getTopFormations(5),
          this.getInscriptionsParMois(12),
          this.getFormationsByDomaine(),
          this.getSessionsParStatut(),
          this.computeTrends(),
        ]);

      logger.info('[DashboardService] getAdminStats', kpis);

      return { kpis, trends, usersByRole, topFormations, inscriptionsParMois, formationsByDomaine, sessionsParStatut };
    } catch (e: any) {
      logger.error(`❌ getAdminStats : ${e.message}`);
      throw e;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     👔 STAFF ODC
     ══════════════════════════════════════════════════════════════════════════ */
  static async getStaffStats(): Promise<StaffStats> {
    try {
      const [row] = await AppDataSource.query(`
        SELECT
          (SELECT COUNT(*)::int FROM inscriptions
           WHERE LOWER(statut) = 'en_attente' AND deleted_at IS NULL) AS "inscriptionsEnAttente",
          (SELECT COUNT(*)::int FROM sessions
           WHERE LOWER(statut) IN ('en_cours', 'ouverte') AND deleted_at IS NULL) AS "sessionsActives",
          (SELECT COUNT(*)::int FROM inscriptions
           WHERE DATE(created_at) = CURRENT_DATE AND deleted_at IS NULL) AS "inscriptionsDuJour",
          (SELECT
             CASE WHEN COUNT(*) = 0 THEN NULL
             ELSE ROUND(
               (COUNT(*) FILTER (WHERE LOWER(statut) IN ('present', 'retard'))::numeric
                / COUNT(*)::numeric) * 100, 1)
             END
           FROM presences WHERE deleted_at IS NULL) AS "tauxPresenceMoyen",
          (SELECT COUNT(*)::int FROM sessions WHERE deleted_at IS NULL) AS "totalSessions",
          (SELECT COUNT(*)::int FROM sessions WHERE LOWER(statut) = 'ouverte' AND deleted_at IS NULL) AS "sessionsOuvertes",
          (SELECT COUNT(*)::int FROM formations WHERE est_publiee = true AND deleted_at IS NULL) AS "formationsPubliees",
          (SELECT COUNT(*)::int FROM partenaires WHERE deleted_at IS NULL) AS "totalPartenaires",
          (SELECT COUNT(*)::int FROM inscriptions WHERE deleted_at IS NULL) AS "totalInscriptions",
          (SELECT COUNT(*)::int FROM users WHERE actif = true AND deleted_at IS NULL) AS "totalUsers"
      `);

      const stats: StaffStats = {
        inscriptionsEnAttente: n(row?.inscriptionsEnAttente),
        sessionsActives: n(row?.sessionsActives),
        inscriptionsDuJour: n(row?.inscriptionsDuJour),
        tauxPresenceMoyen: nOrNull(row?.tauxPresenceMoyen),
        totalSessions: n(row?.totalSessions),
        sessionsOuvertes: n(row?.sessionsOuvertes),
        formationsPubliees: n(row?.formationsPubliees),
        totalPartenaires: n(row?.totalPartenaires),
        totalInscriptions: n(row?.totalInscriptions),
        totalUsers: n(row?.totalUsers),
      };

      logger.info('[DashboardService] getStaffStats', stats);
      return stats;
    } catch (e: any) {
      logger.error(`❌ getStaffStats : ${e.message}`);
      throw e;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     👨‍🏫 FORMATEUR — version TypeORM (robuste)
     ══════════════════════════════════════════════════════════════════════════ */
  static async getFormateurStats(formateurId: string): Promise<FormateurStats> {
    try {
      /* ─── 1. Charger toutes les sessions du formateur ──────────────── */
      const sessions = await sessionRepo().find({
        where: { formateurId },
        relations: ['formation'],
        order: { dateDebut: 'ASC' },
      });

      /* ─── 2. Compter par statut (via enum TypeScript) ─────────────── */
      const totalSessions = sessions.length;
      const sessionsEnCours = sessions.filter(
        (s) => s.statut === StatutSession.EN_COURS,
      ).length;
      const sessionsTerminees = sessions.filter(
        (s) => s.statut === StatutSession.TERMINEE,
      ).length;
      const sessionsOuvertes = sessions.filter(
        (s) => s.statut === StatutSession.OUVERTE,
      ).length;

      /* ─── 3. Sessions à venir (statut futur + date future) ────────── */
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const sessionsAVenir = sessions.filter(
        (s) =>
          (s.statut === StatutSession.PLANIFIEE ||
            s.statut === StatutSession.OUVERTE) &&
          new Date(s.dateDebut) >= now,
      ).length;

      /* ─── 4. Participants et inscriptions ─────────────────────────── */
      const sessionIds = sessions.map((s) => s.id);

      let totalParticipants = 0;
      let inscriptionsEnAttente = 0;
      let tauxPresenceMoyen: number | null = null;

      if (sessionIds.length > 0) {
        const inscriptions = await inscriptionRepo().find({
          where: { sessionId: In(sessionIds) },
        });

        totalParticipants = new Set(
          inscriptions
            .filter((i) => i.statut === StatutInscription.ACCEPTEE)
            .map((i) => i.participantId),
        ).size;

        inscriptionsEnAttente = inscriptions.filter(
          (i) => i.statut === StatutInscription.EN_ATTENTE,
        ).length;

        /* ─── 5. Taux de présence ───────────────────────────────────── */
        const presences = await presenceRepo().find({
          where: { sessionId: In(sessionIds) },
        });

        if (presences.length > 0) {
          const presentsOuRetard = presences.filter(
            (p) =>
              p.statut === StatutPresence.PRESENT ||
              p.statut === StatutPresence.RETARD,
          ).length;

          tauxPresenceMoyen =
            Math.round((presentsOuRetard / presences.length) * 100 * 10) / 10;
        }
      }

      /* ─── 6. Prochaines sessions (5 max) ──────────────────────────── */
      const prochainesSessions = sessions
        .filter(
          (s) =>
            (s.statut === StatutSession.PLANIFIEE ||
              s.statut === StatutSession.OUVERTE) &&
            new Date(s.dateDebut) >= now,
        )
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          code: s.codeSession,
          formation: s.formation?.titre ?? 'Session',
          dateDebut: s.dateDebut,
          lieu: s.lieu ?? 'En ligne',
        }));

      /* ─── 7. Log ──────────────────────────────────────────────────── */
      logger.info('[DashboardService] getFormateurStats', {
        formateurId,
        totalSessions,
        sessionsEnCours,
        sessionsTerminees,
        sessionsOuvertes,
        sessionsAVenir,
        totalParticipants,
        inscriptionsEnAttente,
        tauxPresenceMoyen,
        prochainesSessionsCount: prochainesSessions.length,
      });

      /* ─── 8. Retour ───────────────────────────────────────────────── */
      return {
        totalSessions,
        sessionsEnCours,
        sessionsTerminees,
        sessionsOuvertes,
        sessionsAVenir,
        totalParticipants,
        inscriptionsEnAttente,
        tauxPresenceMoyen,
        prochainesSessions,
      };
    } catch (e: any) {
      logger.error(`❌ getFormateurStats(${formateurId}) : ${e.message}`, {
        stack: e.stack?.split('\n').slice(0, 5),
      });
      throw e;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     🎓 PARTICIPANT — version TypeORM (robuste)
     ══════════════════════════════════════════════════════════════════════════ */
  static async getParticipantStats(participantId: string): Promise<ParticipantStats> {
    try {
      /* ─── 1. Charger toutes les inscriptions ──────────────────────── */
      const inscriptions = await inscriptionRepo().find({
        where: { participantId },
        relations: ['session', 'session.formation'],
        order: { createdAt: 'DESC' },
      });

      /* ─── 2. Compter par statut ───────────────────────────────────── */
      const totalInscriptions = inscriptions.length;
      const inscriptionsAcceptees = inscriptions.filter(
        (i) => i.statut === StatutInscription.ACCEPTEE,
      ).length;
      const inscriptionsEnAttente = inscriptions.filter(
        (i) => i.statut === StatutInscription.EN_ATTENTE,
      ).length;
      const inscriptionsRefusees = inscriptions.filter(
        (i) => i.statut === StatutInscription.REFUSEE,
      ).length;
      const inscriptionsEnListeAttente = inscriptions.filter(
        (i) => i.statut === StatutInscription.LISTE_ATTENTE,
      ).length;
      const inscriptionsAnnulees = inscriptions.filter(
        (i) => i.statut === StatutInscription.ANNULEE,
      ).length;

      /* ─── 3. Formations en cours / terminées ─────────────────────── */
      const formationsEnCours = inscriptions.filter(
        (i) =>
          i.statut === StatutInscription.ACCEPTEE &&
          i.session &&
          i.session.statut === StatutSession.EN_COURS,
      ).length;

      const formationsTerminees = inscriptions.filter(
        (i) =>
          i.statut === StatutInscription.ACCEPTEE &&
          i.session &&
          i.session.statut === StatutSession.TERMINEE,
      ).length;

      /* ─── 4. Attestations ─────────────────────────────────────────── */
      const attestationsObtenues = await attestationRepo().count({
        where: {
          participantId,
          valide: true,
        },
      });

      /* ─── 5. Présences ────────────────────────────────────────────── */
      const presences = await presenceRepo().find({
        where: { participantId },
      });

      const totalPresences = presences.length;
      let tauxPresenceMoyen: number | null = null;

      if (presences.length > 0) {
        const presentsOuRetard = presences.filter(
          (p) =>
            p.statut === StatutPresence.PRESENT ||
            p.statut === StatutPresence.RETARD,
        ).length;

        tauxPresenceMoyen =
          Math.round((presentsOuRetard / presences.length) * 100 * 10) / 10;
      }

      /* ─── 6. Prochaines sessions ──────────────────────────────────── */
      const now = new Date();
      const prochainesSessions = inscriptions
        .filter(
          (i) =>
            i.statut === StatutInscription.ACCEPTEE &&
            i.session &&
            new Date(i.session.dateDebut) > now,
        )
        .sort(
          (a, b) =>
            new Date(a.session!.dateDebut).getTime() -
            new Date(b.session!.dateDebut).getTime(),
        )
        .slice(0, 5)
        .map((i) => ({
          inscriptionId: i.id,
          formation: i.session!.formation?.titre ?? 'Formation',
          dateDebut: i.session!.dateDebut,
          statut: i.statut,
          lieu: i.session!.lieu ?? undefined,
        }));

      logger.info('[DashboardService] getParticipantStats', {
        participantId,
        totalInscriptions,
        inscriptionsAcceptees,
        formationsEnCours,
        formationsTerminees,
        attestationsObtenues,
        tauxPresenceMoyen,
      });

      return {
        totalInscriptions,
        inscriptionsAcceptees,
        inscriptionsEnAttente,
        inscriptionsRefusees,
        inscriptionsEnListeAttente,
        inscriptionsAnnulees,
        formationsEnCours,
        formationsTerminees,
        attestationsObtenues,
        totalPresences,
        tauxPresenceMoyen,
        prochainesSessions,
      };
    } catch (e: any) {
      logger.error(`❌ getParticipantStats(${participantId}) : ${e.message}`, {
        stack: e.stack?.split('\n').slice(0, 5),
      });
      throw e;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     🤝 PARTENAIRE
     ══════════════════════════════════════════════════════════════════════════ */
  static async getPartenaireStats(): Promise<PartenaireStats> {
    try {
      const [row] = await AppDataSource.query(`
        SELECT
          (SELECT COUNT(*)::int FROM formations WHERE deleted_at IS NULL) AS "totalFormations",
          (SELECT COUNT(*)::int FROM formations WHERE est_publiee = true AND deleted_at IS NULL) AS "formationsPubliees",
          (SELECT COUNT(*)::int FROM sessions WHERE deleted_at IS NULL) AS "totalSessions",
          (SELECT COUNT(*)::int FROM sessions WHERE est_publiee = true AND deleted_at IS NULL) AS "sessionsPubliques",
          (SELECT COUNT(*)::int FROM inscriptions
           WHERE LOWER(statut) = 'acceptee' AND deleted_at IS NULL) AS "totalParticipants",
          (SELECT COUNT(*)::int FROM attestations
           WHERE valide = true AND deleted_at IS NULL) AS "totalAttestations"
      `);

      const parDomaine = await this.getFormationsByDomaineSimple();

      const stats: PartenaireStats = {
        chiffres: {
          totalFormations: n(row?.totalFormations),
          totalSessions: n(row?.totalSessions),
          totalParticipants: n(row?.totalParticipants),
          totalAttestations: n(row?.totalAttestations),
        },
        formationsPubliees: n(row?.formationsPubliees),
        sessionsPubliques: n(row?.sessionsPubliques),
        parDomaine,
      };

      logger.info('[DashboardService] getPartenaireStats', stats.chiffres);
      return stats;
    } catch (e: any) {
      logger.error(`❌ getPartenaireStats : ${e.message}`);
      throw e;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     HELPERS PRIVÉS
     ══════════════════════════════════════════════════════════════════════════ */

  private static async getTopFormations(limit: number) {
    const domaineRelation = getDomaineRelationName();
    const qb = formationRepo()
      .createQueryBuilder('f')
      .leftJoin('f.sessions', 's')
      .leftJoin('s.inscriptions', 'i')
      .select('f.id', 'id')
      .addSelect('f.titre', 'titre')
      .addSelect('f.slug', 'slug')
      .addSelect('COUNT(DISTINCT i.id)', 'inscriptions')
      .where('f.estPubliee = :pub', { pub: true })
      .andWhere('f.deletedAt IS NULL')
      .groupBy('f.id')
      .addGroupBy('f.titre')
      .addGroupBy('f.slug')
      .orderBy('inscriptions', 'DESC')
      .limit(limit);

    if (domaineRelation) {
      qb.leftJoin(`f.${domaineRelation}`, 'd')
        .addSelect('d.nom', 'domaine')
        .addGroupBy('d.nom');
    }

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      id: r.id,
      titre: r.titre,
      slug: r.slug,
      domaine: r.domaine ?? 'Sans domaine',
      inscriptions: n(r.inscriptions),
    }));
  }

  private static async getInscriptionsParMois(months: number) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - months, 1);

    const inscriptions = await inscriptionRepo()
      .createQueryBuilder('i')
      .select('i.createdAt', 'createdAt')
      .where('i.createdAt >= :start', { start })
      .orderBy('i.createdAt', 'ASC')
      .getRawMany();

    const byMonth: Record<string, number> = {};
    for (const i of inscriptions) {
      const date = new Date(i.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] ?? 0) + 1;
    }

    const result: Array<{ mois: string; count: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({ mois: key, count: byMonth[key] ?? 0 });
    }
    return result;
  }

  private static async getFormationsByDomaine() {
    const domaineRelation = getDomaineRelationName();
    if (!domaineRelation) return [];

    const rows = await formationRepo()
      .createQueryBuilder('f')
      .leftJoin(`f.${domaineRelation}`, 'd')
      .select('COALESCE(d.nom, :default)', 'domaine')
      .addSelect('COALESCE(d.couleur, :defaultColor)', 'couleur')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.estPubliee = :pub', { pub: true })
      .andWhere('f.deletedAt IS NULL')
      .setParameter('default', 'Sans domaine')
      .setParameter('defaultColor', '#6B7280')
      .groupBy('COALESCE(d.nom, :default)')
      .addGroupBy('COALESCE(d.couleur, :defaultColor)')
      .getRawMany();

    return rows.map((r) => ({
      domaine: r.domaine ?? 'Sans domaine',
      couleur: r.couleur ?? '#6B7280',
      count: n(r.count),
    }));
  }

  private static async getFormationsByDomaineSimple() {
    const domaineRelation = getDomaineRelationName();
    if (!domaineRelation) return [];

    const rows = await formationRepo()
      .createQueryBuilder('f')
      .leftJoin(`f.${domaineRelation}`, 'd')
      .select('COALESCE(d.nom, :default)', 'domaine')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.estPubliee = :pub', { pub: true })
      .andWhere('f.deletedAt IS NULL')
      .setParameter('default', 'Sans domaine')
      .groupBy('COALESCE(d.nom, :default)')
      .orderBy('count', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      domaine: r.domaine ?? 'Sans domaine',
      count: n(r.count),
    }));
  }

  private static async getSessionsParStatut() {
    const rows = await sessionRepo()
      .createQueryBuilder('s')
      .select('s.statut', 'statut')
      .addSelect('COUNT(s.id)', 'count')
      .where('s.deletedAt IS NULL')
      .groupBy('s.statut')
      .getRawMany();

    return rows.map((r) => ({
      statut: String(r.statut),
      count: n(r.count),
    }));
  }

  private static async getUsersByRole(): Promise<Array<{ role: string; count: number }>> {
    const rows = await userRepo()
      .createQueryBuilder('u')
      .leftJoin('u.role', 'r')
      .select('r.nom', 'role')
      .addSelect('COUNT(u.id)', 'count')
      .where('u.actif = true')
      .andWhere('u.deletedAt IS NULL')
      .groupBy('r.nom')
      .getRawMany();

    return rows.map((r) => ({
      role: r.role ?? 'PARTICIPANT',
      count: n(r.count),
    }));
  }

  private static async computeTrends() {
    try {
      const now = new Date();
      const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const [usersThis, usersLast, formationsThis, formationsLast, sessionsThis, sessionsLast, inscriptionsThis, inscriptionsLast] =
        await Promise.all([
          userRepo().createQueryBuilder('u').where('u.createdAt >= :d', { d: startThisMonth }).getCount(),
          userRepo().createQueryBuilder('u').where('u.createdAt >= :d1 AND u.createdAt < :d2', { d1: startLastMonth, d2: startThisMonth }).getCount(),
          formationRepo().createQueryBuilder('f').where('f.createdAt >= :d', { d: startThisMonth }).getCount(),
          formationRepo().createQueryBuilder('f').where('f.createdAt >= :d1 AND f.createdAt < :d2', { d1: startLastMonth, d2: startThisMonth }).getCount(),
          sessionRepo().createQueryBuilder('s').where('s.createdAt >= :d', { d: startThisMonth }).getCount(),
          sessionRepo().createQueryBuilder('s').where('s.createdAt >= :d1 AND s.createdAt < :d2', { d1: startLastMonth, d2: startThisMonth }).getCount(),
          inscriptionRepo().createQueryBuilder('i').where('i.createdAt >= :d', { d: startThisMonth }).getCount(),
          inscriptionRepo().createQueryBuilder('i').where('i.createdAt >= :d1 AND i.createdAt < :d2', { d1: startLastMonth, d2: startThisMonth }).getCount(),
        ]);

      const calc = (current: number, previous: number) =>
        previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

      return {
        users: calc(usersThis, usersLast),
        formations: calc(formationsThis, formationsLast),
        sessions: calc(sessionsThis, sessionsLast),
        inscriptions: calc(inscriptionsThis, inscriptionsLast),
      };
    } catch (e: any) {
      logger.error(`❌ computeTrends : ${e.message}`);
      return { users: 0, formations: 0, sessions: 0, inscriptions: 0 };
    }
  }
}