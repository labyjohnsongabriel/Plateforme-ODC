// src/lib/presences/qr-payload.ts
import { z } from 'zod';

/* ============================================================================
   SCHÉMA DU PAYLOAD QR
   ============================================================================ */

export const qrPayloadSchema = z.object({
  v: z.literal(1),                              // version du format
  sessionId: z.string().uuid(),
  qrToken: z.string().min(16).max(128),
  expiresAt: z.number().int().positive(),       // timestamp ms
});

export type QrPayload = z.infer<typeof qrPayloadSchema>;

/* ============================================================================
   ENCODAGE / DÉCODAGE
   ============================================================================ */

export function encodeQrPayload(payload: QrPayload): string {
  return JSON.stringify(payload);
}

export function decodeQrPayload(raw: string): QrPayload | null {
  try {
    const text = raw.trim();

    // ─── Format JSON direct ───
    if (text.startsWith('{')) {
      const parsed = qrPayloadSchema.safeParse(JSON.parse(text));
      return parsed.success ? parsed.data : null;
    }

    // ─── Format URL : https://app/scan?session=...&token=...&exp=... ───
    if (/^https?:\/\//i.test(text)) {
      const url = new URL(text);
      const candidate = {
        v: 1,
        sessionId: url.searchParams.get('session') ?? '',
        qrToken: url.searchParams.get('token') ?? '',
        expiresAt: Number(url.searchParams.get('exp') ?? 0),
      };
      const parsed = qrPayloadSchema.safeParse(candidate);
      return parsed.success ? parsed.data : null;
    }

    return null;
  } catch {
    return null;
  }
}

/* ============================================================================
   HELPERS
   ============================================================================ */

export function isPayloadExpired(payload: QrPayload): boolean {
  return Date.now() > payload.expiresAt;
}

export function generateQrToken(): string {
  const cryptoObj = globalThis.crypto;
  const bytes = new Uint8Array(24);
  cryptoObj.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}