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

export const conversationRepository = new ConversationRepository();