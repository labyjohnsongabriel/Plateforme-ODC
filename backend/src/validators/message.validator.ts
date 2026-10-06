// src/validators/messagerie.validator.ts
import { z } from 'zod';
import { uuidSchema, typeMessageSchema } from './common.validator';

/* ============================================================
 *  CONVERSATION PRIVÉE
 * ============================================================ */
export const createPrivateConversationSchema = z.object({
  body: z
    .object({
      destinataireId: uuidSchema,
    })
    .strict(),
});

/* ============================================================
 *  GROUPE
 * ============================================================ */
export const createGroupeConversationSchema = z.object({
  body: z
    .object({
      titre: z.string().trim().min(2).max(200),
      membreIds: z.array(uuidSchema).min(1).max(100),
      photoUrl: z.string().url().optional().or(z.literal('')),
    })
    .strict(),
});

/* ============================================================
 *  ENVOI DE MESSAGE
 * ============================================================ */
export const envoyerMessageSchema = z
  .object({
    body: z
      .object({
        contenu: z.string().trim().max(5000).optional(),
        type: typeMessageSchema.optional().default('TEXTE'),
        fichierUrl: z.string().url().optional(),
        fichierNom: z.string().trim().max(255).optional(),
        fichierTaille: z.coerce.number().int().nonnegative().optional(),
      })
      .strict(),
    params: z.object({ id: uuidSchema }),
  })
  .refine(
    (d) => d.body.contenu || d.body.fichierUrl,
    { message: 'Message vide (contenu ou fichier requis)', path: ['body', 'contenu'] },
  )
  .refine(
    (d) => d.body.type === 'TEXTE' || !!d.body.fichierUrl,
    { message: 'Un fichier est requis pour ce type', path: ['body', 'fichierUrl'] },
  );