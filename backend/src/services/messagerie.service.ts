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
  }
}