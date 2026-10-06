// src/services/signature.service.ts
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../config/logger';
import { InternalError } from '../errors/AppError';

const KEYS_DIR = path.join(process.cwd(), 'keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');

/**
 * Service de signature numérique RSA-PSS SHA-256.
 * Utilisé pour signer les attestations et garantir leur authenticité.
 */
export class SignatureService {
  private static keysLoaded = false;

  // ==========================================================================
  // 🔑 GESTION DES CLÉS
  // ==========================================================================
  static async genererPaireCles(): Promise<void> {
    await fs.mkdir(KEYS_DIR, { recursive: true });

    try {
      await fs.access(PRIVATE_KEY_PATH);
      await fs.access(PUBLIC_KEY_PATH);
      logger.info('🔑 Clés RSA déjà présentes');
      this.keysLoaded = true;
      return;
    } catch {
      // À générer
    }

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    await fs.writeFile(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
    await fs.writeFile(PUBLIC_KEY_PATH, publicKey, { mode: 0o644 });

    this.keysLoaded = true;
    logger.info('✅ Paire de clés RSA générée');
  }

  private static async ensureKeys(): Promise<void> {
    if (this.keysLoaded) return;
    try {
      await fs.access(PRIVATE_KEY_PATH);
      await fs.access(PUBLIC_KEY_PATH);
      this.keysLoaded = true;
    } catch {
      await this.genererPaireCles();
    }
  }

  private static async getPrivateKey(): Promise<string> {
    await this.ensureKeys();
    return fs.readFile(PRIVATE_KEY_PATH, 'utf-8');
  }

  private static async getPublicKey(): Promise<string> {
    await this.ensureKeys();
    return fs.readFile(PUBLIC_KEY_PATH, 'utf-8');
  }

  // ==========================================================================
  // ✍️ SIGNATURE / VÉRIFICATION
  // ==========================================================================
  static async signer(data: any): Promise<string> {
    const contenu = typeof data === 'string' ? data : JSON.stringify(data);
    const privateKey = await this.getPrivateKey();

    const signature = crypto.sign('sha256', Buffer.from(contenu, 'utf-8'), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    });

    return signature.toString('base64');
  }

  static async verifier(data: any, signature: string): Promise<boolean> {
    try {
      const contenu = typeof data === 'string' ? data : JSON.stringify(data);
      const publicKey = await this.getPublicKey();

      return crypto.verify(
        'sha256',
        Buffer.from(contenu, 'utf-8'),
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
        },
        Buffer.from(signature, 'base64'),
      );
    } catch (e: any) {
      logger.warn(`⚠️ Erreur vérification signature : ${e.message}`);
      return false;
    }
  }

  // ==========================================================================
  // 🧮 HASHES
  // ==========================================================================
  static hashSHA256(data: any): string {
    const contenu = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(contenu, 'utf-8').digest('hex');
  }

  static hashSHA512(data: any): string {
    const contenu = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha512').update(contenu, 'utf-8').digest('hex');
  }

  // ==========================================================================
  // 🎓 ATTESTATION
  // ==========================================================================
  static async signerAttestation(data: {
    numero: string;
    participantId: string;
    sessionId: string;
    dateEmission: Date;
  }): Promise<{ hash: string; signature: string }> {
    const payload = this.buildAttestationPayload(data);
    const hash = this.hashSHA256(payload);
    const signature = await this.signer({ ...payload, hash });
    return { hash, signature };
  }

  static async verifierAttestation(
    data: {
      numero: string;
      participantId: string;
      sessionId: string;
      dateEmission: Date;
      hash: string;
    },
    signature: string,
  ): Promise<boolean> {
    const payload = {
      ...this.buildAttestationPayload(data),
      hash: data.hash,
    };
    return this.verifier(payload, signature);
  }

  private static buildAttestationPayload(data: {
    numero: string;
    participantId: string;
    sessionId: string;
    dateEmission: Date;
  }) {
    return {
      numero: data.numero,
      participantId: data.participantId,
      sessionId: data.sessionId,
      dateEmission: data.dateEmission.toISOString(),
    };
  }

  // ==========================================================================
  // 🎲 GÉNÉRATEURS ALÉATOIRES
  // ==========================================================================
  static genererUuid(): string {
    return crypto.randomUUID();
  }

  static genererToken(longueur = 32): string {
    return crypto.randomBytes(longueur).toString('hex');
  }

  static genererOtp(longueur = 6): string {
    const min = Math.pow(10, longueur - 1);
    const max = Math.pow(10, longueur) - 1;
    return String(crypto.randomInt(min, max + 1));
  }

  // ==========================================================================
  // 🔐 CHIFFREMENT AES-256-GCM
  // ==========================================================================
  static chiffrer(data: string, secretKey: string): string {
    if (!secretKey) throw new InternalError('Clé secrète requise');

    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(12); // 96 bits recommandé pour GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  static dechiffrer(encrypted: string, secretKey: string): string {
    const parts = encrypted.split(':');
    if (parts.length !== 3) throw new InternalError('Format chiffré invalide');

    const [ivHex, authTagHex, data] = parts;
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}