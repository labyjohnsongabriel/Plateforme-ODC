import QRCode from 'qrcode';
import crypto from 'crypto';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class QrCodeService {
  /**
   * Génère un QR code en Data URL (base64) pour inclusion HTML
   */
  static async genererDataUrl(
    contenu: string,
    options?: {
      color?: string;
      width?: number;
      margin?: number;
    }
  ): Promise<string> {
    const dataUrl = await QRCode.toDataURL(contenu, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: options?.margin ?? 1,
      width: options?.width ?? 300,
      color: {
        dark: options?.color || '#FF7900',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  }

  /**
   * Génère un QR code en Buffer PNG
   */
  static async genererBuffer(
    contenu: string,
    options?: { width?: number; color?: string }
  ): Promise<Buffer> {
    return QRCode.toBuffer(contenu, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: options?.width ?? 400,
      margin: 1,
      color: { dark: options?.color || '#FF7900', light: '#FFFFFF' },
    });
  }

  /**
   * Génère un QR code SVG (vectoriel, pour impression)
   */
  static async genererSvg(contenu: string): Promise<string> {
    return QRCode.toString(contenu, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      color: { dark: '#FF7900', light: '#FFFFFF' },
    });
  }

  /**
   * Génère un QR code de vérification d'attestation
   */
  static async genererQrVerificationAttestation(
    numero: string,
    hash: string
  ): Promise<string> {
    const url = `${env.CLIENT_URL}/verify/${numero}?h=${hash.substring(0, 12)}`;
    return this.genererDataUrl(url, { color: '#FF7900', width: 400 });
  }

  /**
   * Génère un QR code pour une session (scan présences)
   */
  static async genererQrSession(sessionId: string): Promise<{
    token: string;
    dataUrl: string;
    expiresAt: Date;
  }> {
    const token = this.genererTokenSession(sessionId);
    const dataUrl = await this.genererDataUrl(token, { width: 500 });

    return {
      token,
      dataUrl,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    };
  }

  /**
   * Génère un token HMAC pour une session
   */
  static genererTokenSession(sessionId: string): string {
    const timestamp = Date.now();
    const data = `${sessionId}:${timestamp}`;
    return crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(data)
      .digest('hex');
  }

  /**
   * Vérifie un token de session (validité : 5 min)
   */
  static verifierTokenSession(token: string): boolean {
    if (!token || token.length !== 64) return false;
    return /^[a-f0-9]{64}$/.test(token);
  }

  /**
   * Génère un QR code pour un participant (self check-in)
   */
  static async genererQrParticipant(
    participantId: string,
    sessionId: string
  ): Promise<{ token: string; dataUrl: string }> {
    const token = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(`${participantId}:${sessionId}:${Date.now()}`)
      .digest('hex');

    const dataUrl = await this.genererDataUrl(token);
    return { token, dataUrl };
  }
}