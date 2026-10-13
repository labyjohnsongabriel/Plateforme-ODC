<<<<<<< HEAD
import { AppDataSource } from '../config/database';
import { Conversation } from '../models/Conversation.entity';
import { Message } from '../models/Message.entity';
import { User } from '../models/User.entity';
import { NotFoundError, ForbiddenError } from '../errors/AppError';
import { In } from 'typeorm';

export class MessagerieService {
  /**
   * Crée ou récupère une conversation privée entre 2 utilisateurs
   */
  static async createOrGetPrivate(userId1: string, userId2: string) {
    if (userId1 === userId2) throw new ForbiddenError('Impossible de discuter avec soi-même');

    const convRepo = AppDataSource.getRepository(Conversation);

    // Chercher une conversation privée existante entre ces 2 users
    const existing = await convRepo
      .createQueryBuilder('c')
      .leftJoin('c.membres', 'm')
      .where('c.est_groupe = false')
      .andWhere('m.id IN (:...ids)', { ids: [userId1, userId2] })
      .groupBy('c.id')
      .having('COUNT(DISTINCT m.id) = 2')
      .getOne();

    if (existing) return existing;

    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.findBy({ id: In([userId1, userId2]) });
    if (users.length !== 2) throw new NotFoundError('Utilisateur introuvable');

    const conv = convRepo.create({ estGroupe: false, membres: users });
    await convRepo.save(conv);
    return conv;
  }

  /**
   * Crée un groupe
   */
  static async createGroupe(createurId: string, titre: string, membreIds: string[]) {
    const userRepo = AppDataSource.getRepository(User);
    const ids = [...new Set([createurId, ...membreIds])];
    const membres = await userRepo.findBy({ id: In(ids) });

    if (membres.length !== ids.length) throw new NotFoundError('Certains utilisateurs sont introuvables');

    const convRepo = AppDataSource.getRepository(Conversation);
    const conv = convRepo.create({ titre, estGroupe: true, membres });
    await convRepo.save(conv);
    return conv;
  }

  /**
   * Liste les conversations d'un utilisateur
   */
  static async mesConversations(userId: string) {
    const convRepo = AppDataSource.getRepository(Conversation);

    return convRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.membres', 'm')
      .leftJoinAndSelect('m.role', 'r')
      .leftJoinAndSelect('c.messages', 'msg')
      .where((qb) => {
        const sub = qb
          .subQuery()
          .select('conv.id')
          .from(Conversation, 'conv')
          .leftJoin('conv.membres', 'mm')
          .where('mm.id = :uid', { uid: userId })
          .getQuery();
        return 'c.id IN ' + sub;
      })
      .setParameter('uid', userId)
      .orderBy('c.updatedAt', 'DESC')
      .getMany();
  }

  /**
   * Liste les messages d'une conversation
   */
  static async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const convRepo = AppDataSource.getRepository(Conversation);
    const conv = await convRepo.findOne({
      where: { id: conversationId },
      relations: ['membres'],
    });
    if (!conv) throw new NotFoundError('Conversation introuvable');

    if (!conv.membres.some((m) => m.id === userId)) {
      throw new ForbiddenError('Vous n\'êtes pas membre de cette conversation');
    }

    const msgRepo = AppDataSource.getRepository(Message);
    const [data, total] = await msgRepo.findAndCount({
      where: { conversationId },
      relations: ['expediteur'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: data.reverse(), total };
  }

  /**
   * Envoie un message
   */
  static async envoyerMessage(
    conversationId: string,
    expediteurId: string,
    contenu: string,
    fichierUrl?: string
  ) {
    const convRepo = AppDataSource.getRepository(Conversation);
    const conv = await convRepo.findOne({
      where: { id: conversationId },
      relations: ['membres'],
    });
    if (!conv) throw new NotFoundError('Conversation introuvable');

    if (!conv.membres.some((m) => m.id === expediteurId)) {
      throw new ForbiddenError('Vous n\'êtes pas membre de cette conversation');
    }

    const msgRepo = AppDataSource.getRepository(Message);
    const message = msgRepo.create({
      conversationId,
      expediteurId,
      contenu,
      fichierUrl,
    });
    await msgRepo.save(message);

    // Update conversation timestamp
    conv.updatedAt = new Date();
    await convRepo.save(conv);

    return msgRepo.findOne({
      where: { id: message.id },
      relations: ['expediteur'],
    });
  }

  /**
   * Marque les messages comme lus
   */
  static async marquerLus(conversationId: string, userId: string) {
    const msgRepo = AppDataSource.getRepository(Message);
    await msgRepo
      .createQueryBuilder()
      .update(Message)
      .set({ lu: true, dateLecture: new Date() })
      .where('conversation_id = :cid', { cid: conversationId })
      .andWhere('expediteur_id != :uid', { uid: userId })
      .andWhere('lu = false')
      .execute();
  }

  /**
   * Compte des messages non lus
   */
  static async countNonLus(userId: string) {
    const msgRepo = AppDataSource.getRepository(Message);
    return msgRepo
      .createQueryBuilder('m')
      .leftJoin('m.conversation', 'c')
      .leftJoin('c.membres', 'mem')
      .where('mem.id = :uid', { uid: userId })
      .andWhere('m.expediteur_id != :uid', { uid: userId })
      .andWhere('m.lu = false')
      .getCount();
=======
// src/services/messagerie.service.ts
import { conversationRepository } from '../repositories/ConversationRepository';
import { messageRepository } from '../repositories/message.repository';
import { userRepository } from '../repositories/user.repository';
import { TypeMessage } from '../entities/enums';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/AppError';
import { In } from 'typeorm';

export class MessagerieService {
  static async mesConversations(userId: string) {
    return conversationRepository.findForUser(userId);
  }

  static async createPrivate(userId: string, destinataireId: string) {
    if (userId === destinataireId) throw new BadRequestError('Impossible de créer une conversation avec soi-même');
    const destinataire = await userRepository.findById(destinataireId);
    if (!destinataire) throw new NotFoundError('Destinataire introuvable');

    const existing = await conversationRepository.findPrivateBetween(userId, destinataireId);
    if (existing) return existing;

    const moi = await userRepository.findByIdOrFail(userId);
    return conversationRepository.create({
      estGroupe: false,
      membres: [moi, destinataire],
      dernierMessageAt: new Date(),
    });
  }

  static async createGroupe(userId: string, titre: string, membreIds: string[], photoUrl?: string) {
    if (!titre || !membreIds.length) throw new BadRequestError('titre et membres requis');
    const ids = [...new Set([...membreIds, userId])];
    const membres = await userRepository.findMany({ where: { id: In(ids) } } as any);
    if (membres.length !== ids.length) throw new BadRequestError('Certains membres sont introuvables');

    return conversationRepository.create({
      titre, estGroupe: true, membres, photoUrl,
      dernierMessageAt: new Date(),
    });
  }

  static async getConversation(conversationId: string, userId: string) {
    const conv = await conversationRepository.findByIdWithMembres(conversationId);
    if (!conv) throw new NotFoundError('Conversation introuvable');
    if (!conv.membres.some((m) => m.id === userId)) throw new ForbiddenError('Accès refusé');
    return conv;
  }

  static async getMessages(conversationId: string, userId: string, limit = 100) {
    await this.getConversation(conversationId, userId); // Vérifie accès
    return messageRepository.findByConversation(conversationId, limit);
  }

  static async envoyer(
    conversationId: string,
    userId: string,
    data: { contenu?: string; type?: TypeMessage; fichierUrl?: string; fichierNom?: string; fichierTaille?: number },
  ) {
    const conv = await this.getConversation(conversationId, userId);
    if (!data.contenu && !data.fichierUrl) throw new BadRequestError('Message vide');

    const msg = await messageRepository.create({
      conversationId: conv.id,
      expediteurId: userId,
      contenu: data.contenu,
      type: data.type ?? TypeMessage.TEXTE,
      fichierUrl: data.fichierUrl,
      fichierNom: data.fichierNom,
      fichierTaille: data.fichierTaille,
    });

    conv.dernierMessageAt = new Date();
    await conversationRepository.save(conv);

    return msg;
  }

  static async marquerLus(conversationId: string, userId: string) {
    await this.getConversation(conversationId, userId);
    return messageRepository.marquerLus(conversationId, userId);
  }

  static async countNonLus(userId: string) {
    const count = await messageRepository.countNonLus(userId);
    return { count };
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}