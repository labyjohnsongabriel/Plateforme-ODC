// src/services/qr-code.service.ts
import QRCode from 'qrcode';
import crypto from 'crypto';
import { env }    from '../config/env';
import { logger } from '../config/logger';
import { BadRequestError } from '../errors/AppError';

export interface QrOptions {
  color?: string;
  width?: number;
  margin?: number;
}

export interface QrSessionResult {
  token: string;
  dataUrl: string;
  expiresAt: Date;
}

const QR_DEFAULT_COLOR = '#FF7900';
const QR_DEFAULT_WIDTH = 300;
const QR_TOKEN_LENGTH = 64;         // SHA-256 hex
const QR_SESSION_TTL_MS = 5 * 60 * 1000; // 5 min

export class QrCodeService {
  // ==========================================================================
  // 🎨 GÉNÉRATION
  // ==========================================================================
  static async genererDataUrl(contenu: string, options?: QrOptions): Promise<string> {
    if (!contenu) throw new BadRequestError('Contenu QR vide');

    return QRCode.toDataURL(contenu, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: options?.margin ?? 1,
      width: options?.width ?? QR_DEFAULT_WIDTH,
      color: {
        dark: options?.color ?? QR_DEFAULT_COLOR,
        light: '#FFFFFF',
      },
    });
  }

  static async genererBuffer(contenu: string, options?: QrOptions): Promise<Buffer> {
    if (!contenu) throw new BadRequestError('Contenu QR vide');

    return QRCode.toBuffer(contenu, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: options?.width ?? 400,
      margin: options?.margin ?? 1,
      color: {
        dark: options?.color ?? QR_DEFAULT_COLOR,
        light: '#FFFFFF',
      },
    });
  }

  static async genererSvg(contenu: string): Promise<string> {
    if (!contenu) throw new BadRequestError('Contenu QR vide');

    return QRCode.toString(contenu, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      color: { dark: QR_DEFAULT_COLOR, light: '#FFFFFF' },
    });
  }

  // ==========================================================================
  // 🎓 ATTESTATION
  // ==========================================================================
  static async genererQrVerificationAttestation(
    numero: string,
    hash: string,
  ): Promise<string> {
    if (!numero || !hash) throw new BadRequestError('Numéro et hash requis');

    const url = `${env.CLIENT_URL}/verify/${encodeURIComponent(numero)}?h=${hash.substring(0, 12)}`;
    return this.genererDataUrl(url, { color: QR_DEFAULT_COLOR, width: 400 });
  }

  // ==========================================================================
  // 📅 SESSION (présence)
  // ==========================================================================
  static async genererQrSession(sessionId: string): Promise<QrSessionResult> {
    if (!sessionId) throw new BadRequestError('sessionId requis');

    const token = this.genererTokenSession(sessionId);
    const dataUrl = await this.genererDataUrl(token, { width: 500 });

    return {
      token,
      dataUrl,
      expiresAt: new Date(Date.now() + QR_SESSION_TTL_MS),
    };
  }

  /**
   * Token HMAC-SHA256 incluant le timestamp (permet une vérification TTL côté serveur).
   * Format : `{sessionId}:{timestamp}.{hmac}`
   */
  static genererTokenSession(sessionId: string): string {
    const timestamp = Date.now();
    const payload = `${sessionId}:${timestamp}`;
    const hmac = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(payload)
      .digest('hex');
    return `${payload}.${hmac}`;
  }

  /**
   * Vérifie un token de session et son TTL.
   * Retourne `true` si valide, sinon `false`.
   */
  static verifierTokenSession(token: string): boolean {
    if (!token || typeof token !== 'string') return false;

    const dot = token.lastIndexOf('.');
    if (dot === -1) return false;

    const payload = token.substring(0, dot);
    const hmac = token.substring(dot + 1);

    if (hmac.length !== QR_TOKEN_LENGTH) return false;

    const [sessionId, tsStr] = payload.split(':');
    const timestamp = Number(tsStr);
    if (!sessionId || !Number.isFinite(timestamp)) return false;

    // Vérifier le TTL
    if (Date.now() - timestamp > QR_SESSION_TTL_MS) {
      logger.warn(`⏰ QR token expiré (session=${sessionId})`);
      return false;
    }

    // Vérifier HMAC
    const expected = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(payload)
      .digest('hex');

    const same =
      hmac.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));

    if (!same) logger.warn(`🚫 QR token invalide (session=${sessionId})`);
    return same;
  }

  // ==========================================================================
  // 👤 PARTICIPANT (self check-in)
  // ==========================================================================
  static async genererQrParticipant(
    participantId: string,
    sessionId: string,
  ): Promise<{ token: string; dataUrl: string }> {
    if (!participantId || !sessionId) {
      throw new BadRequestError('participantId et sessionId requis');
    }

    const token = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(`${participantId}:${sessionId}:${Date.now()}`)
      .digest('hex');

    const dataUrl = await this.genererDataUrl(token);
    return { token, dataUrl };
  }
}