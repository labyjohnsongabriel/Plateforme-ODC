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