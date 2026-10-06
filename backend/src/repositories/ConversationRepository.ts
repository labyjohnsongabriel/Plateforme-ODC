// src/repositories/ConversationRepository.ts
import { Conversation } from '../entities/Conversation.entity';
import { BaseRepository } from './base.repository';

export class ConversationRepository extends BaseRepository<Conversation> {
  constructor() { super(Conversation); }

  async findForUser(userId: string): Promise<Conversation[]> {
    return this.qb('c')
      .leftJoinAndSelect('c.membres', 'm')
      .leftJoinAndSelect('m.role', 'r')
      .where((qb) => {
        const sub = qb.subQuery()
          .select('cm.conversation_id')
          .from('conversation_membres', 'cm')
          .where('cm.user_id = :uid', { uid: userId })
          .getQuery();
        return 'c.id IN ' + sub;
      })
      .orderBy('c.dernier_message_at', 'DESC', 'NULLS LAST')
      .getMany();
  }

  async findByIdWithMembres(id: string): Promise<Conversation | null> {
    return this.findById(id, ['membres', 'membres.role']);
  }

  async findPrivateBetween(a: string, b: string): Promise<Conversation | null> {
    return this.qb('c')
      .leftJoin('c.membres', 'm')
      .where('c.est_groupe = false')
      .andWhere('m.id IN (:...ids)', { ids: [a, b] })
      .groupBy('c.id')
      .having('COUNT(m.id) = 2')
      .getOne();
  }
}
export const conversationRepository = new ConversationRepository();