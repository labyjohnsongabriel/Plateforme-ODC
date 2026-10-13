<<<<<<< HEAD
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
=======
// src/services/notification.service.ts
import { notificationRepository } from '../repositories/notification.repository';
import { TypeNotification } from '../entities/enums';
import { logger } from '../config/logger';

export interface CreateNotificationInput {
  userId: string;
  titre: string;
  message: string;
  type?: TypeNotification;
  lien?: string;
  icone?: string;
  metadata?: any;
  expireAt?: Date;
}

export class NotificationService {
  static async create(input: CreateNotificationInput) {
    const notification = await notificationRepository.create({
      userId: input.userId,
      titre: input.titre,
      message: input.message,
      type: input.type ?? TypeNotification.INFO,
      lien: input.lien,
      icone: input.icone,
      metadata: input.metadata,
      expireAt: input.expireAt,
    });
    return notification;
  }

  static async createMany(inputs: CreateNotificationInput[]) {
    const entities = inputs.map((input) =>
      notificationRepository.raw.create({
        userId: input.userId,
        titre: input.titre,
        message: input.message,
        type: input.type ?? TypeNotification.INFO,
        lien: input.lien,
        icone: input.icone,
        metadata: input.metadata,
        expireAt: input.expireAt,
      }),
    );
    return notificationRepository.saveMany(entities);
  }

  static async findAll(userId: string, page = 1, limit = 20) {
    const data = await notificationRepository.findByUser(userId, 200);
    return {
      data: data.slice((page - 1) * limit, page * limit),
      total: data.length,
      page, limit,
      totalPages: Math.ceil(data.length / limit),
    };
  }

  static async countNonLues(userId: string) {
    return notificationRepository.countNonLues(userId);
  }

  static async marquerLue(id: string, userId: string) {
    await notificationRepository.marquerLue(id, userId);
  }

  static async marquerToutesLues(userId: string) {
    return notificationRepository.marquerToutesLues(userId);
  }

  static async delete(id: string) {
    await notificationRepository.softDelete(id);
  }
}

export const notificationService = new NotificationService();
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
