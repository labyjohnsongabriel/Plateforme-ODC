// src/repositories/NotificationRepository.ts
import { Notification } from '../entities/Notification.entity';
import { BaseRepository } from './base.repository';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() { super(Notification); }

  async findByUser(userId: string, limit = 50): Promise<Notification[]> {
    return this.qb('n')
      .where('n.user_id = :uid', { uid: userId })
      .orderBy('n.created_at', 'DESC')
      .limit(limit).getMany();
  }

  async countNonLues(userId: string): Promise<number> {
    return this.count({ userId, lue: false } as any);
  }

  async marquerLue(id: string, userId: string): Promise<void> {
    await this.qb('n')
      .update(Notification)
      .set({ lue: true, dateLecture: new Date() })
      .where('n.id = :id', { id })
      .andWhere('n.user_id = :uid', { uid: userId })
      .execute();
  }

  async marquerToutesLues(userId: string): Promise<number> {
    const result = await this.qb('n')
      .update(Notification)
      .set({ lue: true, dateLecture: new Date() })
      .where('user_id = :uid', { uid: userId })
      .andWhere('lue = false')
      .execute();
    return result.affected ?? 0;
  }
}
export const notificationRepository = new NotificationRepository();