import crypto from 'crypto';

/**
 * Algorithme par défaut
 */
export const DEFAULT_HASH_ALGORITHM = 'sha256';

/**
 * Calcule le hash SHA-256 d'une chaîne
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Calcule le hash SHA-512
 */
export function sha512(data: string): string {
  return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * Calcule le hash MD5 (pour checksums non-sécurisés uniquement)
 */
export function md5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Calcule le hash d'un objet (sérialisation JSON stable)
 */
export function hashObject(obj: any, algorithm = 'sha256'): string {
  const serialized = stableStringify(obj);
  return crypto.createHash(algorithm).update(serialized).digest('hex');
}

/**
 * Hash d'un fichier (streaming)
 */
export async function hashFile(
  filePath: string,
  algorithm = 'sha256'
): Promise<string> {
  const fs = await import('fs/promises');
  const buffer = await fs.readFile(filePath);
  return crypto.createHash(algorithm).update(buffer).digest('hex');
}

/**
 * Hash HMAC (avec clé secrète)
 */
export function hmac(
  data: string,
  secret: string,
  algorithm = 'sha256'
): string {
  return crypto.createHmac(algorithm, secret).update(data).digest('hex');
}

/**
 * Sérialisation JSON stable (clés triées)
 */
export function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;

  const keys = Object.keys(obj).sort();
  const pairs = keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`);
  return `{${pairs.join(',')}}`;
}

/**
 * Génère un hash aléatoire (pour tokens)
 */
export function randomHash(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Vérifie l'intégrité d'un contenu
 */
export function verifyHash(
  data: string,
  expectedHash: string,
  algorithm = 'sha256'
): boolean {
  const computed = crypto.createHash(algorithm).update(data).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(computed, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
}

/**
 * Checksum d'un objet attestation
 */
export function computeAttestationChecksum(data: {
  numero: string;
  participantId: string;
  sessionId: string;
  dateEmission: Date;
}): string {
  const payload = [
    data.numero,
    data.participantId,
    data.sessionId,
    data.dateEmission.toISOString(),
  ].join('|');

  return sha256(payload);
}