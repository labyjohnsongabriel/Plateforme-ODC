// src/controllers/public-contact.controller.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ContactService } from '../services/contact.service';
import { BadRequestError } from '../errors/AppError';
import { logger } from '../config/logger';

const contactSchema = z.object({
  nom: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  sujet: z.enum(['information', 'partenariat', 'support', 'autre']),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(), // honeypot
});

export class PublicContactController {
  static async send(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`[contact] POST reçu — IP: ${req.ip}`);

      const parsed = contactSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError(
          parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        );
      }

      const { website, ...payload } = parsed.data;

      // Honeypot
      if (website && website.length > 0) {
        logger.warn(`[contact] Honeypot déclenché depuis IP ${req.ip}`);
        return res.json({ success: true, message: 'Message envoyé.' });
      }

      // Traitement async (ne bloque pas la réponse)
      ContactService.process({
        ...payload,
        ip: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      }).catch((err) => {
        logger.error('[contact] Erreur traitement asynchrone:', err);
      });

      return res.json({
        success: true,
        message: 'Votre message a bien été envoyé. Nous vous répondrons sous 24h.',
      });
    } catch (err) {
      next(err);
    }
  }
}