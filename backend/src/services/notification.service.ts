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