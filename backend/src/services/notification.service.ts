// src/services/notification.service.ts
import { notificationRepository } from '../repositories/notification.repository';
import { TypeNotification } from '../entities/enums';
import { emitToUser, isSocketInitialized } from '../sockets';

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
    if (isSocketInitialized()) {
      emitToUser(input.userId, 'notification:new', notification);
    }
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
    const notifications = await notificationRepository.saveMany(entities);
    if (isSocketInitialized()) {
      notifications.forEach((notification) => {
        emitToUser(notification.userId, 'notification:new', notification);
      });
    }
    return notifications;
  }

  static async findAll(userId: string, page = 1, limit = 20) {
    const all = await notificationRepository.findByUser(userId, 10000);
    return {
      data: all.slice((page - 1) * limit, page * limit),
      total: all.length,
      page, limit,
      totalPages: Math.ceil(all.length / limit),
    };
  }

  static async mesNotifications(
    userId: string,
    options: { page: number; limit: number },
  ) {
    const result = await this.findAll(userId, options.page, options.limit);
    return {
      ...result,
      nonLues: await this.countNonLues(userId),
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

export const notificationService = {
  create: NotificationService.create,
  createMany: NotificationService.createMany,
  findAll: NotificationService.findAll,
  mesNotifications: NotificationService.mesNotifications,
  countNonLues: NotificationService.countNonLues,
  marquerLue: NotificationService.marquerLue,
  marquerToutesLues: NotificationService.marquerToutesLues,
  delete: NotificationService.delete,
};