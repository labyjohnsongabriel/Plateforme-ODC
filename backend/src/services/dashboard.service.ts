<<<<<<< HEAD
import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { Formation } from '../models/Formation.entity';
import { Session, StatutSession } from '../models/Session.entity';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
import { Attestation } from '../models/Attestation.entity';
import { Presence } from '../models/Presence.entity';

export class DashboardService {
  /**
   * Statistiques globales (ADMIN)
   */
  static async getAdminStats() {
    const userRepo = AppDataSource.getRepository(User);
    const formationRepo = AppDataSource.getRepository(Formation);
    const sessionRepo = AppDataSource.getRepository(Session);
    const inscriptionRepo = AppDataSource.getRepository(Inscription);
    const attestationRepo = AppDataSource.getRepository(Attestation);

    const [
      totalUsers,
      totalFormations,
      totalSessions,
      sessionsEnCours,
      totalInscriptions,
      inscriptionsEnAttente,
      totalAttestations,
    ] = await Promise.all([
      userRepo.count({ where: { actif: true } }),
      formationRepo.count({ where: { actif: true } }),
      sessionRepo.count(),
      sessionRepo.count({ where: { statut: StatutSession.EN_COURS } }),
      inscriptionRepo.count(),
      inscriptionRepo.count({ where: { statut: StatutInscription.EN_ATTENTE } }),
      attestationRepo.count(),
    ]);

    // Répartition par rôle
    const usersByRole = await userRepo
      .createQueryBuilder('u')
      .leftJoin('u.role', 'r')
      .select('r.nom', 'role')
      .addSelect('COUNT(u.id)', 'count')
      .where('u.actif = true')
      .groupBy('r.nom')
      .getRawMany();

    // Top 5 formations
    const topFormations = await inscriptionRepo
      .createQueryBuilder('i')
      .leftJoin('i.session', 's')
      .leftJoin('s.formation', 'f')
      .select('f.titre', 'titre')
      .addSelect('COUNT(i.id)', 'inscriptions')
      .where('i.statut = :statut', { statut: StatutInscription.ACCEPTEE })
      .groupBy('f.titre')
      .orderBy('inscriptions', 'DESC')
      .limit(5)
      .getRawMany();

    // Inscriptions mensuelles (12 derniers mois)
    const inscriptionsParMois = await inscriptionRepo
      .createQueryBuilder('i')
      .select("TO_CHAR(i.date_inscription, 'YYYY-MM')", 'mois')
      .addSelect('COUNT(i.id)', 'count')
      .where("i.date_inscription >= NOW() - INTERVAL '12 months'")
      .groupBy('mois')
      .orderBy('mois', 'ASC')
      .getRawMany();

    return {
      kpis: {
        totalUsers,
        totalFormations,
        totalSessions,
=======
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
      /* -------------------- KPIs -------------------- */
      const [
        totalUsers,
        usersActifs,
        totalFormations,
        formationsPubliees,
        totalSessions,
        sessionsOuvertes,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
        sessionsEnCours,
        totalInscriptions,
        inscriptionsEnAttente,
        totalAttestations,
<<<<<<< HEAD
      },
      usersByRole,
      topFormations,
      inscriptionsParMois,
    };
  }

  /**
   * Stats pour STAFF ODC
   */
  static async getStaffStats() {
    const inscriptionRepo = AppDataSource.getRepository(Inscription);
    const sessionRepo = AppDataSource.getRepository(Session);
    const presenceRepo = AppDataSource.getRepository(Presence);

    const enAttente = await inscriptionRepo.count({
      where: { statut: StatutInscription.EN_ATTENTE },
    });

    const sessionsActives = await sessionRepo.count({
      where: { statut: StatutSession.EN_COURS },
    });

    const inscriptionsDuJour = await inscriptionRepo
      .createQueryBuilder('i')
      .where('DATE(i.date_inscription) = CURRENT_DATE')
      .getCount();

    const tauxPresenceMoyen = await presenceRepo
      .createQueryBuilder('p')
      .select('AVG(CASE WHEN p.present THEN 100 ELSE 0 END)', 'taux')
      .getRawOne();

    return {
      inscriptionsEnAttente: enAttente,
      sessionsActives,
      inscriptionsDuJour,
      tauxPresenceMoyen: Number(tauxPresenceMoyen.taux || 0).toFixed(2),
    };
  }

  /**
   * Stats pour FORMATEUR
   */
  static async getFormateurStats(formateurId: string) {
    const sessionRepo = AppDataSource.getRepository(Session);
    const presenceRepo = AppDataSource.getRepository(Presence);

    const mesSessions = await sessionRepo.find({
=======
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

      /* -------------------- Users by role -------------------- */
      const usersByRole = await this.getUsersByRole();

      /* -------------------- Top formations -------------------- */
      const topFormations = await formationRepo()
        .createQueryBuilder('f')
        .leftJoin('f.sessions', 's')
        .leftJoin('s.inscriptions', 'i')
        .leftJoin('f.domaineRelation', 'd')
        .select('f.id', 'id')
        .addSelect('f.titre', 'titre')
        .addSelect('f.slug', 'slug')
        .addSelect('d.nom', 'domaine')
        .addSelect('COUNT(i.id)', 'inscriptions')
        .where('f.estPubliee = :pub', { pub: true })
        .andWhere('f.deletedAt IS NULL')
        .groupBy('f.id')
        .addGroupBy('f.titre')
        .addGroupBy('f.slug')
        .addGroupBy('d.nom')
        .orderBy('inscriptions', 'DESC')
        .limit(5)
        .getRawMany()
        .then((rows) =>
          rows.map((r) => ({
            id: r.id,
            titre: r.titre,
            slug: r.slug,
            domaine: r.domaine ?? 'Sans domaine',
            inscriptions: Number(r.inscriptions),
          })),
        );

      /* -------------------- Inscriptions par mois -------------------- */
      const inscriptionsParMois = await inscriptionRepo()
        .createQueryBuilder('i')
        .select("TO_CHAR(i.createdAt, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(i.id)', 'count')
        .where("i.createdAt >= NOW() - INTERVAL '12 months'")
        .groupBy("TO_CHAR(i.createdAt, 'YYYY-MM')")
        .orderBy('mois', 'ASC')
        .getRawMany()
        .then((rows) =>
          rows.map((r) => ({ mois: r.mois, count: Number(r.count) })),
        );

      /* -------------------- Formations par domaine -------------------- */
      const formationsByDomaine = await formationRepo()
        .createQueryBuilder('f')
        .leftJoin('f.domaineRelation', 'd')
        .select('d.nom', 'domaine')
        .addSelect('d.couleur', 'couleur')
        .addSelect('COUNT(f.id)', 'count')
        .where('f.estPubliee = :pub', { pub: true })
        .andWhere('f.deletedAt IS NULL')
        .groupBy('d.nom')
        .addGroupBy('d.couleur')
        .getRawMany()
        .then((rows) =>
          rows.map((r) => ({
            domaine: r.domaine ?? 'Sans domaine',
            couleur: r.couleur ?? '#6B7280',
            count: Number(r.count),
          })),
        );

      /* -------------------- Sessions par statut -------------------- */
      const sessionsParStatut = await sessionRepo()
        .createQueryBuilder('s')
        .select('s.statut', 'statut')
        .addSelect('COUNT(s.id)', 'count')
        .where('s.deletedAt IS NULL')
        .groupBy('s.statut')
        .getRawMany()
        .then((rows) =>
          rows.map((r) => ({
            statut: r.statut as string,
            count: Number(r.count),
          })),
        );

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
      throw e;
    }
  }

  /* ==========================================================================
     👔 STAFF ODC
     ========================================================================== */
  static async getStaffStats(): Promise<StaffStats> {
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
  }

  /* ==========================================================================
     👨‍🏫 FORMATEUR
     ========================================================================== */
  static async getFormateurStats(formateurId: string): Promise<FormateurStats> {
    const mesSessions = await sessionRepo().find({
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      where: { formateurId },
      relations: ['formation'],
      order: { dateDebut: 'DESC' },
    });

<<<<<<< HEAD
    const sessionsEnCours = mesSessions.filter(
      (s) => s.statut === StatutSession.EN_COURS
    ).length;

    const totalParticipants = await sessionRepo
      .createQueryBuilder('s')
      .leftJoin('s.inscriptions', 'i')
      .where('s.formateur_id = :fid', { fid: formateurId })
      .andWhere('i.statut = :st', { st: StatutInscription.ACCEPTEE })
      .getCount();

    const prochainesSessions = mesSessions
      .filter((s) => new Date(s.dateDebut) > new Date())
      .slice(0, 5);
=======
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
    const tauxPresenceMoyen = await this.calculerTauxPresenceParFormateur(
      formateurId,
    );

    /* -------------------- Prochaines sessions -------------------- */
    const prochainesSessions = mesSessions
      .filter((s) => new Date(s.dateDebut) > now)
      .sort(
        (a, b) =>
          new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime(),
      )
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        code: s.codeSession,
        formation: s.formation?.titre ?? '',
        dateDebut: s.dateDebut,
        lieu: s.lieu,
      }));
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

    return {
      totalSessions: mesSessions.length,
      sessionsEnCours,
<<<<<<< HEAD
      totalParticipants,
=======
      sessionsTerminees,
      totalParticipants,
      tauxPresenceMoyen,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      prochainesSessions,
    };
  }

<<<<<<< HEAD
  /**
   * Stats pour PARTICIPANT
   */
  static async getParticipantStats(participantId: string) {
    const inscriptionRepo = AppDataSource.getRepository(Inscription);
    const attestationRepo = AppDataSource.getRepository(Attestation);

    const mesInscriptions = await inscriptionRepo.find({
      where: { participantId },
      relations: ['session', 'session.formation'],
      order: { dateInscription: 'DESC' },
    });

    const enCours = mesInscriptions.filter(
      (i) => i.session?.statut === StatutSession.EN_COURS
    ).length;

    const terminees = mesInscriptions.filter(
      (i) => i.session?.statut === StatutSession.TERMINEE
    ).length;

    const attestations = await attestationRepo.count({
      where: { participantId },
    });

=======
  /* ==========================================================================
     🎓 PARTICIPANT
     ========================================================================== */
  static async getParticipantStats(
    participantId: string,
  ): Promise<ParticipantStats> {
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
      .filter((i) => i.session && new Date(i.session.dateDebut) > now)
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
        lieu: i.session.lieu,
      }));

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    return {
      totalInscriptions: mesInscriptions.length,
      formationsEnCours: enCours,
      formationsTerminees: terminees,
<<<<<<< HEAD
      attestationsObtenues: attestations,
      prochainesSessions: mesInscriptions
        .filter((i) => i.session && new Date(i.session.dateDebut) > new Date())
        .slice(0, 5),
    };
  }

  /**
   * Stats publiques pour PARTENAIRE (anonymisées)
   */
  static async getPartenaireStats() {
    const formationRepo = AppDataSource.getRepository(Formation);
    const sessionRepo = AppDataSource.getRepository(Session);
    const inscriptionRepo = AppDataSource.getRepository(Inscription);
    const attestationRepo = AppDataSource.getRepository(Attestation);

    const [
      totalFormations,
      totalSessions,
      totalParticipants,
      totalAttestations,
    ] = await Promise.all([
      formationRepo.count({ where: { actif: true } }),
      sessionRepo.count(),
      inscriptionRepo.count({ where: { statut: StatutInscription.ACCEPTEE } }),
      attestationRepo.count(),
    ]);

    // Répartition par domaine
    const parDomaine = await formationRepo
      .createQueryBuilder('f')
      .select('f.domaine', 'domaine')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.actif = true')
      .groupBy('f.domaine')
      .getRawMany();
=======
      attestationsObtenues,
      tauxPresenceMoyen,
      prochainesSessions,
    };
  }

  /* ==========================================================================
     🤝 PARTENAIRE
     ========================================================================== */
  static async getPartenaireStats(): Promise<PartenaireStats> {
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
    const parDomaine = await formationRepo()
      .createQueryBuilder('f')
      .leftJoin('f.domaineRelation', 'd')
      .select('COALESCE(d.nom, :default)', 'domaine')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.estPubliee = :pub', { pub: true })
      .andWhere('f.deletedAt IS NULL')
      .setParameter('default', 'Sans domaine')
      .groupBy('COALESCE(d.nom, :default)')
      .orderBy('count', 'DESC')
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({
          domaine: r.domaine ?? 'Sans domaine',
          count: Number(r.count),
        })),
      );
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

    return {
      chiffres: {
        totalFormations,
        totalSessions,
        totalParticipants,
        totalAttestations,
      },
<<<<<<< HEAD
      parDomaine,
    };
  }
=======
      formationsPubliees,
      sessionsPubliques,
      parDomaine,
    };
  }

  /* ==========================================================================
     🔒 HELPERS PRIVÉS
     ========================================================================== */

  /** Répartition des utilisateurs par rôle */
  private static async getUsersByRole(): Promise<
    Array<{ role: string; count: number }>
  > {
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
      role: r.role as string,
      count: Number(r.count),
    }));
  }

  /** Nombre d'inscriptions créées aujourd'hui */
  private static async compterInscriptionsDuJour(): Promise<number> {
    return inscriptionRepo()
      .createQueryBuilder('i')
      .where('DATE(i.createdAt) = CURRENT_DATE')
      .getCount();
  }

  /* ==========================================================================
     ⭐⭐ CORRECTION CRITIQUE — Taux de présence
     ==========================================================================
     
     ❌ AVANT : `p.present = true` (colonne inexistante)
     ✅ APRÈS : `p.statut = 'PRESENT'` (enum StatutPresence)
     
     ========================================================================== */

  /**
   * Taux de présence global (toutes sessions confondues)
   */
  private static async calculerTauxPresenceGlobal(): Promise<number> {
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

    return total === 0 ? 0 : Math.round((presents / total) * 10000) / 100;
  }

  /**
   * Taux de présence par formateur
   */
  private static async calculerTauxPresenceParFormateur(
    formateurId: string,
  ): Promise<number> {
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

    return total === 0 ? 0 : Math.round((presents / total) * 10000) / 100;
  }

  /**
   * Taux de présence par participant
   */
  private static async calculerTauxPresenceParParticipant(
    participantId: string,
  ): Promise<number> {
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

    return total === 0 ? 0 : Math.round((presents / total) * 10000) / 100;
  }

  /* ==========================================================================
     Trends : comparaison mois courant vs mois précédent
     ========================================================================== */
  private static async computeTrends() {
    try {
      const now = new Date();
      const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
}