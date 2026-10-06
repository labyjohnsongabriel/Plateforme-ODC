// src/services/dashboard.service.ts
import { Between, In } from 'typeorm';

import { userRepository }        from '../repositories/user.repository';
import { formationRepository }   from '../repositories/formation.repository';
import { sessionRepository }     from '../repositories/session.repository';
import { inscriptionRepository } from '../repositories/inscription.repository';
import { attestationRepository } from '../repositories/attestation.repository';
import { presenceRepository }    from '../repositories/presence.repository';

import {
  RoleName,
  StatutSession,
  StatutInscription,
} from '../entities/enums';

import { logger } from '../config/logger';

// =============================================================================
// TYPES DE RETOUR (typage strict pour le front)
// =============================================================================

export interface KpiCard {
  value: number;
  label: string;
  trend?: number;
}

export interface AdminStats {
  kpis: {
    totalUsers: number;
    totalFormations: number;
    totalSessions: number;
    sessionsEnCours: number;
    totalInscriptions: number;
    inscriptionsEnAttente: number;
    totalAttestations: number;
    tauxPresenceMoyen: number;
  };
  usersByRole: Array<{ role: RoleName; count: number }>;
  topFormations: Array<{ titre: string; inscriptions: number }>;
  inscriptionsParMois: Array<{ mois: string; count: number }>;
  sessionsParStatut: Array<{ statut: StatutSession; count: number }>;
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
  parDomaine: Array<{ domaine: string; count: number }>;
  sessionsPubliques: number;
  formationsPubliees: number;
}

// =============================================================================
// SERVICE
// =============================================================================

export class DashboardService {
  // ==========================================================================
  // 🎯 POINT D'ENTRÉE UNIFIÉ (utilisé par /api/dashboard/me)
  // ==========================================================================
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

  // ==========================================================================
  // 👑 ADMINISTRATEUR — statistiques globales
  // ==========================================================================
  static async getAdminStats(): Promise<AdminStats> {
    try {
      // --- KPIs en parallèle ---
      const [
        totalUsers,
        totalFormations,
        totalSessions,
        sessionsEnCours,
        totalInscriptions,
        inscriptionsEnAttente,
        totalAttestations,
        tauxPresenceMoyen,
      ] = await Promise.all([
        userRepository.count({ actif: true } as any),
        formationRepository.count({ actif: true } as any),
        sessionRepository.count(),
        sessionRepository.count({ statut: StatutSession.EN_COURS } as any),
        inscriptionRepository.count(),
        inscriptionRepository.count({ statut: StatutInscription.EN_ATTENTE } as any),
        attestationRepository.countValid(),
        this.calculerTauxPresenceGlobal(),
      ]);

      // --- Répartition par rôle ---
      const usersByRole = await this.getUsersByRole();

      // --- Top 5 formations par inscriptions acceptées ---
      const topFormations = await inscriptionRepository.raw
        .createQueryBuilder('i')
        .leftJoin('i.session', 's')
        .leftJoin('s.formation', 'f')
        .select('f.titre', 'titre')
        .addSelect('COUNT(i.id)', 'inscriptions')
        .where('i.statut = :statut', { statut: StatutInscription.ACCEPTEE })
        .groupBy('f.titre')
        .orderBy('inscriptions', 'DESC')
        .limit(5)
        .getRawMany()
        .then((rows) =>
          rows.map((r) => ({ titre: r.titre, inscriptions: Number(r.inscriptions) })),
        );

      // --- Inscriptions mensuelles (12 derniers mois) ---
      const inscriptionsParMois = await inscriptionRepository.raw
        .createQueryBuilder('i')
        .select("TO_CHAR(i.date_inscription, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(i.id)', 'count')
        .where("i.date_inscription >= NOW() - INTERVAL '12 months'")
        .groupBy('mois')
        .orderBy('mois', 'ASC')
        .getRawMany()
        .then((rows) =>
          rows.map((r) => ({ mois: r.mois, count: Number(r.count) })),
        );

      // --- Répartition des sessions par statut ---
      const sessionsParStatut = await sessionRepository.raw
        .createQueryBuilder('s')
        .select('s.statut', 'statut')
        .addSelect('COUNT(s.id)', 'count')
        .groupBy('s.statut')
        .getRawMany()
        .then((rows) =>
          rows.map((r) => ({
            statut: r.statut as StatutSession,
            count: Number(r.count),
          })),
        );

      return {
        kpis: {
          totalUsers,
          totalFormations,
          totalSessions,
          sessionsEnCours,
          totalInscriptions,
          inscriptionsEnAttente,
          totalAttestations,
          tauxPresenceMoyen,
        },
        usersByRole,
        topFormations,
        inscriptionsParMois,
        sessionsParStatut,
      };
    } catch (e: any) {
      logger.error(`❌ getAdminStats : ${e.message}`);
      throw e;
    }
  }

  // ==========================================================================
  // 👔 STAFF ODC — statistiques opérationnelles
  // ==========================================================================
  static async getStaffStats(): Promise<StaffStats> {
    const [
      inscriptionsEnAttente,
      sessionsActives,
      inscriptionsDuJour,
      tauxPresenceMoyen,
    ] = await Promise.all([
      inscriptionRepository.count({ statut: StatutInscription.EN_ATTENTE } as any),
      sessionRepository.count({ statut: StatutSession.EN_COURS } as any),
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

  // ==========================================================================
  // 👨‍🏫 FORMATEUR — mes sessions et participants
  // ==========================================================================
  static async getFormateurStats(formateurId: string): Promise<FormateurStats> {
    const mesSessions = await sessionRepository.raw.find({
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

    // --- Total participants acceptés sur toutes mes sessions ---
    const sessionIds = mesSessions.map((s) => s.id);
    let totalParticipants = 0;
    if (sessionIds.length > 0) {
      totalParticipants = await inscriptionRepository.count({
        sessionId: In(sessionIds),
        statut: StatutInscription.ACCEPTEE,
      } as any);
    }

    // --- Taux de présence moyen sur mes sessions ---
    const tauxPresenceMoyen = await this.calculerTauxPresenceParFormateur(formateurId);

    // --- Prochaines sessions triées par date ---
    const prochainesSessions = mesSessions
      .filter((s) => new Date(s.dateDebut) > now)
      .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        code: s.codeSession,
        formation: s.formation?.titre ?? '',
        dateDebut: s.dateDebut,
        lieu: s.lieu,
      }));

    return {
      totalSessions: mesSessions.length,
      sessionsEnCours,
      sessionsTerminees,
      totalParticipants,
      tauxPresenceMoyen,
      prochainesSessions,
    };
  }

  // ==========================================================================
  // 🎓 PARTICIPANT — mon parcours
  // ==========================================================================
  static async getParticipantStats(participantId: string): Promise<ParticipantStats> {
    const mesInscriptions = await inscriptionRepository.raw.find({
      where: { participantId },
      relations: ['session', 'session.formation'],
      order: { dateInscription: 'DESC' },
    });

    const now = new Date();

    const enCours = mesInscriptions.filter(
      (i) => i.session?.statut === StatutSession.EN_COURS,
    ).length;

    const terminees = mesInscriptions.filter(
      (i) => i.session?.statut === StatutSession.TERMINEE,
    ).length;

    // --- Attestations valides uniquement ---
    const attestationsObtenues = await attestationRepository.count({
      participantId,
      valide: true,
    } as any);

    // --- Taux de présence moyen sur toutes mes sessions ---
    const tauxPresenceMoyen = await this.calculerTauxPresenceParParticipant(participantId);

    // --- Prochaines sessions triées ---
    const prochainesSessions = mesInscriptions
      .filter((i) => i.session && new Date(i.session.dateDebut) > now)
      .sort((a, b) =>
        new Date(a.session.dateDebut).getTime() - new Date(b.session.dateDebut).getTime(),
      )
      .slice(0, 5)
      .map((i) => ({
        inscriptionId: i.id,
        formation: i.session.formation?.titre ?? '',
        dateDebut: i.session.dateDebut,
        statut: i.statut,
        lieu: i.session.lieu,
      }));

    return {
      totalInscriptions: mesInscriptions.length,
      formationsEnCours: enCours,
      formationsTerminees: terminees,
      attestationsObtenues,
      tauxPresenceMoyen,
      prochainesSessions,
    };
  }

  // ==========================================================================
  // 🤝 PARTENAIRE — statistiques publiques (anonymisées)
  // ==========================================================================
  static async getPartenaireStats(): Promise<PartenaireStats> {
    const [
      totalFormations,
      formationsPubliees,
      totalSessions,
      sessionsPubliques,
      totalParticipants,
      totalAttestations,
    ] = await Promise.all([
      formationRepository.count({ actif: true } as any),
      formationRepository.count({ estPubliee: true, actif: true } as any),
      sessionRepository.count(),
      sessionRepository.count({ estPubliee: true } as any),
      inscriptionRepository.count({ statut: StatutInscription.ACCEPTEE } as any),
      attestationRepository.countValid(),
    ]);

    // Répartition par domaine
    const parDomaine = await formationRepository.raw
      .createQueryBuilder('f')
      .leftJoin('f.domaineRelation', 'd')
      .select('COALESCE(d.nom, f.domaine)', 'domaine')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.actif = true')
      .andWhere('f.est_publiee = true')
      .groupBy('COALESCE(d.nom, f.domaine)')
      .orderBy('count', 'DESC')
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({ domaine: r.domaine, count: Number(r.count) })),
      );

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
  }

  // ==========================================================================
  // 🔒 HELPERS PRIVÉS
  // ==========================================================================

  /** Répartition des utilisateurs par rôle */
  private static async getUsersByRole(): Promise<Array<{ role: RoleName; count: number }>> {
    const rows = await userRepository.raw
      .createQueryBuilder('u')
      .leftJoin('u.role', 'r')
      .select('r.nom', 'role')
      .addSelect('COUNT(u.id)', 'count')
      .where('u.actif = true')
      .groupBy('r.nom')
      .getRawMany();

    return rows.map((r) => ({
      role: r.role as RoleName,
      count: Number(r.count),
    }));
  }

  /** Nombre d'inscriptions créées aujourd'hui */
  private static async compterInscriptionsDuJour(): Promise<number> {
    return inscriptionRepository.raw
      .createQueryBuilder('i')
      .where('DATE(i.date_inscription) = CURRENT_DATE')
      .getCount();
  }

  /**
   * Taux de présence GLOBAL (toutes sessions confondues).
   * Formule correcte : présents / total * 100
   */
  private static async calculerTauxPresenceGlobal(): Promise<number> {
    const raw = await presenceRepository.raw
      .createQueryBuilder('p')
      .select('COUNT(p.id)', 'total')
      .addSelect('SUM(CASE WHEN p.present = true THEN 1 ELSE 0 END)', 'presents')
      .getRawOne();

    const total = Number(raw?.total ?? 0);
    const presents = Number(raw?.presents ?? 0);
    return total === 0 ? 0 : Math.round((presents / total) * 10000) / 100;
  }

  /** Taux de présence moyen sur les sessions d'un formateur */
  private static async calculerTauxPresenceParFormateur(formateurId: string): Promise<number> {
    const raw = await presenceRepository.raw
      .createQueryBuilder('p')
      .leftJoin('p.session', 's')
      .select('COUNT(p.id)', 'total')
      .addSelect('SUM(CASE WHEN p.present = true THEN 1 ELSE 0 END)', 'presents')
      .where('s.formateur_id = :fid', { fid: formateurId })
      .getRawOne();

    const total = Number(raw?.total ?? 0);
    const presents = Number(raw?.presents ?? 0);
    return total === 0 ? 0 : Math.round((presents / total) * 10000) / 100;
  }

  /** Taux de présence moyen d'un participant */
  private static async calculerTauxPresenceParParticipant(participantId: string): Promise<number> {
    const raw = await presenceRepository.raw
      .createQueryBuilder('p')
      .select('COUNT(p.id)', 'total')
      .addSelect('SUM(CASE WHEN p.present = true THEN 1 ELSE 0 END)', 'presents')
      .where('p.participant_id = :pid', { pid: participantId })
      .getRawOne();

    const total = Number(raw?.total ?? 0);
    const presents = Number(raw?.presents ?? 0);
    return total === 0 ? 0 : Math.round((presents / total) * 10000) / 100;
  }
}