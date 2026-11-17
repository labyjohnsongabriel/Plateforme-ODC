// src/services/contact.service.ts
import { logger } from '../config/logger';
import { env } from '../config/env';
import { MailService } from './mail.service';

export interface ContactMessage {
  nom: string;
  email: string;
  sujet: 'information' | 'partenariat' | 'support' | 'autre';
  message: string;
  ip?: string;
  userAgent?: string;
}

const SUJET_LABELS: Record<ContactMessage['sujet'], string> = {
  information: "Demande d'information",
  partenariat: 'Partenariat',
  support: 'Support technique',
  autre: 'Autre',
};

export class ContactService {
  static async process(data: ContactMessage): Promise<void> {
    const sujetLabel = SUJET_LABELS[data.sujet];
    const dateFr = new Date().toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Indian/Antananarivo',
    });

    const context = {
      nom: data.nom,
      email: data.email,
      sujet: data.sujet,
      sujetLabel,
      message: data.message,
      dateFr,
      ip: data.ip ?? '—',
      userAgent: data.userAgent ?? '—',
      odcName: env.ODC_NAME,
      odcAdresse: env.ODC_ADRESSE,
      odcWebsite: env.ODC_WEBSITE,
      contactEmail: env.SMTP_REPLY_TO,
      year: new Date().getFullYear(),
    };

    // 1. Notification admin
    try {
      await MailService.sendTemplate({
        to: env.SMTP_REPLY_TO,
        replyTo: data.email,
        subject: `📬 [Contact] ${sujetLabel} — ${data.nom}`,
        template: 'email-contact-admin.hbs',
        context,
      });
      logger.info(`[contact] Notification admin envoyée pour ${data.email}`);
    } catch (err) {
      logger.error('[contact] Erreur envoi admin:', err);
    }

    // 2. Auto-reply visiteur
    try {
      await MailService.sendTemplate({
        to: data.email,
        subject: `✅ Nous avons bien reçu votre message — ${env.ODC_NAME}`,
        template: 'email-contact-reply.hbs',
        context,
      });
      logger.info(`[contact] Auto-reply envoyé à ${data.email}`);
    } catch (err) {
      logger.error('[contact] Erreur envoi auto-reply:', err);
    }
  }
}