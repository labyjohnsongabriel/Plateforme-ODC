// src/repositories/MessageRepository.ts
import { Message } from '../entities/Message.entity';
import { BaseRepository } from './base.repository';

export class MessageRepository extends BaseRepository<Message> {
  constructor() { super(Message); }

  async findByConversation(conversationId: string, limit = 100): Promise<Message[]> {
    return this.qb('m')
      .leftJoinAndSelect('m.expediteur', 'e')
      .leftJoinAndSelect('e.role', 'r')
      .where('m.conversation_id = :cid', { cid: conversationId })
      .orderBy('m.created_at', 'ASC')
      .limit(limit).getMany();
  }

  async marquerLus(conversationId: string, userId: string): Promise<number> {
    const result = await this.qb('m')
      .update(Message)
      .set({ lu: true, dateLecture: new Date() })
      .where('conversation_id = :cid', { cid: conversationId })
      .andWhere('expediteur_id != :uid', { uid: userId })
      .andWhere('lu = false')
      .execute();
    return result.affected ?? 0;
  }

  async countNonLus(userId: string): Promise<number> {
    return this.qb('m')
      .leftJoin('m.conversation', 'c')
      .leftJoin('c.membres', 'u')
      .where('u.id = :uid', { uid: userId })
      .andWhere('m.expediteur_id != :uid', { uid: userId })
      .andWhere('m.lu = false')
      .getCount();
  }
}
export const messageRepository = new MessageRepository();