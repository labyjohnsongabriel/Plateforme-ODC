// src/services/mail.service.ts
import nodemailer, { Transporter } from 'nodemailer';
import handlebars, { HandlebarsTemplateDelegate } from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../config/logger';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface SendTemplateOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
    contentType?: string;
  }>;
}

/* ============================================================================
   SERVICE
   ============================================================================ */

export class MailService {
  private static transporter: Transporter | null = null;
  private static templatesCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private static helpersRegistered = false;

  /* ==========================================================================
     TRANSPORTER
     ========================================================================== */

  private static getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      tls: { rejectUnauthorized: false },
    });

    this.transporter.verify((err) => {
      if (err) {
        logger.warn('⚠️  SMTP non disponible :', err.message);
      } else {
        logger.info('✅ SMTP prêt');
      }
    });

    return this.transporter;
  }

  /* ==========================================================================
     HELPERS HANDLEBARS
     ========================================================================== */

  private static registerHelpers(): void {
    if (this.helpersRegistered) return;
    this.helpersRegistered = true;

    handlebars.registerHelper('formatDate', (d: Date | string) => {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      } catch {
        return '—';
      }
    });

    handlebars.registerHelper('formatNumber', (n: number, decimals = 2) => {
      const num = Number(n ?? 0);
      if (isNaN(num)) return '0';
      return num.toFixed(decimals);
    });

    handlebars.registerHelper('uppercase', (s: string) =>
      String(s ?? '').toUpperCase(),
    );

    handlebars.registerHelper('lowercase', (s: string) =>
      String(s ?? '').toLowerCase(),
    );

    handlebars.registerHelper('eq', (a: any, b: any) => a === b);

    handlebars.registerHelper('year', () => new Date().getFullYear());
  }

  /* ==========================================================================
     TEMPLATE — Chargement robuste
     ========================================================================== */

  private static async getTemplate(
    templateName: string,
  ): Promise<HandlebarsTemplateDelegate> {
    if (this.templatesCache.has(templateName)) {
      return this.templatesCache.get(templateName)!;
    }

    const candidates = [
      path.join(process.cwd(), 'src', 'templates', templateName),
      path.join(process.cwd(), 'dist', 'templates', templateName),
      path.join(__dirname, '..', 'templates', templateName),
      path.join(process.cwd(), 'src', 'templates', 'emails', templateName),
      path.join(process.cwd(), 'dist', 'templates', 'emails', templateName),
      path.join(__dirname, '..', 'templates', 'emails', templateName),
    ];

    let source: string | null = null;
    let usedPath: string | null = null;

    for (const p of candidates) {
      try {
        source = await fs.readFile(p, 'utf-8');
        usedPath = p;
        break;
      } catch { /* next */ }
    }

    if (!source) {
      throw new Error(
        `Template "${templateName}" introuvable. Chemins testés:\n  ${candidates.join('\n  ')}`,
      );
    }

    logger.debug(`📧 Template chargé : ${usedPath}`);

    this.registerHelpers();

    const compiled = handlebars.compile(source);
    this.templatesCache.set(templateName, compiled);

    return compiled;
  }

  /* ==========================================================================
     ⭐ SEND — méthode générique (avec replyTo ajouté)
     ========================================================================== */

  static async send(params: {
    to: string | string[];
    subject: string;
    template: string;
    context: any;
    replyTo?: string;                          // ⭐ AJOUT
    attachments?: Array<{
      filename: string;
      content?: Buffer;
      path?: string;
      contentType?: string;
    }>;
    cc?: string | string[];
    bcc?: string | string[];
  }): Promise<void> {
    try {
      const template = await this.getTemplate(params.template);
      const html = template({
        ...params.context,
        year: new Date().getFullYear(),
        odcName: env.ODC_NAME ?? 'Orange Digital Center',
        odcAdresse: env.ODC_ADRESSE ?? 'Fianarantsoa, Madagascar',
        odcWebsite: env.ODC_WEBSITE ?? 'https://odc.orange.mg',
        contactEmail: env.SMTP_REPLY_TO ?? 'contact@odc.mg',
      });

      const info = await this.getTransporter().sendMail({
        from: env.SMTP_FROM,
        to: Array.isArray(params.to) ? params.to.join(',') : params.to,
        cc: params.cc,
        bcc: params.bcc,
        replyTo: params.replyTo ?? env.SMTP_REPLY_TO, // ⭐ AJOUT
        subject: params.subject,
        html,
        attachments: params.attachments,
      });

      logger.info(`📧 Email envoyé : ${info.messageId} → ${params.to}`);
    } catch (err: any) {
      logger.error(`❌ Erreur envoi email : ${err.message}`);
      throw err;
    }
  }

  /* ==========================================================================
     ⭐ SEND TEMPLATE — alias pour compatibilité (contact.service.ts)
     ========================================================================== */

  /**
   * Alias de `send()` pour rester compatible avec les appels existants
   * (ex: ContactService.process qui appelle MailService.sendTemplate).
   */
  static async sendTemplate(opts: SendTemplateOptions): Promise<void> {
    return this.send({
      to: opts.to,
      subject: opts.subject,
      template: opts.template,
      context: opts.context,
      replyTo: opts.replyTo,                   // ⭐ propagé
      cc: opts.cc,
      bcc: opts.bcc,
      attachments: opts.attachments,
    });
  }

  /* ==========================================================================
     EMAIL ATTESTATION
     ========================================================================== */

  static async envoyerAttestation(params: {
    destinataire: string;
    nomParticipant: string;
    formationTitre: string;
    numeroAttestation: string;
    pdfBuffer: Buffer;
    noteFinale?: number;
    tauxPresence?: number;
    urlVerification?: string;
  }): Promise<void> {
    await this.send({
      to: params.destinataire,
      subject: `🎓 Votre attestation ODC — ${params.formationTitre}`,
      template: 'email-attestation.hbs',
      context: {
        nomParticipant: params.nomParticipant,
        formationTitre: params.formationTitre,
        numeroAttestation: params.numeroAttestation,
        noteFinale: params.noteFinale,
        tauxPresence: params.tauxPresence,
        urlVerification:
          params.urlVerification ??
          `${env.CLIENT_URL}/verifier-attestation/${params.numeroAttestation}`,
      },
      attachments: [
        {
          filename: `Attestation-${params.numeroAttestation}.pdf`,
          content: params.pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  /* ==========================================================================
     AUTRES EMAILS
     ========================================================================== */

  static async envoyerBienvenue(params: {
    destinataire: string;
    nomParticipant: string;
  }) {
    await this.send({
      to: params.destinataire,
      subject: '🎉 Bienvenue sur ODC Platform',
      template: 'email-bienvenue.hbs',
      context: {
        nomParticipant: params.nomParticipant,
        loginUrl: `${env.CLIENT_URL}/login`,
      },
    });
  }

  static async envoyerConfirmationInscription(params: {
    destinataire: string;
    nomParticipant: string;
    formationTitre: string;
    dateDebut: Date;
    lieu: string;
  }) {
    await this.send({
      to: params.destinataire,
      subject: `✅ Inscription enregistrée — ${params.formationTitre}`,
      template: 'email-inscription.hbs',
      context: params,
    });
  }

  static async envoyerSelectionAcceptee(params: {
    destinataire: string;
    nomParticipant: string;
    formationTitre: string;
    dateDebut: Date;
    lieu: string;
  }) {
    await this.send({
      to: params.destinataire,
      subject: `🎓 Candidature acceptée — ${params.formationTitre}`,
      template: 'email-selection.hbs',
      context: { ...params, accepte: true },
    });
  }

  static async envoyerSelectionRefusee(params: {
    destinataire: string;
    nomParticipant: string;
    formationTitre: string;
    motif?: string;
  }) {
    await this.send({
      to: params.destinataire,
      subject: `📋 Résultat candidature — ${params.formationTitre}`,
      template: 'email-selection.hbs',
      context: { ...params, accepte: false },
    });
  }

  static async envoyerResetPassword(params: {
    destinataire: string;
    nom: string;
    resetToken: string;
  }) {
    await this.send({
      to: params.destinataire,
      subject: '🔐 Réinitialisation de votre mot de passe',
      template: 'email-reset-password.hbs',
      context: {
        nom: params.nom,
        resetUrl: `${env.CLIENT_URL}/reset-password?token=${params.resetToken}`,
      },
    });
  }

  static async envoyerRappelSession(params: {
    destinataire: string;
    nomParticipant: string;
    formationTitre: string;
    dateDebut: Date;
    lieu: string;
    joursRestants: number;
  }) {
    await this.send({
      to: params.destinataire,
      subject: `⏰ Rappel : votre formation commence dans ${params.joursRestants} jour(s)`,
      template: 'email-rappel-session.hbs',
      context: params,
    });
  }

  static async envoyerEmailGenerique(params: {
    destinataire: string;
    sujet: string;
    contenuHtml: string;
  }) {
    const info = await this.getTransporter().sendMail({
      from: env.SMTP_FROM,
      to: params.destinataire,
      subject: params.sujet,
      html: params.contenuHtml,
    });
    logger.info(`📧 Email générique envoyé : ${info.messageId}`);
  }

  static async envoyerMasse(params: {
    destinataires: string[];
    sujet: string;
    template: string;
    contextBuilder: (destinataire: string) => any;
  }) {
    const results = await Promise.allSettled(
      params.destinataires.map((d) =>
        this.send({
          to: d,
          subject: params.sujet,
          template: params.template,
          context: params.contextBuilder(d),
        }),
      ),
    );

    const succes = results.filter((r) => r.status === 'fulfilled').length;
    const echecs = results.length - succes;

    logger.info(`📧 Envoi masse : ${succes} OK, ${echecs} échecs`);
    return { succes, echecs };
  }

  /* ==========================================================================
     ⭐ VÉRIFICATION SMTP (utile pour scripts de test)
     ========================================================================== */

  static async verifyConnection(): Promise<boolean> {
    try {
      await this.getTransporter().verify();
      logger.info('[mail] ✅ Connexion SMTP vérifiée');
      return true;
    } catch (err: any) {
      logger.error('[mail] ❌ Connexion SMTP échouée:', err?.message);
      return false;
    }
  }
}