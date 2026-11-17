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
      where: { formationId },
      relations: ['inscriptions', 'formateur'],
    });

    const totalInscriptions = sessions.reduce(
      (s, sess) => s + (sess.inscriptions?.length ?? 0),
      0,
    );

    const acceptees = sessions.reduce(
      (s, sess) =>
        s +
        (sess.inscriptions?.filter(
          (i) => i.statut === StatutInscription.ACCEPTEE,
        ).length ?? 0),
      0,
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
    };
  }

  // ==========================================================================
  // 👨‍🏫 PAR FORMATEUR
  // ==========================================================================
  static async parFormateur(formateurId: string) {
    const sessions = await sessionRepository.raw.find({
      where: { formateurId },
      relations: ['formation', 'inscriptions'],
    });

    const formationIds = [...new Set(sessions.map((s) => s.formationId))];

    const moyenneNotes = await noteRepository.raw
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
      where: { participantId },
      relations: ['session', 'session.formation'],
    });

    const notes = await noteRepository.raw.find({
      where: { participantId },
      relations: ['evaluation'],
    });

    const moyenne =
      notes.length > 0
        ? Math.round(
            (notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) * 100,
          ) / 100
        : 0;

    const attestations = await attestationRepository.count({
      participantId,
      valide: true,
    } as any);

    return {
      participantId,
      totalFormations: inscriptions.length,
      formationsTerminees: inscriptions.filter(
        (i) => i.session?.statut === StatutSession.TERMINEE,
      ).length,
      formationsEnCours: inscriptions.filter(
        (i) => i.session?.statut === StatutSession.EN_COURS,
      ).length,
      noteMoyenne: moyenne,
      totalEvaluations: notes.length,
      attestationsObtenues: attestations,
    };
  }

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
      .addSelect('COUNT(DISTINCT f.id)', 'formations')
      .addSelect('COUNT(DISTINCT s.id)', 'sessions')
      .addSelect('COUNT(DISTINCT i.id)', 'inscriptions')
      .where('f.actif = true')
      .groupBy('COALESCE(d.nom, f.domaine)')
      .getRawMany();

    return result.map((r) => ({
      domaine: r.domaine,
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
      tauxPresence: Math.round(taux * 100) / 100,
    };
  }

  // ==========================================================================
  // 📈 ÉVOLUTION MENSUELLE (12 derniers mois)
  // ==========================================================================
  static async evolutionMensuelle() {
    const [inscriptions, attestations, sessions] = await Promise.all([
      inscriptionRepository.raw
        .createQueryBuilder('i')
        .select("TO_CHAR(i.date_inscription, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(i.id)', 'count')
        .where("i.date_inscription >= NOW() - INTERVAL '12 months'")
        .groupBy('mois')
        .orderBy('mois', 'ASC')
        .getRawMany(),

      attestationRepository.raw
        .createQueryBuilder('a')
        .select("TO_CHAR(a.date_emission, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(a.id)', 'count')
        .where("a.date_emission >= NOW() - INTERVAL '12 months'")
        .groupBy('mois')
        .orderBy('mois', 'ASC')
        .getRawMany(),

      sessionRepository.raw
        .createQueryBuilder('s')
        .select("TO_CHAR(s.date_debut, 'YYYY-MM')", 'mois')
        .addSelect('COUNT(s.id)', 'count')
        .where("s.date_debut >= NOW() - INTERVAL '12 months'")
        .groupBy('mois')
        .orderBy('mois', 'ASC')
        .getRawMany(),
    ]);

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
      .createQueryBuilder('u')
      .leftJoin('u.role', 'r')
      .select('r.nom', 'role')
      .addSelect('COUNT(u.id)', 'count')
      .where('u.actif = true')
      .groupBy('r.nom')
      .getRawMany();

    return rows.map((r) => ({ role: r.role as RoleName, count: Number(r.count) }));
  }

  static async repartitionSessions() {
    const rows = await sessionRepository.raw
      .createQueryBuilder('s')
      .select('s.statut', 'statut')
      .addSelect('COUNT(s.id)', 'count')
      .groupBy('s.statut')
      .getRawMany();

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
    };
  }
}