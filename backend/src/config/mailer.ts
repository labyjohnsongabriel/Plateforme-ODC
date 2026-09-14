import nodemailer, { Transporter } from 'nodemailer';
import { env } from './env';
import { logger } from './logger';

export let transporter: Transporter;

export function initMailer(): void {
  transporter = nodemailer.createTransport({
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

  transporter.verify((err) => {
    if (err) {
      logger.warn('⚠️  SMTP non configuré :', err.message);
    } else {
      logger.info('✅ SMTP prêt');
    }
  });
}

export function getTransporter(): Transporter {
  if (!transporter) initMailer();
  return transporter;
}