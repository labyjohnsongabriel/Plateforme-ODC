<<<<<<< HEAD
import { In } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Conversation } from '../models/Conversation.entity';
import { Message } from '../models/Message.entity';

export class ConversationRepository extends BaseRepository<Conversation> {
  constructor() {
    super(Conversation);
  }

  async findPrivateBetween(user1: string, user2: string): Promise<Conversation | null> {
    return this.repository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.membres', 'm')
      .where('c.est_groupe = false')
      .andWhere('m.id IN (:...ids)', { ids: [user1, user2] })
      .groupBy('c.id')
      .addGroupBy('m.id')
      .having('COUNT(DISTINCT m.id) = 2')
      .getOne();
  }

  async findByUser(userId: string): Promise<Conversation[]> {
    return this.repository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.membres', 'm')
      .leftJoinAndSelect('m.role', 'r')
      .leftJoinAndSelect('c.messages', 'msg')
      .leftJoinAndSelect('msg.expediteur', 'exp')
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
      .orderBy('c.updated_at', 'DESC')
      .getMany();
  }

  async isMembre(conversationId: string, userId: string): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('c')
      .leftJoin('c.membres', 'm')
      .where('c.id = :cid', { cid: conversationId })
      .andWhere('m.id = :uid', { uid: userId })
      .getCount();
    return count > 0;
  }
}

export class MessageRepository extends BaseRepository<Message> {
  constructor() {
    super(Message);
  }

  async findByConversation(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<{ data: Message[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { conversationId },
      relations: ['expediteur', 'expediteur.role'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: data.reverse(), total };
  }

  async marquerLus(conversationId: string, userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Message)
      .set({ lu: true, dateLecture: new Date() })
      .where('conversation_id = :cid', { cid: conversationId })
      .andWhere('expediteur_id != :uid', { uid: userId })
      .andWhere('lu = false')
      .execute();
  }

  async countNonLus(userId: string): Promise<number> {
    return this.repository
      .createQueryBuilder('m')
      .leftJoin('m.conversation', 'c')
      .leftJoin('c.membres', 'mem')
      .where('mem.id = :uid', { uid: userId })
      .andWhere('m.expediteur_id != :uid', { uid: userId })
      .andWhere('m.lu = false')
      .getCount();
  }
}
=======
// src/repositories/ConversationRepository.ts
import { Conversation } from '../entities/Conversation.entity';
import { BaseRepository } from './base.repository';

export class ConversationRepository extends BaseRepository<Conversation> {
  constructor() {
    super(Conversation);
  }

  /**
   * Trouve toutes les conversations d'un utilisateur
   */
  async findForUser(userId: string): Promise<Conversation[]> {
    return this.qb('c')
      .leftJoinAndSelect('c.membres', 'm')
      .leftJoinAndSelect('c.messages', 'msg')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('cm.conversationId')
          .from('conversation_membres', 'cm')
          .where('cm.userId = :userId', { userId })
          .getQuery();
        return 'c.id IN ' + subQuery;
      })
      .orderBy('c.dernierMessageAt', 'DESC')
      .getMany();
  }

  /**
   * Trouve une conversation privée entre deux utilisateurs
   */
  async findPrivateBetween(
    userId1: string,
    userId2: string,
  ): Promise<Conversation | null> {
    return this.qb('c')
      .leftJoinAndSelect('c.membres', 'm')
      .where('c.estGroupe = :estGroupe', { estGroupe: false })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('cm.conversationId')
          .from('conversation_membres', 'cm')
          .where('cm.userId IN (:...userIds)', {
            userIds: [userId1, userId2],
          })
          .groupBy('cm.conversationId')
          .having('COUNT(DISTINCT cm.userId) = 2')
          .getQuery();
        return 'c.id IN ' + subQuery;
      })
      .getOne();
  }

  /**
   * Trouve une conversation avec ses membres
   */
  async findByIdWithMembres(id: string): Promise<Conversation | null> {
    return this.qb('c')
      .leftJoinAndSelect('c.membres', 'm')
      .where('c.id = :id', { id })
      .getOne();
  }
}
<<<<<<< HEAD

export const conversationRepository = new ConversationRepository();
=======
export const conversationRepository = new ConversationRepository();
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
>>>>>>> origin/main
