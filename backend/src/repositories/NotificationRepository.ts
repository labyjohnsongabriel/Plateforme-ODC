import { BaseRepository } from './BaseRepository';
import { Notification } from '../models/Notification.entity';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super(Notification);
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ data: Notification[]; total: number; nonLues: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const nonLues = await this.repository.count({
      where: { userId, lue: false },
    });

    return { data, total, nonLues };
  }

  async countNonLues(userId: string): Promise<number> {
    return this.repository.count({ where: { userId, lue: false } });
  }

  async marquerLue(userId: string, id: string): Promise<void> {
    await this.repository.update({ id, userId }, { lue: true });
  }

  async marquerToutesLues(userId: string): Promise<void> {
    await this.repository.update({ userId, lue: false }, { lue: true });
  }
}