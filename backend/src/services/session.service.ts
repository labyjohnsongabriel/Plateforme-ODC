// src/services/session.service.ts
import { AppDataSource } from '../config/database';
import { Session } from '../entities/Session.entity';
import { Inscription } from '../entities/Inscription.entity';
import { Presence } from '../entities/Presence.entity';
import { NotFoundError, BadRequestError } from '../errors/AppError';
import { StatutSession, ModaliteSession } from '../entities/enums';
import { logger } from '../config/logger';

/* ============================================================================
   REPOSITORIES — Accès direct via AppDataSource
   ============================================================================ */

const sessionRepo = () => AppDataSource.getRepository(Session);
const inscriptionRepo = () => AppDataSource.getRepository(Inscription);
const presenceRepo = () => AppDataSource.getRepository(Presence);

/* ============================================================================
   SERVICE
   ============================================================================ */

export class SessionService {
  /* ==========================================================================
     🌐 PUBLIC
     ========================================================================== */

  static async findAllPublic(query: any) {
    const {
      page = 1,
      limit = 12,
      q,
      formationId,
      modalite,
    } = query;

    const qb = sessionRepo()
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.formation', 'f')
      .where('s.estPubliee = :pub', { pub: true })
      .andWhere('s.deletedAt IS NULL');

    if (q) {
      qb.andWhere('(s.titre ILIKE :q OR f.titre ILIKE :q)', {
        q: `%${q}%`,
      });
    }
    if (formationId) {
      qb.andWhere('s.formationId = :formationId', { formationId });
    }
    if (modalite) {
      qb.andWhere('s.modalite = :modalite', { modalite });
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const total = await qb.getCount();
    const data = await qb
      .orderBy('s.dateDebut', 'ASC')
      .offset(skip)
      .limit(limitNum)
      .getMany();

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  static async findByCodePublic(codeSession: string) {
    return sessionRepo()
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('s.formateur', 'u')
      .where('s.codeSession = :code', { code: codeSession })
      .andWhere('s.estPubliee = :pub', { pub: true })
      .getOne();
  }

  /* ==========================================================================
     🔒 ADMIN / STAFF
     ========================================================================== */

  static async findAll(query: any) {
    const {
      page = 1,
      limit = 20,
      q,
      statut,
      modalite,
      formationId,
      formateurId,
      dateDebut,
      dateFin,
      estPubliee,
    } = query;

    const qb = sessionRepo()
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('s.formateur', 'u')
      .loadRelationCountAndMap('s.inscriptionsCount', 's.inscriptions')
      .loadRelationCountAndMap('s.presencesCount', 's.presences')
      .where('s.deletedAt IS NULL');

    if (q) {
      qb.andWhere(
        '(s.codeSession ILIKE :q OR s.titre ILIKE :q OR f.titre ILIKE :q)',
        { q: `%${q}%` },
      );
    }
    if (statut && statut !== 'all') {
      qb.andWhere('s.statut = :statut', { statut });
    }
    if (modalite) {
      qb.andWhere('s.modalite = :modalite', { modalite });
    }
    if (formationId) {
      qb.andWhere('s.formationId = :formationId', { formationId });
    }
    if (formateurId) {
      qb.andWhere('s.formateurId = :formateurId', { formateurId });
    }
    if (dateDebut) {
      qb.andWhere('s.dateDebut >= :dateDebut', { dateDebut });
    }
    if (dateFin) {
      qb.andWhere('s.dateFin <= :dateFin', { dateFin });
    }
    if (estPubliee !== undefined) {
      qb.andWhere('s.estPubliee = :estPubliee', { estPubliee });
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const total = await qb.getCount();
    const data = await qb
      .orderBy('s.dateDebut', 'DESC')
      .offset(skip)
      .limit(limitNum)
      .getMany();

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  static async findById(id: string) {
    const session = await sessionRepo()
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.formation', 'f')
      .leftJoinAndSelect('s.formateur', 'u')
      .loadRelationCountAndMap('s.inscriptionsCount', 's.inscriptions')
      .loadRelationCountAndMap('s.presencesCount', 's.presences')
      .where('s.id = :id', { id })
      .getOne();

    if (!session) {
      throw new NotFoundError('Session introuvable');
    }

    return session;
  }

  /* ==========================================================================
     ⭐ VÉRIFIER EXISTENCE
     ========================================================================== */
  static async exists(id: string): Promise<boolean> {
    try {
      const count = await sessionRepo().count({ where: { id } });
      return count > 0;
    } catch (error) {
      logger.error(`[SessionService.exists] Erreur: ${error}`);
      return false;
    }
  }

  /* ==========================================================================
     ⭐ STATISTIQUES GLOBALES
     ========================================================================== */
  static async getStats() {
    try {
      const [
        total,
        planifiees,
        ouvertes,
        enCours,
        terminees,
        annulees,
        totalInscriptions,
      ] = await Promise.all([
        sessionRepo().count(),
        sessionRepo().count({ where: { statut: StatutSession.PLANIFIEE } }),
        sessionRepo().count({ where: { statut: StatutSession.OUVERTE } }),
        sessionRepo().count({ where: { statut: StatutSession.EN_COURS } }),
        sessionRepo().count({ where: { statut: StatutSession.TERMINEE } }),
        sessionRepo().count({ where: { statut: StatutSession.ANNULEE } }),
        inscriptionRepo().count().catch(() => 0),
      ]);

      return {
        total,
        planifiees,
        ouvertes,
        enCours,
        terminees,
        annulees,
        totalInscriptions,
      };
    } catch (error) {
      logger.error(`[SessionService.getStats] Erreur: ${error}`);
      return {
        total: 0,
        planifiees: 0,
        ouvertes: 0,
        enCours: 0,
        terminees: 0,
        annulees: 0,
        totalInscriptions: 0,
      };
    }
  }

  /* ==========================================================================
     ⭐ INSCRIPTIONS D'UNE SESSION — CORRIGÉ
     ========================================================================== */
  static async getInscriptions(sessionId: string) {
    try {
      logger.info(`[SessionService.getInscriptions] sessionId=${sessionId}`);

      // ⭐ Utilisation directe de AppDataSource
      const inscriptions = await inscriptionRepo()
        .createQueryBuilder('i')
        .leftJoinAndSelect('i.participant', 'p')
        .leftJoinAndSelect('i.session', 's')
        .where('i.sessionId = :sessionId', { sessionId })
        .orderBy('i.createdAt', 'DESC')
        .getMany();

      logger.info(
        `[SessionService.getInscriptions] ${inscriptions.length} inscription(s) trouvée(s)`,
      );

      return inscriptions.map((i: any) => ({
        id: i.id,
        statut: i.statut,
        motivation: i.motivation,
        motifRefus: i.motifRefus,
        dateSelection: i.dateSelection,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        participant: i.participant
          ? {
              id: i.participant.id,
              nom: i.participant.nom,
              prenom: i.participant.prenom,
              email: i.participant.email,
              telephone: i.participant.telephone,
              photoUrl: i.participant.photoUrl,
            }
          : null,
      }));
    } catch (error) {
      logger.error(`[SessionService.getInscriptions] Erreur: ${error}`);
      return [];
    }
  }

  /* ==========================================================================
     ⭐ PRÉSENCES D'UNE SESSION — CORRIGÉ
     ========================================================================== */
  static async getPresences(sessionId: string) {
    try {
      logger.info(`[SessionService.getPresences] sessionId=${sessionId}`);

      // ⭐ Utilisation directe de AppDataSource
      const presences = await presenceRepo()
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.participant', 'u')
        .where('p.sessionId = :sessionId', { sessionId })
        .orderBy('p.createdAt', 'DESC')
        .getMany();

      logger.info(
        `[SessionService.getPresences] ${presences.length} présence(s) trouvée(s)`,
      );

      return presences.map((p: any) => ({
        id: p.id,
        statut: p.statut,
        datePresence: p.datePresence,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        participant: p.participant
          ? {
              id: p.participant.id,
              nom: p.participant.nom,
              prenom: p.participant.prenom,
              email: p.participant.email,
              photoUrl: p.participant.photoUrl,
            }
          : null,
      }));
    } catch (error) {
      logger.error(`[SessionService.getPresences] Erreur: ${error}`);
      return [];
    }
  }

  /* ==========================================================================
     CRÉATION
     ========================================================================== */
  static async create(data: any) {
    if (!data.formationId) {
      throw new BadRequestError('formationId est requis');
    }
    if (!data.dateDebut || !data.dateFin) {
      throw new BadRequestError('dateDebut et dateFin sont requis');
    }

    const codeSession = await SessionService.generateCode();

    const session = sessionRepo().create({
      ...data,
      codeSession,
      statut: data.statut ?? StatutSession.OUVERTE,
      estPubliee: data.estPubliee ?? false,
    });

    const saved = await sessionRepo().save(session);

    logger.info(`📅 Session créée : ${saved.codeSession}`);

    return saved;
  }

  /* ==========================================================================
     MISE À JOUR
     ========================================================================== */
  static async update(id: string, data: any) {
    delete data.codeSession;
    delete data.id;

    const session = await sessionRepo().findOne({ where: { id } });
    if (!session) throw new NotFoundError('Session introuvable');

    Object.assign(session, data);
    const updated = await sessionRepo().save(session);

    logger.info(`📝 Session mise à jour : ${updated.codeSession}`);

    return updated;
  }

  /* ==========================================================================
     CHANGER STATUT
     ========================================================================== */
  static async changerStatut(id: string, statut: StatutSession) {
    const session = await sessionRepo().findOne({ where: { id } });
    if (!session) throw new NotFoundError('Session introuvable');

    session.statut = statut;

    // ⭐ Logique automatique de présence
    if (statut === StatutSession.EN_COURS || statut === StatutSession.OUVERTE) {
      session.presenceOuverte = true;
    } else if (
      statut === StatutSession.TERMINEE ||
      statut === StatutSession.ANNULEE
    ) {
      session.presenceOuverte = false;
    }

    return sessionRepo().save(session);
  }

  /* ==========================================================================
     PUBLICATION
     ========================================================================== */
  static async togglePublication(id: string, estPubliee: boolean) {
    const session = await sessionRepo().findOne({ where: { id } });
    if (!session) throw new NotFoundError('Session introuvable');

    session.estPubliee = estPubliee;
    return sessionRepo().save(session);
  }

  /* ==========================================================================
     PRÉSENCE
     ========================================================================== */
  static async ouvrirPresence(id: string, ouverte: boolean) {
    const session = await sessionRepo().findOne({ where: { id } });
    if (!session) throw new NotFoundError('Session introuvable');

    session.presenceOuverte = ouverte;
    return sessionRepo().save(session);
  }

  /* ==========================================================================
     SUPPRESSION
     ========================================================================== */
  static async delete(id: string) {
    const session = await sessionRepo().findOne({ where: { id } });
    if (!session) throw new NotFoundError('Session introuvable');

    await sessionRepo().softRemove(session);
    logger.info(`🗑️ Session supprimée : ${id}`);
  }

  /* ==========================================================================
     DUPLIQUER
     ========================================================================== */
  static async dupliquer(id: string) {
    const original = await sessionRepo().findOne({ where: { id } });
    if (!original) throw new NotFoundError('Session introuvable');

    const codeSession = await SessionService.generateCode();

    const copy = sessionRepo().create({
      ...original,
      id: undefined,
      codeSession,
      statut: StatutSession.OUVERTE,
      estPubliee: false,
      createdAt: undefined,
      updatedAt: undefined,
    } as any);

    const saved = await sessionRepo().save(copy);

    logger.info(
      `📋 Session dupliquée : ${original.codeSession} → ${saved.codeSession}`,
    );

    return saved;
  }

  /* ==========================================================================
     FORMATEUR
     ========================================================================== */
  static async findMesSessions(formateurId: string) {
    return sessionRepo()
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.formation', 'f')
      .where('s.formateurId = :formateurId', { formateurId })
      .andWhere('s.deletedAt IS NULL')
      .orderBy('s.dateDebut', 'DESC')
      .getMany();
  }

  static async getParticipants(sessionId: string) {
    try {
      const inscriptions = await inscriptionRepo()
        .createQueryBuilder('i')
        .leftJoinAndSelect('i.participant', 'p')
        .where('i.sessionId = :sessionId', { sessionId })
        .andWhere('i.statut = :statut', { statut: 'ACCEPTEE' })
        .getMany();

      return inscriptions.map((i: any) => i.participant);
    } catch (error) {
      logger.error(`[SessionService.getParticipants] Erreur: ${error}`);
      return [];
    }
  }

  static async getStatistiques(sessionId: string) {
    try {
      const session = await SessionService.findById(sessionId);

      const [inscriptionsCount, presencesCount] = await Promise.all([
        inscriptionRepo().count({ where: { sessionId } }),
        presenceRepo().count({ where: { sessionId } }),
      ]);

      return {
        session,
        inscriptionsCount,
        presencesCount,
      };
    } catch (error) {
      logger.error(`[SessionService.getStatistiques] Erreur: ${error}`);
      return {
        session: null,
        inscriptionsCount: 0,
        presencesCount: 0,
      };
    }
  }

  /* ==========================================================================
     HELPER — Génère un code unique
     ========================================================================== */
  private static async generateCode(): Promise<string> {
    let code: string;
    let exists: boolean;
    let attempts = 0;

    do {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      code = `ODC-${year}-${random}`;

      const found = await sessionRepo().findOne({
        where: { codeSession: code },
      });
      exists = !!found;
      attempts++;

      if (attempts > 100) {
        code = `ODC-${year}-${Date.now()}`;
        break;
      }
    } while (exists);

    return code;
  }
}