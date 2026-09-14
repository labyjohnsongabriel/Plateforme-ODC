import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../config/logger';

const KEYS_DIR = path.join(process.cwd(), 'keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');

let privateKeyCache: string | null = null;
let publicKeyCache: string | null = null;

/**
 * Génère une paire de clés RSA 2048 bits
 */
export async function generateKeyPair(): Promise<{
  privateKey: string;
  publicKey: string;
}> {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  await fs.mkdir(KEYS_DIR, { recursive: true });
  await fs.writeFile(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
  await fs.writeFile(PUBLIC_KEY_PATH, publicKey, { mode: 0o644 });

  privateKeyCache = privateKey;
  publicKeyCache = publicKey;

  logger.info('🔑 Paire de clés RSA générée');

  return { privateKey, publicKey };
}

/**
 * Charge la clé privée (avec cache)
 */
async function getPrivateKey(): Promise<string> {
  if (privateKeyCache) return privateKeyCache;

  try {
    privateKeyCache = await fs.readFile(PRIVATE_KEY_PATH, 'utf-8');
    return privateKeyCache;
  } catch {
    await generateKeyPair();
    return privateKeyCache!;
  }
}

/**
 * Charge la clé publique (avec cache)
 */
async function getPublicKey(): Promise<string> {
  if (publicKeyCache) return publicKeyCache;

  try {
    publicKeyCache = await fs.readFile(PUBLIC_KEY_PATH, 'utf-8');
    return publicKeyCache;
  } catch {
    await generateKeyPair();
    return publicKeyCache!;
  }
}

/**
 * Signe un contenu avec la clé privée
 */
export async function signData(data: any): Promise<string> {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  const privateKey = await getPrivateKey();

  const signature = crypto.sign('sha256', Buffer.from(content), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
  });

  return signature.toString('base64');
}

/**
 * Vérifie une signature
 */
export async function verifySignature(
  data: any,
  signature: string
): Promise<boolean> {
  try {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    const publicKey = await getPublicKey();

    return crypto.verify(
      'sha256',
      Buffer.from(content),
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
      },
      Buffer.from(signature, 'base64')
    );
  } catch {
    return false;
  }
}

/**
 * Signe une attestation complète
 */
export async function signAttestation(data: {
  numero: string;
  participantId: string;
  sessionId: string;
  dateEmission: Date;
  hash: string;
}): Promise<string> {
  const payload = {
    numero: data.numero,
    participantId: data.participantId,
    sessionId: data.sessionId,
    dateEmission: data.dateEmission.toISOString(),
    hash: data.hash,
  };

  return signData(payload);
}

/**
 * Vérifie une attestation signée
 */
export async function verifyAttestation(
  data: {
    numero: string;
    participantId: string;
    sessionId: string;
    dateEmission: Date;
    hash: string;
  },
  signature: string
): Promise<boolean> {
  const payload = {
    numero: data.numero,
    participantId: data.participantId,
    sessionId: data.sessionId,
    dateEmission: data.dateEmission.toISOString(),
    hash: data.hash,
  };

  return verifySignature(payload, signature);
}

/**
 * Chiffre un contenu (AES-256-GCM)
 */
export function encryptData(plainText: string, secret: string): string {
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Déchiffre un contenu AES-256-GCM
 */
export function decryptData(encrypted: string, secret: string): string {
  const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');

  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Génère un OTP numérique
 */
export function generateOtp(length = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(crypto.randomInt(min, max + 1));
}

/**
 * Génère un UUID v4
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * Génère un token aléatoire sécurisé
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Vérifie si les clés existent
 */
export async function keysExist(): Promise<boolean> {
  try {
    await fs.access(PRIVATE_KEY_PATH);
    await fs.access(PUBLIC_KEY_PATH);
    return true;
  } catch {
    return false;
  }
}