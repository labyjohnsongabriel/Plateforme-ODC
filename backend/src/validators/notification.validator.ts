// src/validators/notification.validator.ts
import { z } from 'zod';
import { uuidSchema, roleNameSchema, typeNotificationSchema } from './common.validator';

/* ============================================================
 *  BROADCAST (admin)
 * ============================================================ */
export const broadcastNotificationSchema = z.object({
  body: z
    .object({
      titre: z.string().trim().min(2).max(200),
      message: z.string().trim().min(2).max(2000),
      type: typeNotificationSchema.optional().default('INFO'),
      lien: z.string().trim().max(300).optional(),
      icone: z.string().max(100).optional(),
      userIds: z.array(uuidSchema).min(1).max(10000),
    })
    .strict(),
});

/* ============================================================
 *  ENVOI PAR RÔLE
 * ============================================================ */
export const sendToRoleSchema = z.object({
  body: z
    .object({
      titre: z.string().trim().min(2).max(200),
      message: z.string().trim().min(2).max(2000),
      type: typeNotificationSchema.optional().default('INFO'),
      lien: z.string().trim().max(300).optional(),
    })
    .strict(),
  params: z.object({ roleName: roleNameSchema }),
});