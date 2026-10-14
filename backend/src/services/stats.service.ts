<<<<<<< HEAD
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
=======
// src/services/stats.service.ts
import { userRepository }        from '../repositories/user.repository';
import { formationRepository }   from '../repositories/formation.repository';
import { sessionRepository }     from '../repositories/session.repository';
import { inscriptionRepository } from '../repositories/inscription.repository';
import { presenceRepository }    from '../repositories/presence.repository';
import { attestationRepository } from '../repositories/attestation.repository';
import { noteRepository }        from '../repositories/note.repository';
import { StatutInscription, StatutSession, RoleName } from '../entities/enums';
import { logger } from '../config/logger';

export class StatsService {
  // ==========================================================================
  // 📚 PAR FORMATION
  // ==========================================================================
  static async parFormation(formationId: string) {
    const sessions = await sessionRepository.raw.find({
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      where: { formationId },
      relations: ['inscriptions', 'formateur'],
    });

    const totalInscriptions = sessions.reduce(
<<<<<<< HEAD
      (s, sess) => s + (sess.inscriptions?.length || 0),
      0
=======
      (s, sess) => s + (sess.inscriptions?.length ?? 0),
      0,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    );

    const acceptees = sessions.reduce(
      (s, sess) =>
        s +
        (sess.inscriptions?.filter(
<<<<<<< HEAD
          (i) => i.statut === StatutInscription.ACCEPTEE
        ).length || 0),
      0
=======
          (i) => i.statut === StatutInscription.ACCEPTEE,
        ).length ?? 0),
      0,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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
<<<<<<< HEAD
      sessions,
    };
  }

  /**
   * Statistiques par formateur
   */
  static async parFormateur(formateurId: string) {
    const sessions = await AppDataSource.getRepository(Session).find({
=======
    };
  }

  // ==========================================================================
  // 👨‍🏫 PAR FORMATEUR
  // ==========================================================================
  static async parFormateur(formateurId: string) {
    const sessions = await sessionRepository.raw.find({
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      where: { formateurId },
      relations: ['formation', 'inscriptions'],
    });

    const formationIds = [...new Set(sessions.map((s) => s.formationId))];

<<<<<<< HEAD
    // Moyenne des notes données par ce formateur
    const moyenneNotes = await AppDataSource.getRepository(Note)
=======
    const moyenneNotes = await noteRepository.raw
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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
<<<<<<< HEAD
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
=======
        (sum, s) => sum + (s.inscriptions?.length ?? 0),
        0,
      ),
      noteMoyenneDonnee: Math.round(Number(moyenneNotes?.moyenne ?? 0) * 100) / 100,
      totalNotesDonnees: Number(moyenneNotes?.total ?? 0),
    };
  }

  // ==========================================================================
  // 🎓 PAR PARTICIPANT
  // ==========================================================================
  static async parParticipant(participantId: string) {
    const inscriptions = await inscriptionRepository.raw.find({
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      where: { participantId },
      relations: ['session', 'session.formation'],
    });

<<<<<<< HEAD
    const notes = await AppDataSource.getRepository(Note)
      .createQueryBuilder('n')
      .leftJoin('n.evaluation', 'e')
      .where('n.participant_id = :pid', { pid: participantId })
      .getMany();
=======
    const notes = await noteRepository.raw.find({
      where: { participantId },
      relations: ['evaluation'],
    });
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

    const moyenne =
      notes.length > 0
        ? Math.round(
<<<<<<< HEAD
            (notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) * 100
          ) / 100
        : 0;

    const attestations = await AppDataSource.getRepository(Attestation).count({
      where: { participantId },
    });
=======
            (notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) * 100,
          ) / 100
        : 0;

    const attestations = await attestationRepository.count({
      participantId,
      valide: true,
    } as any);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

    return {
      participantId,
      totalFormations: inscriptions.length,
      formationsTerminees: inscriptions.filter(
<<<<<<< HEAD
        (i) => i.session?.statut === StatutSession.TERMINEE
      ).length,
      formationsEnCours: inscriptions.filter(
        (i) => i.session?.statut === StatutSession.EN_COURS
=======
        (i) => i.session?.statut === StatutSession.TERMINEE,
      ).length,
      formationsEnCours: inscriptions.filter(
        (i) => i.session?.statut === StatutSession.EN_COURS,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      ).length,
      noteMoyenne: moyenne,
      totalEvaluations: notes.length,
      attestationsObtenues: attestations,
    };
  }

<<<<<<< HEAD
  /**
   * Statistiques par domaine
   */
  static async parDomaine() {
    const result = await AppDataSource.getRepository(Formation)
      .createQueryBuilder('f')
      .leftJoin('f.sessions', 's')
      .leftJoin('s.inscriptions', 'i')
      .select('f.domaine', 'domaine')
=======
  // ==========================================================================
  // 🏷️ PAR DOMAINE
  // ==========================================================================
  static async parDomaine() {
    const result = await formationRepository.raw
      .createQueryBuilder('f')
      .leftJoin('f.sessions', 's')
      .leftJoin('s.inscriptions', 'i')
      .leftJoin('f.domaineRelation', 'd')
      .select('COALESCE(d.nom, f.domaine)', 'domaine')
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      .addSelect('COUNT(DISTINCT f.id)', 'formations')
      .addSelect('COUNT(DISTINCT s.id)', 'sessions')
      .addSelect('COUNT(DISTINCT i.id)', 'inscriptions')
      .where('f.actif = true')
<<<<<<< HEAD
      .groupBy('f.domaine')
=======
      .groupBy('COALESCE(d.nom, f.domaine)')
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      .getRawMany();

    return result.map((r) => ({
      domaine: r.domaine,
<<<<<<< HEAD
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
=======
      formations: Number(r.formations ?? 0),
      sessions: Number(r.sessions ?? 0),
      inscriptions: Number(r.inscriptions ?? 0),
    }));
  }

  // ==========================================================================
  // ✅ TAUX DE PRÉSENCE GLOBAL
  // ==========================================================================
  static async tauxPresenceGlobal() {
    const stats = await presenceRepository.raw
      .createQueryBuilder('p')
      .select('COUNT(DISTINCT p.participant_id)', 'participants')
      .addSelect('SUM(CASE WHEN p.present = true THEN 1 ELSE 0 END)', 'presences')
      .addSelect('SUM(CASE WHEN p.present = false THEN 1 ELSE 0 END)', 'absences')
      .getRawOne();

    const presences = Number(stats?.presences ?? 0);
    const absences = Number(stats?.absences ?? 0);
    const total = presences + absences;
    const taux = total > 0 ? (presences / total) * 100 : 0;

    return {
      participants: Number(stats?.participants ?? 0),
      presences,
      absences,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      tauxPresence: Math.round(taux * 100) / 100,
    };
  }

<<<<<<< HEAD
  /**
   * Évolution mensuelle (12 derniers mois)
   */
  static async evolutionMensuelle() {
    const [inscriptions, attestations, sessions] = await Promise.all([
      AppDataSource.getRepository(Inscription)
=======
  // ==========================================================================
  // 📈 ÉVOLUTION MENSUELLE (12 derniers mois)
  // ==========================================================================
  static async evolutionMensuelle() {
    const [inscriptions, attestations, sessions] = await Promise.all([
      inscriptionRepository.raw
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
        .createQueryBuilder('i')
        .select("TO_CHAR(i.date_inscription, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(i.id)', 'count')
        .where("i.date_inscription >= NOW() - INTERVAL '12 months'")
        .groupBy('mois')
        .orderBy('mois', 'ASC')
        .getRawMany(),

<<<<<<< HEAD
      AppDataSource.getRepository(Attestation)
=======
      attestationRepository.raw
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
        .createQueryBuilder('a')
        .select("TO_CHAR(a.date_emission, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(a.id)', 'count')
        .where("a.date_emission >= NOW() - INTERVAL '12 months'")
        .groupBy('mois')
        .orderBy('mois', 'ASC')
        .getRawMany(),

<<<<<<< HEAD
      AppDataSource.getRepository(Session)
=======
      sessionRepository.raw
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
        .createQueryBuilder('s')
        .select("TO_CHAR(s.date_debut, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(s.id)', 'count')
        .where("s.date_debut >= NOW() - INTERVAL '12 months'")
        .groupBy('mois')
        .orderBy('mois', 'ASC')
        .getRawMany(),
    ]);

<<<<<<< HEAD
    return { inscriptions, attestations, sessions };
  }

  /**
   * Répartition des utilisateurs par rôle
   */
  static async repartitionRoles() {
    return AppDataSource.getRepository(User)
=======
    const map = (rows: any[]) => rows.map((r) => ({ mois: r.mois, count: Number(r.count) }));
    return {
      inscriptions: map(inscriptions),
      attestations: map(attestations),
      sessions: map(sessions),
    };
  }

  // ==========================================================================
  // 👥 RÉPARTITIONS
  // ==========================================================================
  static async repartitionRoles() {
    const rows = await userRepository.raw
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      .createQueryBuilder('u')
      .leftJoin('u.role', 'r')
      .select('r.nom', 'role')
      .addSelect('COUNT(u.id)', 'count')
      .where('u.actif = true')
      .groupBy('r.nom')
      .getRawMany();
<<<<<<< HEAD
  }

  /**
   * Répartition des sessions par statut
   */
  static async repartitionSessions() {
    return AppDataSource.getRepository(Session)
=======

    return rows.map((r) => ({ role: r.role as RoleName, count: Number(r.count) }));
  }

  static async repartitionSessions() {
    const rows = await sessionRepository.raw
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      .createQueryBuilder('s')
      .select('s.statut', 'statut')
      .addSelect('COUNT(s.id)', 'count')
      .groupBy('s.statut')
      .getRawMany();
<<<<<<< HEAD
  }

  /**
   * Top formations (les plus demandées)
   */
  static async topFormations(limit = 10) {
    return AppDataSource.getRepository(Formation)
=======

    return rows.map((r) => ({
      statut: r.statut as StatutSession,
      count: Number(r.count),
    }));
  }

  // ==========================================================================
  // 🏆 TOP FORMATIONS
  // ==========================================================================
  static async topFormations(limit = 10) {
    const rows = await formationRepository.raw
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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
<<<<<<< HEAD
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
=======

    return rows.map((r) => ({
      id: r.id,
      titre: r.titre,
      domaine: r.domaine,
      inscriptions: Number(r.inscriptions),
    }));
  }

  // ==========================================================================
  // 🎯 TOUT EN UN
  // ==========================================================================
  static async toutes() {
    const [tauxPresence, evolution, repartitionRoles, repartitionSessions, topFormations, parDomaine] =
      await Promise.all([
        this.tauxPresenceGlobal(),
        this.evolutionMensuelle(),
        this.repartitionRoles(),
        this.repartitionSessions(),
        this.topFormations(),
        this.parDomaine(),
      ]);

    logger.info('📊 Statistiques globales calculées');
    return {
      tauxPresence,
      evolution,
      repartitionRoles,
      repartitionSessions,
      topFormations,
      parDomaine,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    };
  }
}