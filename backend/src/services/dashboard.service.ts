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
        sessionsEnCours,
        totalInscriptions,
        inscriptionsEnAttente,
        totalAttestations,
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
      where: { formateurId },
      relations: ['formation'],
      order: { dateDebut: 'DESC' },
    });

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

    return {
      totalSessions: mesSessions.length,
      sessionsEnCours,
      totalParticipants,
      prochainesSessions,
    };
  }

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

    return {
      totalInscriptions: mesInscriptions.length,
      formationsEnCours: enCours,
      formationsTerminees: terminees,
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

    return {
      chiffres: {
        totalFormations,
        totalSessions,
        totalParticipants,
        totalAttestations,
      },
      parDomaine,
    };
  }
}