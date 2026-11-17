// src/services/qrcode.service.ts
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { env } from '../config/env';

const TOKEN_VERSION = 1;

export interface QrTokenPayload {
  v: number;
  sid: string;
  exp: number;
  iat: number;
  nonce: string;
}

export type QrVerifyReason =
  | 'malformed'
  | 'invalid_signature'
  | 'expired'
  | 'wrong_session'
  | 'invalid_version';

export type QrVerifyResult =
  | { valid: true; payload: QrTokenPayload }
  | { valid: false; reason: QrVerifyReason };

function b64urlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function b64urlDecode(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

function getSecret(): string {
  const secret = env.QR_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'QR_TOKEN_SECRET manquant ou trop court (32 caractères minimum)',
    );
  }
  return secret;
}

function sign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export class QrCodeService {
  static genererTokenSession(
    sessionId: string,
    dureeMinutes?: number,
  ): string {
    const ttl = (dureeMinutes ?? env.QR_TOKEN_TTL_MINUTES) * 60;
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttl;

    const header = b64urlEncode(
      JSON.stringify({ alg: 'HS256', typ: 'QR', v: TOKEN_VERSION }),
    );

    const payload: QrTokenPayload = {
      v: TOKEN_VERSION,
      sid: sessionId,
      exp,
      iat: now,
      nonce: randomBytes(12).toString('base64url'),
    };

    const payloadB64 = b64urlEncode(JSON.stringify(payload));
    const signature = sign(`${header}.${payloadB64}`);

    return `${header}.${payloadB64}.${signature}`;
  }

  static verifierTokenSession(
    token: string,
    expectedSessionId?: string,
  ): QrVerifyResult {
    if (!token || typeof token !== 'string') {
      return { valid: false, reason: 'malformed' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, reason: 'malformed' };
    }

    const [headerB64, payloadB64, signature] = parts;

    let header: { alg?: string; typ?: string; v?: number };
    try {
      header = JSON.parse(b64urlDecode(headerB64).toString('utf8'));
    } catch {
      return { valid: false, reason: 'malformed' };
    }

    if (header.alg !== 'HS256' || header.typ !== 'QR') {
      return { valid: false, reason: 'malformed' };
    }
    if (header.v !== TOKEN_VERSION) {
      return { valid: false, reason: 'invalid_version' };
    }

    let payload: QrTokenPayload;
    try {
      payload = JSON.parse(b64urlDecode(payloadB64).toString('utf8'));
    } catch {
      return { valid: false, reason: 'malformed' };
    }

    if (payload.v !== TOKEN_VERSION) {
      return { valid: false, reason: 'invalid_version' };
    }

    if (expectedSessionId && payload.sid !== expectedSessionId) {
      return { valid: false, reason: 'wrong_session' };
    }

    const expectedSig = sign(`${headerB64}.${payloadB64}`);
    const expectedBuf = Buffer.from(expectedSig, 'base64url');
    const providedBuf = Buffer.from(signature, 'base64url');

    if (
      expectedBuf.length !== providedBuf.length ||
      !timingSafeEqual(expectedBuf, providedBuf)
    ) {
      return { valid: false, reason: 'invalid_signature' };
    }

    const now = Math.floor(Date.now() / 1000);
    const skew = env.QR_TOKEN_CLOCK_SKEW_SECONDS;
    if (payload.exp + skew < now) {
      return { valid: false, reason: 'expired' };
    }

    return { valid: true, payload };
  }

  static peekSessionId(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(b64urlDecode(parts[1]).toString('utf8'));
      return typeof payload.sid === 'string' ? payload.sid : null;
    } catch {
      return null;
    }
  }
}