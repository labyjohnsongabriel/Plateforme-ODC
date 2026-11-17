import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

export const QR_TOKEN_CONFIG = {
  /** TTL par défaut (secondes) */
  TTL: 300,
  /** Version du format */
  VERSION: 1,
  /** Issuer (audit) */
  ISSUER: 'odc-qr',
  /** Scopes autorisés */
  SCOPES: ['presence'] as const,
} as const;

export type QrScope = (typeof QR_TOKEN_CONFIG.SCOPES)[number];

/* ============================================================================
   TYPES
   ============================================================================ */

export interface TokenPayload {
  v: number;
  sid: string;
  exp: number;
  iat: number;
  nonce: string;
  iss: string;
  scope: QrScope;
  kid: string;
}

export interface SignedToken {
  token: string;
  expiresAt: number;
  expiresIn: number;
  nonce: string;
}

export type VerifyResult =
  | { valid: true; payload: TokenPayload }
  | { valid: false; reason: VerifyFailureReason };

export type VerifyFailureReason =
  | 'malformed'
  | 'invalid_version'
  | 'invalid_scope'
  | 'invalid_signature'
  | 'expired'
  | 'unknown_kid'
  | 'wrong_issuer'
  | 'wrong_session';

/* ============================================================================
   GESTION DES SECRETS (rotation)
   ============================================================================ */

/**
 * Récupère les secrets actifs.
 * `kid` = "current" ou "previous" (rotation)
 */
function getSecret(kid: string): string | null {
  const map: Record<string, string | undefined> = {
    k1: process.env.QR_TOKEN_SECRET_K1,
    k2: process.env.QR_TOKEN_SECRET_K2, // rotation
  };
  return map[kid] ?? null;
}

/** Retourne le `kid` courant (le plus récent) */
function getCurrentKid(): string {
  return process.env.QR_TOKEN_ACTIVE_KID ?? 'k1';
}

/** Retourne tous les `kid` valides (pour vérification) */
function getValidKids(): string[] {
  const current = getCurrentKid();
  const previous = process.env.QR_TOKEN_PREVIOUS_KID;
  return previous ? [current, previous] : [current];
}

/* ============================================================================
   ENCODAGE / DÉCODAGE
   ============================================================================ */

function base64urlEncode(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

function base64urlDecode(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/* ============================================================================
   SIGNATURE
   ============================================================================ */

function sign(header: string, payload: string, kid: string): string {
  const secret = getSecret(kid);
  if (!secret) throw new Error(`Secret introuvable pour kid=${kid}`);
  const data = `${header}.${payload}`;
  return createHmac('sha256', secret).update(data).digest('base64url');
}

/* ============================================================================
   GÉNÉRATION
   ============================================================================ */

/**
 * Génère un token QR signé pour une session.
 * @param sessionId UUID de la session
 * @param ttlSeconds Durée de validité (défaut 300)
 */
export function generateQrToken(
  sessionId: string,
  ttlSeconds: number = QR_TOKEN_CONFIG.TTL,
): SignedToken {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlSeconds;
  const kid = getCurrentKid();

  const header = base64urlEncode(
    JSON.stringify({ alg: 'HS256', typ: 'QR', v: QR_TOKEN_CONFIG.VERSION }),
  );

  const payload: TokenPayload = {
    v: QR_TOKEN_CONFIG.VERSION,
    sid: sessionId,
    exp,
    iat: now,
    nonce: randomBytes(12).toString('base64url'),
    iss: QR_TOKEN_CONFIG.ISSUER,
    scope: 'presence',
    kid,
  };

  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signature = sign(header, payloadB64, kid);

  return {
    token: `${header}.${payloadB64}.${signature}`,
    expiresAt: exp,
    expiresIn: ttlSeconds,
    nonce: payload.nonce,
  };
}

/* ============================================================================
   VÉRIFICATION
   ============================================================================ */

/**
 * Vérifie un token QR.
 * @param token Token signé à vérifier
 * @param expectedSessionId Si fourni, vérifie que le `sid` correspond
 */
export function verifyQrToken(
  token: string,
  expectedSessionId?: string,
): VerifyResult {
  if (typeof token !== 'string' || token.length < 20) {
    return { valid: false, reason: 'malformed' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'malformed' };
  }

  const [headerB64, payloadB64, signature] = parts;

  /* ─── Décoder header ─── */
  let header: { alg?: string; typ?: string; v?: number };
  try {
    header = JSON.parse(base64urlDecode(headerB64).toString('utf8'));
  } catch {
    return { valid: false, reason: 'malformed' };
  }

  if (header.alg !== 'HS256' || header.typ !== 'QR') {
    return { valid: false, reason: 'malformed' };
  }
  if (header.v !== QR_TOKEN_CONFIG.VERSION) {
    return { valid: false, reason: 'invalid_version' };
  }

  /* ─── Décoder payload ─── */
  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString('utf8'));
  } catch {
    return { valid: false, reason: 'malformed' };
  }

  if (payload.v !== QR_TOKEN_CONFIG.VERSION) {
    return { valid: false, reason: 'invalid_version' };
  }
  if (!QR_TOKEN_CONFIG.SCOPES.includes(payload.scope)) {
    return { valid: false, reason: 'invalid_scope' };
  }
  if (payload.iss !== QR_TOKEN_CONFIG.ISSUER) {
    return { valid: false, reason: 'wrong_issuer' };
  }
  if (expectedSessionId && payload.sid !== expectedSessionId) {
    return { valid: false, reason: 'wrong_session' };
  }

  /* ─── Vérifier signature ─── */
  const validKids = getValidKids();
  if (!validKids.includes(payload.kid)) {
    return { valid: false, reason: 'unknown_kid' };
  }

  const expectedSig = sign(headerB64, payloadB64, payload.kid);
  const expectedBuf = base64urlDecode(expectedSig);
  const actualBuf = base64urlDecode(signature);

  if (!safeEqual(expectedBuf, actualBuf)) {
    return { valid: false, reason: 'invalid_signature' };
  }

  /* ─── Vérifier expiration ─── */
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true, payload };
}

/* ============================================================================
   HELPERS
   ============================================================================ */

/** Retourne l'ID de session extrait d'un token (SANS vérification) */
export function peekSessionId(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64urlDecode(parts[1]).toString('utf8'));
    return typeof payload.sid === 'string' ? payload.sid : null;
  } catch {
    return null;
  }
}

/** Retourne le nonce d'un token (SANS vérification) */
export function peekNonce(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64urlDecode(parts[1]).toString('utf8'));
    return typeof payload.nonce === 'string' ? payload.nonce : null;
  } catch {
    return null;
  }
}