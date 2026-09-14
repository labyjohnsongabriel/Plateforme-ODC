import { AppDataSource } from '../config/database';
import { Notification, TypeNotification } from '../models/Notification.entity';
import { getPagination } from '../utils/pagination.util';

export class NotificationService {
  private static get repo() {
    return AppDataSource.getRepository(Notification);
  }

  static async create(data: {
    userId: string;
    titre: string;
    message: string;
    type?: TypeNotification;
    lien?: string;
    icone?: string;
    metadata?: any;
  }) {
    const notif = this.repo.create({
      userId: data.userId,
      titre: data.titre,
      message: data.message,
      type: data.type || TypeNotification.INFO,
      lien: data.lien,
      icone: data.icone,
      metadata: data.metadata,
    });
    await this.repo.save(notif);

    try {
      const socketsModule = await import('../sockets');
      if (socketsModule.isSocketInitialized && socketsModule.isSocketInitialized()) {
        const io = socketsModule.getIo();
        io.of('/notifications').to(`user:${data.userId}`).emit('notification:new', notif);
      }
    } catch {
      // Sockets non initialises
    }

    return notif;
  }

  static async mesNotifications(userId: string, params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    const nonLues = await this.repo.count({ where: { userId, lue: false } });
    return { data, total, nonLues, page, limit };
  }

  static async countNonLues(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, lue: false } });
  }

  static async marquerLue(userId: string, id: string): Promise<void> {
    await this.repo.update({ id, userId }, { lue: true, dateLecture: new Date() });
  }

  static async marquerToutesLues(userId: string): Promise<void> {
    await this.repo.update({ userId, lue: false }, { lue: true, dateLecture: new Date() });
  }

  static async createBulk(userIds: string[], data: any) {
    return Promise.all(userIds.map((userId) => this.create({ ...data, userId })));
  }

  static async delete(userId: string, id: string): Promise<void> {
    await this.repo.softDelete({ id, userId });
  }
}