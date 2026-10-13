<<<<<<< HEAD
import { AppDataSource } from '../config/database';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
import { Session, StatutSession } from '../models/Session.entity';
import { NotFoundError, ConflictError, ForbiddenError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';

export class InscriptionService {
  private static get repo() { return AppDataSource.getRepository(Inscription); }

  static async create(participantId: string, sessionId: string, motivation?: string) {
    const session = await AppDataSource.getRepository(Session).findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundError('Session introuvable');
    if (session.statut !== StatutSession.OUVERTE) throw new ConflictError('Inscriptions fermees');
    const existing = await this.repo.findOne({ where: { sessionId, participantId } });
    if (existing) throw new ConflictError('Deja inscrit');
    const count = await this.repo.count({ where: { sessionId, statut: StatutInscription.ACCEPTEE } });
    if (count >= session.capacite) throw new ConflictError('Session complete');
    const inscription = this.repo.create({ sessionId, participantId, motivation, statut: StatutInscription.EN_ATTENTE });
    await this.repo.save(inscription);
    return this.findById(inscription.id);
  }

  static async findAll(userId: string, userRole: string, params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);
    const qb = this.repo.createQueryBuilder('i')
      .leftJoinAndSelect('i.participant', 'p')
      .leftJoinAndSelect('i.session', 's')
      .leftJoinAndSelect('s.formation', 'f');
    if (userRole === 'PARTICIPANT') qb.andWhere('i.participant_id = :uid', { uid: userId });
    else if (userRole === 'FORMATEUR') qb.andWhere('s.formateur_id = :uid', { uid: userId });
    if (params.statut) qb.andWhere('i.statut = :st', { st: params.statut });
    if (params.sessionId) qb.andWhere('i.session_id = :sid', { sid: params.sessionId });
    qb.orderBy('i.dateInscription', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  static async findById(id: string) {
    const i = await this.repo.findOne({ where: { id }, relations: ['participant', 'session', 'session.formation'] });
    if (!i) throw new NotFoundError('Inscription introuvable');
    return i;
  }

  static async selectionner(id: string, statut: StatutInscription, motifRefus?: string) {
    const i = await this.findById(id);
    i.statut = statut;
    if (motifRefus) i.motifRefus = motifRefus;
    await this.repo.save(i);
    return i;
  }

  static async annuler(id: string, userId: string) {
    const i = await this.findById(id);
    if (i.participantId !== userId) throw new ForbiddenError('Non autorise');
    await this.repo.softDelete(id);
=======
// src/services/inscription.service.ts
import { inscriptionRepository } from '../repositories/inscription.repository';
import { sessionRepository } from '../repositories/session.repository';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/RoleRepository';
import { notificationService } from './notification.service';
import { StatutInscription, RoleName } from '../entities/enums';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError';
import { logger } from '../config/logger';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class InscriptionService {
  /** 🔒 Participant authentifié */
  static async create(userId: string, sessionId: string, motivation?: string) {
    const session = await sessionRepository.findById(sessionId, ['formation']);
    if (!session) throw new NotFoundError('Session introuvable');
    if (!session.estPubliee) throw new ForbiddenError('Session non publiée');

    if (session.dateFermetureInscriptions && session.dateFermetureInscriptions < new Date()) {
      throw new ForbiddenError('Inscriptions fermées pour cette session');
    }

    const existing = await inscriptionRepository.findBySessionAndParticipant(sessionId, userId);
    if (existing) throw new ConflictError('Vous êtes déjà inscrit à cette session');

    const acceptedCount = await inscriptionRepository.countAcceptees(sessionId);
    const statut = acceptedCount >= session.capacite
      ? StatutInscription.LISTE_ATTENTE
      : StatutInscription.EN_ATTENTE;

    const inscription = await inscriptionRepository.create({
      sessionId,
      participantId: userId,
      motivation,
      statut,
    });

    await notificationService.create({
      userId,
      titre: '📩 Inscription enregistrée',
      message: `Votre inscription à « ${session.formation.titre} » a été enregistrée. Statut : ${statut}`,
      metadata: { inscriptionId: inscription.id, sessionId },
    });

    logger.info(`📝 Inscription : user=${userId} session=${session.codeSession}`);
    return inscription;
  }

  /** 🌐 Inscription publique : crée le compte si absent */
  static async createPublic(data: {
    sessionId: string;
    email: string;
    nom: string;
    prenom: string;
    motivation?: string;
    telephone?: string;
  }) {
    const session = await sessionRepository.findById(data.sessionId, ['formation']);
    if (!session) throw new NotFoundError('Session introuvable');
    if (!session.estPubliee) throw new ForbiddenError('Session non publiée');

    let user = await userRepository.findByEmail(data.email.toLowerCase());

    if (!user) {
      const role = await roleRepository.findByName(RoleName.PARTICIPANT);
      if (!role) throw new NotFoundError('Rôle PARTICIPANT non initialisé');

      const tempPassword = crypto.randomBytes(8).toString('hex');
      user = await userRepository.create({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email.toLowerCase(),
        telephone: data.telephone,
        motDePasse: await bcrypt.hash(tempPassword, 12),
        roleId: role.id,
      });

      // TODO: envoyer email avec mot de passe temporaire
      logger.info(`👤 Compte créé via inscription publique : ${user.email}`);
    }

    return this.create(user.id, data.sessionId, data.motivation);
  }

  static async findAll(userId: string, userRole: RoleName, filters: any) {
    if ([RoleName.ADMINISTRATEUR, RoleName.STAFF_ODC].includes(userRole)) {
      const sessionId = filters.sessionId as string;
      const data = sessionId
        ? await inscriptionRepository.findBySession(sessionId)
        : await inscriptionRepository.findMany();
      const page = Number(filters.page) || 1;
      const limit = Number(filters.limit) || 10;
      const total = data.length;
      return {
        data: data.slice((page - 1) * limit, page * limit),
        total, page, limit,
        totalPages: Math.ceil(total / limit),
      };
    }
    const data = await inscriptionRepository.findByParticipant(userId);
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  static async findById(id: string) {
    return inscriptionRepository.findByIdOrFail(id, ['session', 'participant']);
  }

  static async selectionner(id: string, statut: StatutInscription, motifRefus: string | undefined, staffId: string) {
    const inscription = await inscriptionRepository.findByIdOrFail(id, ['session', 'session.formation']);

    inscription.statut = statut;
    inscription.motifRefus = motifRefus ?? null as any;
    inscription.dateSelection = new Date();
    inscription.selectionnePar = staffId;
    await inscriptionRepository.save(inscription);

    const labels: Record<StatutInscription, { titre: string; message: string }> = {
      [StatutInscription.ACCEPTEE]:     { titre: '🎉 Inscription acceptée', message: `Vous êtes accepté pour « ${inscription.session.formation.titre} »` },
      [StatutInscription.REFUSEE]:      { titre: '❌ Inscription refusée', message: `Motif : ${motifRefus ?? 'Non précisé'}` },
      [StatutInscription.LISTE_ATTENTE]:{ titre: '⏳ Liste d\'attente', message: `Vous êtes en liste d'attente` },
      [StatutInscription.EN_ATTENTE]:   { titre: '⏳ En attente', message: 'Votre inscription est en attente' },
      [StatutInscription.ANNULEE]:      { titre: '🚫 Annulée', message: 'Votre inscription a été annulée' },
    };

    const l = labels[statut];
    await notificationService.create({
      userId: inscription.participantId,
      titre: l.titre,
      message: l.message,
      metadata: { inscriptionId: inscription.id, sessionId: inscription.sessionId },
    });

    logger.info(`✅ Inscription ${id} → ${statut}`);
    return inscription;
  }

  static async annuler(id: string, userId: string) {
    const inscription = await inscriptionRepository.findByIdOrFail(id);
    if (inscription.participantId !== userId) {
      throw new ForbiddenError('Vous ne pouvez annuler que vos propres inscriptions');
    }
    inscription.statut = StatutInscription.ANNULEE;
    await inscriptionRepository.save(inscription);
    logger.info(`🚫 Inscription annulée : ${id}`);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}