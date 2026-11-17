// src/repositories/ConversationRepository.ts
import { Conversation } from '../entities/Conversation.entity';   // ⭐ chemin corrigé
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
          .select('cm.conversation_id')
          .from('conversation_membres', 'cm')
          .where('cm.user_id = :userId', { userId })
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
          .select('cm.conversation_id')
          .from('conversation_membres', 'cm')
          .where('cm.user_id IN (:...userIds)', {
            userIds: [userId1, userId2],
          })
          .groupBy('cm.conversation_id')
          .having('COUNT(DISTINCT cm.user_id) = 2')
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