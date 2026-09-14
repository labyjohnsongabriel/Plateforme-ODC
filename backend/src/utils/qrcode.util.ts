import QRCode from 'qrcode';
import crypto from 'crypto';
import { env } from '../config/env';

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  color?: string;
  background?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

const DEFAULT_OPTIONS: Required<QrCodeOptions> = {
  width: 400,
  margin: 1,
  color: '#FF7900',
  background: '#FFFFFF',
  errorCorrectionLevel: 'H',
};

/**
 * Génère un QR code en Data URL (base64)
 */
export async function generateQrCodeDataUrl(
  content: string,
  options?: QrCodeOptions
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return QRCode.toDataURL(content, {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    type: 'image/png',
    quality: 0.95,
    margin: opts.margin,
    width: opts.width,
    color: {
      dark: opts.color,
      light: opts.background,
    },
  });
}

/**
 * Génère un QR code en Buffer PNG
 */
export async function generateQrCodeBuffer(
  content: string,
  options?: QrCodeOptions
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return QRCode.toBuffer(content, {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    type: 'png',
    width: opts.width,
    margin: opts.margin,
    color: {
      dark: opts.color,
      light: opts.background,
    },
  });
}

/**
 * Génère un QR code SVG (vectoriel)
 */
export async function generateQrCodeSvg(content: string): Promise<string> {
  return QRCode.toString(content, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
    color: {
      dark: '#FF7900',
      light: '#FFFFFF',
    },
  });
}

/**
 * Génère l'URL de vérification d'une attestation
 */
export function buildAttestationVerifyUrl(numero: string, hash?: string): string {
  const base = `${env.CLIENT_URL}/verify/${numero}`;
  return hash ? `${base}?h=${hash.substring(0, 12)}` : base;
}

/**
 * QR Code de vérification d'attestation
 */
export async function generateAttestationQr(
  numero: string,
  hash: string
): Promise<string> {
  const url = buildAttestationVerifyUrl(numero, hash);
  return generateQrCodeDataUrl(url, { width: 400 });
}

/**
 * Génère un token HMAC pour une session (scan présences)
 * Le token est valide pendant 5 minutes
 */
export function generateSessionQrToken(sessionId: string): string {
  const timestamp = Date.now();
  const payload = `${sessionId}:${timestamp}`;
  return crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(payload)
    .digest('hex');
}

/**
 * Vérifie un token de session
 */
export function verifySessionQrToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  return /^[a-f0-9]{64}$/.test(token);
}

/**
 * Token QR pour un participant (self check-in)
 */
export function generateParticipantQrToken(
  participantId: string,
  sessionId: string
): string {
  const timestamp = Date.now();
  const payload = `${participantId}:${sessionId}:${timestamp}`;
  return crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(payload)
    .digest('hex');
}

/**
 * Contenu JSON encodé dans un QR code
 */
export function buildQrPayload(data: Record<string, any>): string {
  return JSON.stringify({
    ...data,
    ts: Date.now(),
    v: '1.0',
  });
}

/**
 * Parse un payload QR code
 */
export function parseQrPayload(payload: string): Record<string, any> | null {
  try {
    const parsed = JSON.parse(payload);
    if (!parsed.v || !parsed.ts) return null;
    return parsed;
  } catch {
    return null;
  }
}