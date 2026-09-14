import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { Formation } from '../models/Formation.entity';
import { Session, StatutSession } from '../models/Session.entity';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
import { Presence } from '../models/Presence.entity';
import { Attestation } from '../models/Attestation.entity';
import { Note } from '../models/Note.entity';

export class StatsService {
  /**
   * Statistiques détaillées par formation
   */
  static async parFormation(formationId: string) {
    const sessions = await AppDataSource.getRepository(Session).find({
      where: { formationId },
      relations: ['inscriptions', 'formateur'],
    });

    const totalInscriptions = sessions.reduce(
      (s, sess) => s + (sess.inscriptions?.length || 0),
      0
    );

    const acceptees = sessions.reduce(
      (s, sess) =>
        s +
        (sess.inscriptions?.filter(
          (i) => i.statut === StatutInscription.ACCEPTEE
        ).length || 0),
      0
    );

    return {
      formationId,
      sessionsCount: sessions.length,
      totalInscriptions,
      acceptees,
      tauxAcceptation:
        totalInscriptions > 0
          ? Math.round((acceptees / totalInscriptions) * 100)
          : 0,
      sessions,
    };
  }

  /**
   * Statistiques par formateur
   */
  static async parFormateur(formateurId: string) {
    const sessions = await AppDataSource.getRepository(Session).find({
      where: { formateurId },
      relations: ['formation', 'inscriptions'],
    });

    const formationIds = [...new Set(sessions.map((s) => s.formationId))];

    // Moyenne des notes données par ce formateur
    const moyenneNotes = await AppDataSource.getRepository(Note)
      .createQueryBuilder('n')
      .leftJoin('n.evaluation', 'e')
      .leftJoin('e.session', 's')
      .select('AVG(n.note)', 'moyenne')
      .addSelect('COUNT(n.id)', 'total')
      .where('s.formateur_id = :fid', { fid: formateurId })
      .getRawOne();

    return {
      formateurId,
      totalSessions: sessions.length,
      totalFormations: formationIds.length,
      totalParticipants: sessions.reduce(
        (sum, s) => sum + (s.inscriptions?.length || 0),
        0
      ),
      noteMoyenneDonnee: Math.round(Number(moyenneNotes.moyenne || 0) * 100) / 100,
      totalNotesDonnees: Number(moyenneNotes.total || 0),
      sessions,
    };
  }

  /**
   * Statistiques par participant
   */
  static async parParticipant(participantId: string) {
    const inscriptions = await AppDataSource.getRepository(Inscription).find({
      where: { participantId },
      relations: ['session', 'session.formation'],
    });

    const notes = await AppDataSource.getRepository(Note)
      .createQueryBuilder('n')
      .leftJoin('n.evaluation', 'e')
      .where('n.participant_id = :pid', { pid: participantId })
      .getMany();

    const moyenne =
      notes.length > 0
        ? Math.round(
            (notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) * 100
          ) / 100
        : 0;

    const attestations = await AppDataSource.getRepository(Attestation).count({
      where: { participantId },
    });

    return {
      participantId,
      totalFormations: inscriptions.length,
      formationsTerminees: inscriptions.filter(
        (i) => i.session?.statut === StatutSession.TERMINEE
      ).length,
      formationsEnCours: inscriptions.filter(
        (i) => i.session?.statut === StatutSession.EN_COURS
      ).length,
      noteMoyenne: moyenne,
      totalEvaluations: notes.length,
      attestationsObtenues: attestations,
    };
  }

  /**
   * Statistiques par domaine
   */
  static async parDomaine() {
    const result = await AppDataSource.getRepository(Formation)
      .createQueryBuilder('f')
      .leftJoin('f.sessions', 's')
      .leftJoin('s.inscriptions', 'i')
      .select('f.domaine', 'domaine')
      .addSelect('COUNT(DISTINCT f.id)', 'formations')
      .addSelect('COUNT(DISTINCT s.id)', 'sessions')
      .addSelect('COUNT(DISTINCT i.id)', 'inscriptions')
      .where('f.actif = true')
      .groupBy('f.domaine')
      .getRawMany();

    return result.map((r) => ({
      domaine: r.domaine,
      formations: Number(r.formations || 0),
      sessions: Number(r.sessions || 0),
      inscriptions: Number(r.inscriptions || 0),
    }));
  }

  /**
   * Taux de présence global
   */
  static async tauxPresenceGlobal() {
    const stats = await AppDataSource.getRepository(Presence)
      .createQueryBuilder('p')
      .select('COUNT(DISTINCT p.participant_id)', 'participants')
      .addSelect('COUNT(CASE WHEN p.present THEN 1 END)', 'presences')
      .addSelect('COUNT(CASE WHEN NOT p.present THEN 1 END)', 'absences')
      .getRawOne();

    const total = Number(stats.presences) + Number(stats.absences);
    const taux = total > 0 ? (Number(stats.presences) / total) * 100 : 0;

    return {
      participants: Number(stats.participants || 0),
      presences: Number(stats.presences || 0),
      absences: Number(stats.absences || 0),
      tauxPresence: Math.round(taux * 100) / 100,
    };
  }

  /**
   * Évolution mensuelle (12 derniers mois)
   */
  static async evolutionMensuelle() {
    const [inscriptions, attestations, sessions] = await Promise.all([
      AppDataSource.getRepository(Inscription)
        .createQueryBuilder('i')
        .select("TO_CHAR(i.date_inscription, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(i.id)', 'count')
        .where("i.date_inscription >= NOW() - INTERVAL '12 months'")
        .groupBy('mois')
        .orderBy('mois', 'ASC')
        .getRawMany(),

      AppDataSource.getRepository(Attestation)
        .createQueryBuilder('a')
        .select("TO_CHAR(a.date_emission, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(a.id)', 'count')
        .where("a.date_emission >= NOW() - INTERVAL '12 months'")
        .groupBy('mois')
        .orderBy('mois', 'ASC')
        .getRawMany(),

      AppDataSource.getRepository(Session)
        .createQueryBuilder('s')
        .select("TO_CHAR(s.date_debut, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(s.id)', 'count')
        .where("s.date_debut >= NOW() - INTERVAL '12 months'")
        .groupBy('mois')
        .orderBy('mois', 'ASC')
        .getRawMany(),
    ]);

    return { inscriptions, attestations, sessions };
  }

  /**
   * Répartition des utilisateurs par rôle
   */
  static async repartitionRoles() {
    return AppDataSource.getRepository(User)
      .createQueryBuilder('u')
      .leftJoin('u.role', 'r')
      .select('r.nom', 'role')
      .addSelect('COUNT(u.id)', 'count')
      .where('u.actif = true')
      .groupBy('r.nom')
      .getRawMany();
  }

  /**
   * Répartition des sessions par statut
   */
  static async repartitionSessions() {
    return AppDataSource.getRepository(Session)
      .createQueryBuilder('s')
      .select('s.statut', 'statut')
      .addSelect('COUNT(s.id)', 'count')
      .groupBy('s.statut')
      .getRawMany();
  }

  /**
   * Top formations (les plus demandées)
   */
  static async topFormations(limit = 10) {
    return AppDataSource.getRepository(Formation)
      .createQueryBuilder('f')
      .leftJoin('f.sessions', 's')
      .leftJoin('s.inscriptions', 'i')
      .select('f.id', 'id')
      .addSelect('f.titre', 'titre')
      .addSelect('f.domaine', 'domaine')
      .addSelect('COUNT(i.id)', 'inscriptions')
      .where('i.statut = :statut', { statut: StatutInscription.ACCEPTEE })
      .groupBy('f.id')
      .addGroupBy('f.titre')
      .addGroupBy('f.domaine')
      .orderBy('inscriptions', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  /**
   * Toutes les statistiques en un seul appel (dashboard complet)
   */
  static async toutes() {
    const [
      tauxPresence,
      evolution,
      roles,
      sessions,
      top,
      domaines,
    ] = await Promise.all([
      this.tauxPresenceGlobal(),
      this.evolutionMensuelle(),
      this.repartitionRoles(),
      this.repartitionSessions(),
      this.topFormations(),
      this.parDomaine(),
    ]);

    return {
      tauxPresence,
      evolution,
      repartitionRoles: roles,
      repartitionSessions: sessions,
      topFormations: top,
      parDomaine: domaines,
    };
  }
}