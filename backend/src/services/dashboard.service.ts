// src/services/dashboard.service.ts
import { In, Brackets } from 'typeorm';
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

/* ============================================================================
   REPOSITORY FACTORIES
   ============================================================================ */

const userRepo = () => AppDataSource.getRepository(User);
const formationRepo = () => AppDataSource.getRepository(Formation);
const sessionRepo = () => AppDataSource.getRepository(Session);
const inscriptionRepo = () => AppDataSource.getRepository(Inscription);
const attestationRepo = () => AppDataSource.getRepository(Attestation);
const presenceRepo = () => AppDataSource.getRepository(Presence);
const partenaireRepo = () => AppDataSource.getRepository(Partenaire);

/* ============================================================================
   HELPERS — Détection de relation
   ============================================================================ */

/**
 * Vérifie si une entité possède une relation donnée.
 */
function hasRelation(
  entity: any,
  relationName: string,
): boolean {
  try {
    const metadata = AppDataSource.getMetadata(entity);
    return metadata.relations.some(
      (rel: any) => rel.propertyName === relationName,
    );
  } catch {
    return false;
  }
}

/**
 * Récupère le nom réel de la relation "domaine" sur Formation.
 * Supporte : `domaine`, `domaineRelation`, `category`, etc.
 */
function getDomaineRelationName(): string | null {
  const candidates = ['domaineRelation', 'domaine', 'category'];
  for (const name of candidates) {
    if (hasRelation(Formation, name)) return name;
  }
  return null;
}

/* ============================================================================
   TYPES DE RETOUR
   ============================================================================ */

export interface KpiCard {
  value: number;
  label: string;
  trend?: number;
}

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
    totalAttestations: number;
    totalPartenaires: number;
    tauxPresenceMoyen: number;
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
  formationsByDomaine: Array<{
    domaine: string;
    couleur: string;
    count: number;
  }>;
  sessionsParStatut: Array<{ statut: string; count: number }>;
}

export interface StaffStats {
  inscriptionsEnAttente: number;
  sessionsActives: number;
  inscriptionsDuJour: number;
  tauxPresenceMoyen: number;
  selectionsEnAttente: number;
}

export interface FormateurStats {
  totalSessions: number;
  sessionsEnCours: number;
  sessionsTerminees: number;
  totalParticipants: number;
  tauxPresenceMoyen: number;
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
  formationsEnCours: number;
  formationsTerminees: number;
  attestationsObtenues: number;
  tauxPresenceMoyen: number;
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

/* ============================================================================
   SERVICE
   ============================================================================ */

export class DashboardService {
  /* ==========================================================================
     🎯 Point d'entrée unifié
     ========================================================================== */
  static async getStats(role: RoleName, userId: string) {
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
        return { kpis: {} };
    }
  }

  /* ==========================================================================
     👑 ADMINISTRATEUR
     ========================================================================== */
  static async getAdminStats(): Promise<AdminStats> {
    try {
      /* -------------------- KPIs (comptages en parallèle) -------------------- */
      const [
        totalUsers,
        usersActifs,
        totalFormations,
        formationsPubliees,
        totalSessions,
        sessionsOuvertes,
        sessionsEnCours,
        totalInscriptions,
        inscriptionsEnAttente,
        totalAttestations,
        totalPartenaires,
        tauxPresenceMoyen,
      ] = await Promise.all([
        userRepo().count(),
        userRepo().count({ where: { actif: true } }),
        formationRepo().count(),
        formationRepo().count({ where: { estPubliee: true } }),
        sessionRepo().count(),
        sessionRepo().count({ where: { statut: StatutSession.OUVERTE } }),
        sessionRepo().count({ where: { statut: StatutSession.EN_COURS } }),
        inscriptionRepo().count(),
        inscriptionRepo().count({
          where: { statut: StatutInscription.EN_ATTENTE },
        }),
        attestationRepo().count({ where: { valide: true } }),
        partenaireRepo().count(),
        this.calculerTauxPresenceGlobal(),
      ]);

      /* -------------------- Répartition par rôle -------------------- */
      const usersByRole = await this.getUsersByRole();

      /* -------------------- Top formations (⭐ CORRIGÉ) -------------------- */
      const topFormations = await this.getTopFormations(5);

      /* -------------------- Inscriptions par mois (⭐ CORRIGÉ) -------------------- */
      const inscriptionsParMois = await this.getInscriptionsParMois(12);

      /* -------------------- Formations par domaine (⭐ CORRIGÉ) -------------------- */
      const formationsByDomaine = await this.getFormationsByDomaine();

      /* -------------------- Sessions par statut -------------------- */
      const sessionsParStatut = await this.getSessionsParStatut();

      /* -------------------- Trends -------------------- */
      const trends = await this.computeTrends();

      return {
        kpis: {
          totalUsers,
          usersActifs,
          totalFormations,
          formationsPubliees,
          totalSessions,
          sessionsOuvertes,
          sessionsEnCours,
          totalInscriptions,
          inscriptionsEnAttente,
          totalAttestations,
          totalPartenaires,
          tauxPresenceMoyen,
        },
        trends,
        usersByRole,
        topFormations,
        inscriptionsParMois,
        formationsByDomaine,
        sessionsParStatut,
      };
    } catch (e: any) {
      logger.error(`❌ getAdminStats : ${e.message}`);

      // ⭐ Fallback complet
      return this.getEmptyAdminStats();
    }
  }

  /* ==========================================================================
     👔 STAFF ODC
     ========================================================================== */
  static async getStaffStats(): Promise<StaffStats> {
    try {
      const [
        inscriptionsEnAttente,
        sessionsActives,
        inscriptionsDuJour,
        tauxPresenceMoyen,
      ] = await Promise.all([
        inscriptionRepo().count({
          where: { statut: StatutInscription.EN_ATTENTE },
        }),
        sessionRepo().count({
          where: { statut: StatutSession.EN_COURS },
        }),
        this.compterInscriptionsDuJour(),
        this.calculerTauxPresenceGlobal(),
      ]);

      return {
        inscriptionsEnAttente,
        sessionsActives,
        inscriptionsDuJour,
        tauxPresenceMoyen,
        selectionsEnAttente: inscriptionsEnAttente,
      };
    } catch (e: any) {
      logger.error(`❌ getStaffStats : ${e.message}`);
      return {
        inscriptionsEnAttente: 0,
        sessionsActives: 0,
        inscriptionsDuJour: 0,
        tauxPresenceMoyen: 0,
        selectionsEnAttente: 0,
      };
    }
  }

  /* ==========================================================================
     👨‍🏫 FORMATEUR
     ========================================================================== */
  static async getFormateurStats(
    formateurId: string,
  ): Promise<FormateurStats> {
    try {
      const mesSessions = await sessionRepo().find({
        where: { formateurId },
        relations: ['formation'],
        order: { dateDebut: 'DESC' },
      });

      const now = new Date();

      const sessionsEnCours = mesSessions.filter(
        (s) => s.statut === StatutSession.EN_COURS,
      ).length;

      const sessionsTerminees = mesSessions.filter(
        (s) => s.statut === StatutSession.TERMINEE,
      ).length;

      /* -------------------- Total participants -------------------- */
      const sessionIds = mesSessions.map((s) => s.id);
      let totalParticipants = 0;
      if (sessionIds.length > 0) {
        totalParticipants = await inscriptionRepo().count({
          where: {
            sessionId: In(sessionIds),
            statut: StatutInscription.ACCEPTEE,
          },
        });
      }

      /* -------------------- Taux présence -------------------- */
      const tauxPresenceMoyen =
        await this.calculerTauxPresenceParFormateur(formateurId);

      /* -------------------- Prochaines sessions -------------------- */
      const prochainesSessions = mesSessions
        .filter((s) => new Date(s.dateDebut) > now)
        .sort(
          (a, b) =>
            new Date(a.dateDebut).getTime() -
            new Date(b.dateDebut).getTime(),
        )
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          code: s.codeSession,
          formation: s.formation?.titre ?? '',
          dateDebut: s.dateDebut,
          lieu: s.lieu ?? '',
        }));

      return {
        totalSessions: mesSessions.length,
        sessionsEnCours,
        sessionsTerminees,
        totalParticipants,
        tauxPresenceMoyen,
        prochainesSessions,
      };
    } catch (e: any) {
      logger.error(`❌ getFormateurStats : ${e.message}`);
      return {
        totalSessions: 0,
        sessionsEnCours: 0,
        sessionsTerminees: 0,
        totalParticipants: 0,
        tauxPresenceMoyen: 0,
        prochainesSessions: [],
      };
    }
  }

  /* ==========================================================================
     🎓 PARTICIPANT
     ========================================================================== */
  static async getParticipantStats(
    participantId: string,
  ): Promise<ParticipantStats> {
    try {
      const mesInscriptions = await inscriptionRepo().find({
        where: { participantId },
        relations: ['session', 'session.formation'],
        order: { createdAt: 'DESC' },
      });

      const now = new Date();

      const enCours = mesInscriptions.filter(
        (i) => i.session?.statut === StatutSession.EN_COURS,
      ).length;

      const terminees = mesInscriptions.filter(
        (i) => i.session?.statut === StatutSession.TERMINEE,
      ).length;

      /* -------------------- Attestations -------------------- */
      const attestationsObtenues = await attestationRepo().count({
        where: { participantId, valide: true },
      });

      /* -------------------- Taux présence -------------------- */
      const tauxPresenceMoyen =
        await this.calculerTauxPresenceParParticipant(participantId);

      /* -------------------- Prochaines sessions -------------------- */
      const prochainesSessions = mesInscriptions
        .filter(
          (i) => i.session && new Date(i.session.dateDebut) > now,
        )
        .sort(
          (a, b) =>
            new Date(a.session.dateDebut).getTime() -
            new Date(b.session.dateDebut).getTime(),
        )
        .slice(0, 5)
        .map((i) => ({
          inscriptionId: i.id,
          formation: i.session.formation?.titre ?? '',
          dateDebut: i.session.dateDebut,
          statut: i.statut,
          lieu: i.session.lieu ?? undefined,
        }));

      return {
        totalInscriptions: mesInscriptions.length,
        formationsEnCours: enCours,
        formationsTerminees: terminees,
        attestationsObtenues,
        tauxPresenceMoyen,
        prochainesSessions,
      };
    } catch (e: any) {
      logger.error(`❌ getParticipantStats : ${e.message}`);
      return {
        totalInscriptions: 0,
        formationsEnCours: 0,
        formationsTerminees: 0,
        attestationsObtenues: 0,
        tauxPresenceMoyen: 0,
        prochainesSessions: [],
      };
    }
  }

  /* ==========================================================================
     🤝 PARTENAIRE
     ========================================================================== */
  static async getPartenaireStats(): Promise<PartenaireStats> {
    try {
      const [
        totalFormations,
        formationsPubliees,
        totalSessions,
        sessionsPubliques,
        totalParticipants,
        totalAttestations,
      ] = await Promise.all([
        formationRepo().count(),
        formationRepo().count({ where: { estPubliee: true } }),
        sessionRepo().count(),
        sessionRepo().count({ where: { estPubliee: true } }),
        inscriptionRepo().count({
          where: { statut: StatutInscription.ACCEPTEE },
        }),
        attestationRepo().count({ where: { valide: true } }),
      ]);

      /* -------------------- Par domaine -------------------- */
      const parDomaine = await this.getFormationsByDomaineSimple();

      return {
        chiffres: {
          totalFormations,
          totalSessions,
          totalParticipants,
          totalAttestations,
        },
        formationsPubliees,
        sessionsPubliques,
        parDomaine,
      };
    } catch (e: any) {
      logger.error(`❌ getPartenaireStats : ${e.message}`);
      return {
        chiffres: {
          totalFormations: 0,
          totalSessions: 0,
          totalParticipants: 0,
          totalAttestations: 0,
        },
        formationsPubliees: 0,
        sessionsPubliques: 0,
        parDomaine: [],
      };
    }
  }

  /* ==========================================================================
     📊 TOP FORMATIONS (⭐ CORRIGÉ — relation dynamique)
     ========================================================================== */
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

    // ⭐ Jointure domaine uniquement si la relation existe
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
      inscriptions: Number(r.inscriptions),
    }));
  }

  /* ==========================================================================
     📅 INSCRIPTIONS PAR MOIS (⭐ CORRIGÉ — compatible PG/SQLite/MySQL)
     ========================================================================== */
  private static async getInscriptionsParMois(months: number) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - months, 1);

    // ⭐ Récupérer les données brutes et agréger en JS (compatible tous SGBD)
    const inscriptions = await inscriptionRepo()
      .createQueryBuilder('i')
      .select('i.createdAt', 'createdAt')
      .where('i.createdAt >= :start', { start })
      .orderBy('i.createdAt', 'ASC')
      .getRawMany();

    // Agréger par mois
    const byMonth: Record<string, number> = {};

    for (const i of inscriptions) {
      const date = new Date(i.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] ?? 0) + 1;
    }

    // Générer les 12 derniers mois (y compris les vides)
    const result: Array<{ mois: string; count: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({ mois: key, count: byMonth[key] ?? 0 });
    }

    return result;
  }

  /* ==========================================================================
     🏷️ FORMATIONS PAR DOMAINE (⭐ CORRIGÉ — relation dynamique)
     ========================================================================== */
  private static async getFormationsByDomaine() {
    const domaineRelation = getDomaineRelationName();

    if (!domaineRelation) {
      return [];
    }

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
      count: Number(r.count),
    }));
  }

  /* ==========================================================================
     🏷️ FORMATIONS PAR DOMAINE (version simple)
     ========================================================================== */
  private static async getFormationsByDomaineSimple() {
    const domaineRelation = getDomaineRelationName();

    if (!domaineRelation) {
      return [];
    }

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
      count: Number(r.count),
    }));
  }

  /* ==========================================================================
     📊 SESSIONS PAR STATUT
     ========================================================================== */
  private static async getSessionsParStatut() {
    const rows = await sessionRepo()
      .createQueryBuilder('s')
      .select('s.statut', 'statut')
      .addSelect('COUNT(s.id)', 'count')
      .where('s.deletedAt IS NULL')
      .groupBy('s.statut')
      .getRawMany();

    return rows.map((r) => ({
      statut: r.statut as string,
      count: Number(r.count),
    }));
  }

  /* ==========================================================================
     🔒 HELPERS PRIVÉS
     ========================================================================== */

  /** Répartition des utilisateurs par rôle */
  private static async getUsersByRole(): Promise<
    Array<{ role: string; count: number }>
  > {
    try {
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
        count: Number(r.count),
      }));
    } catch {
      return [];
    }
  }

  /** Nombre d'inscriptions créées aujourd'hui */
  private static async compterInscriptionsDuJour(): Promise<number> {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      return inscriptionRepo()
        .createQueryBuilder('i')
        .where('i.createdAt >= :start', { start })
        .andWhere('i.createdAt <= :end', { end })
        .getCount();
    } catch {
      return 0;
    }
  }

  /* ==========================================================================
     📈 TAUX DE PRÉSENCE
     ========================================================================== */

  /** Taux de présence global */
  private static async calculerTauxPresenceGlobal(): Promise<number> {
    try {
      const raw = await presenceRepo()
        .createQueryBuilder('p')
        .select('COUNT(p.id)', 'total')
        .addSelect(
          `SUM(CASE WHEN p.statut = :present THEN 1 ELSE 0 END)`,
          'presents',
        )
        .setParameter('present', StatutPresence.PRESENT)
        .getRawOne();

      const total = Number(raw?.total ?? 0);
      const presents = Number(raw?.presents ?? 0);

      return total === 0
        ? 0
        : Math.round((presents / total) * 10000) / 100;
    } catch {
      return 0;
    }
  }

  /** Taux de présence par formateur */
  private static async calculerTauxPresenceParFormateur(
    formateurId: string,
  ): Promise<number> {
    try {
      const raw = await presenceRepo()
        .createQueryBuilder('p')
        .leftJoin('p.session', 's')
        .select('COUNT(p.id)', 'total')
        .addSelect(
          `SUM(CASE WHEN p.statut = :present THEN 1 ELSE 0 END)`,
          'presents',
        )
        .where('s.formateurId = :fid', { fid: formateurId })
        .setParameter('present', StatutPresence.PRESENT)
        .getRawOne();

      const total = Number(raw?.total ?? 0);
      const presents = Number(raw?.presents ?? 0);

      return total === 0
        ? 0
        : Math.round((presents / total) * 10000) / 100;
    } catch {
      return 0;
    }
  }

  /** Taux de présence par participant */
  private static async calculerTauxPresenceParParticipant(
    participantId: string,
  ): Promise<number> {
    try {
      const raw = await presenceRepo()
        .createQueryBuilder('p')
        .select('COUNT(p.id)', 'total')
        .addSelect(
          `SUM(CASE WHEN p.statut = :present THEN 1 ELSE 0 END)`,
          'presents',
        )
        .where('p.participantId = :pid', { pid: participantId })
        .setParameter('present', StatutPresence.PRESENT)
        .getRawOne();

      const total = Number(raw?.total ?? 0);
      const presents = Number(raw?.presents ?? 0);

      return total === 0
        ? 0
        : Math.round((presents / total) * 10000) / 100;
    } catch {
      return 0;
    }
  }

  /* ==========================================================================
     Trends : comparaison mois courant vs mois précédent
     ========================================================================== */
  private static async computeTrends() {
    try {
      const now = new Date();
      const startThisMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );
      const startLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

      const [
        usersThis,
        usersLast,
        formationsThis,
        formationsLast,
        sessionsThis,
        sessionsLast,
        inscriptionsThis,
        inscriptionsLast,
      ] = await Promise.all([
        userRepo()
          .createQueryBuilder('u')
          .where('u.createdAt >= :d', { d: startThisMonth })
          .getCount(),
        userRepo()
          .createQueryBuilder('u')
          .where('u.createdAt >= :d1 AND u.createdAt < :d2', {
            d1: startLastMonth,
            d2: startThisMonth,
          })
          .getCount(),
        formationRepo()
          .createQueryBuilder('f')
          .where('f.createdAt >= :d', { d: startThisMonth })
          .getCount(),
        formationRepo()
          .createQueryBuilder('f')
          .where('f.createdAt >= :d1 AND f.createdAt < :d2', {
            d1: startLastMonth,
            d2: startThisMonth,
          })
          .getCount(),
        sessionRepo()
          .createQueryBuilder('s')
          .where('s.createdAt >= :d', { d: startThisMonth })
          .getCount(),
        sessionRepo()
          .createQueryBuilder('s')
          .where('s.createdAt >= :d1 AND s.createdAt < :d2', {
            d1: startLastMonth,
            d2: startThisMonth,
          })
          .getCount(),
        inscriptionRepo()
          .createQueryBuilder('i')
          .where('i.createdAt >= :d', { d: startThisMonth })
          .getCount(),
        inscriptionRepo()
          .createQueryBuilder('i')
          .where('i.createdAt >= :d1 AND i.createdAt < :d2', {
            d1: startLastMonth,
            d2: startThisMonth,
          })
          .getCount(),
      ]);

      const calc = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      return {
        users: calc(usersThis, usersLast),
        formations: calc(formationsThis, formationsLast),
        sessions: calc(sessionsThis, sessionsLast),
        inscriptions: calc(inscriptionsThis, inscriptionsLast),
      };
    } catch {
      return { users: 0, formations: 0, sessions: 0, inscriptions: 0 };
    }
  }

  /* ==========================================================================
     FALLBACK — Stats vides
     ========================================================================== */
  private static getEmptyAdminStats(): AdminStats {
    return {
      kpis: {
        totalUsers: 0,
        usersActifs: 0,
        totalFormations: 0,
        formationsPubliees: 0,
        totalSessions: 0,
        sessionsOuvertes: 0,
        sessionsEnCours: 0,
        totalInscriptions: 0,
        inscriptionsEnAttente: 0,
        totalAttestations: 0,
        totalPartenaires: 0,
        tauxPresenceMoyen: 0,
      },
      trends: { users: 0, formations: 0, sessions: 0, inscriptions: 0 },
      usersByRole: [],
      topFormations: [],
      inscriptionsParMois: [],
      formationsByDomaine: [],
      sessionsParStatut: [],
    };
  }
}