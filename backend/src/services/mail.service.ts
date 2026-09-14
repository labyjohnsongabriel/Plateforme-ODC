import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class MailService {
  private static transporter: Transporter | null = null;
  private static templatesCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  /**
   * Initialise le transporteur SMTP
   */
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
      if (err) logger.warn('⚠️  SMTP non disponible :', err.message);
      else logger.info('✅ SMTP prêt');
    });

    return this.transporter;
  }

  /**
   * Charge et compile un template
   */
  private static async getTemplate(
    templateName: string
  ): Promise<HandlebarsTemplateDelegate> {
    if (this.templatesCache.has(templateName)) {
      return this.templatesCache.get(templateName)!;
    }

    const tplPath = path.join(__dirname, '../templates', templateName);
    const source = await fs.readFile(tplPath, 'utf-8');

    // Helpers
    handlebars.registerHelper('formatDate', (d: Date) =>
      new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    );
    handlebars.registerHelper('year', () => new Date().getFullYear());
    handlebars.registerHelper('uppercase', (s: string) => s.toUpperCase());

    const compiled = handlebars.compile(source);
    this.templatesCache.set(templateName, compiled);
    return compiled;
  }

  /**
   * Envoie un email
   */
  static async send(params: {
    to: string | string[];
    subject: string;
    template: string;
    context: any;
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
        odcName: 'Orange Digital Center',
        odcWebsite: 'https://odc.orange.mg',
      });

      const info = await this.getTransporter().sendMail({
        from: env.SMTP_FROM,
        to: Array.isArray(params.to) ? params.to.join(',') : params.to,
        cc: params.cc,
        bcc: params.bcc,
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

  /**
   * Email de bienvenue après inscription
   */
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

  /**
   * Email d'inscription à une formation
   */
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

  /**
   * Email de sélection acceptée
   */
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

  /**
   * Email de sélection refusée
   */
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

  /**
   * Email avec attestation PDF
   */
  static async envoyerAttestation(params: {
    destinataire: string;
    nomParticipant: string;
    formationTitre: string;
    numeroAttestation: string;
    pdfBuffer: Buffer;
  }) {
    await this.send({
      to: params.destinataire,
      subject: `🎓 Votre attestation ODC — ${params.formationTitre}`,
      template: 'email-attestation.hbs',
      context: {
        nomParticipant: params.nomParticipant,
        formationTitre: params.formationTitre,
        numeroAttestation: params.numeroAttestation,
        urlVerification: `${env.CLIENT_URL}/verify/${params.numeroAttestation}`,
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

  /**
   * Email de réinitialisation de mot de passe
   */
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

  /**
   * Email de rappel de session
   */
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

  /**
   * Email générique
   */
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

  /**
   * Envoi en masse
   */
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
        })
      )
    );

    const succes = results.filter((r) => r.status === 'fulfilled').length;
    const echecs = results.length - succes;

    logger.info(`📧 Envoi masse : ${succes} OK, ${echecs} échecs`);
    return { succes, echecs };
  }
}