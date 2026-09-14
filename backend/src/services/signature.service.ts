import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../config/logger';

const KEYS_DIR = path.join(process.cwd(), 'keys');

export class SignatureService {
  /**
   * Génère une paire de clés RSA (une seule fois)
   */
  static async genererPaireCles(): Promise<void> {
    await fs.mkdir(KEYS_DIR, { recursive: true });

    const privatePath = path.join(KEYS_DIR, 'private.pem');
    const publicPath = path.join(KEYS_DIR, 'public.pem');

    // Vérifier si elles existent déjà
    try {
      await fs.access(privatePath);
      logger.info('🔑 Clés RSA déjà présentes');
      return;
    } catch {
      // À générer
    }

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    await fs.writeFile(privatePath, privateKey);
    await fs.writeFile(publicPath, publicKey);

    logger.info('✅ Paire de clés RSA générée');
  }

  /**
   * Charge la clé privée
   */
  private static async getPrivateKey(): Promise<string> {
    const privatePath = path.join(KEYS_DIR, 'private.pem');
    try {
      return await fs.readFile(privatePath, 'utf-8');
    } catch {
      await this.genererPaireCles();
      return fs.readFile(privatePath, 'utf-8');
    }
  }

  /**
   * Charge la clé publique
   */
  private static async getPublicKey(): Promise<string> {
    const publicPath = path.join(KEYS_DIR, 'public.pem');
    try {
      return await fs.readFile(publicPath, 'utf-8');
    } catch {
      await this.genererPaireCles();
      return fs.readFile(publicPath, 'utf-8');
    }
  }

  /**
   * Signe un contenu (hash SHA-256 + RSA)
   */
  static async signer(data: any): Promise<string> {
    const contenu = typeof data === 'string' ? data : JSON.stringify(data);
    const privateKey = await this.getPrivateKey();

    const signature = crypto.sign('sha256', Buffer.from(contenu), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    });

    return signature.toString('base64');
  }

  /**
   * Vérifie une signature
   */
  static async verifier(data: any, signature: string): Promise<boolean> {
    try {
      const contenu = typeof data === 'string' ? data : JSON.stringify(data);
      const publicKey = await this.getPublicKey();

      return crypto.verify(
        'sha256',
        Buffer.from(contenu),
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        Buffer.from(signature, 'base64')
      );
    } catch {
      return false;
    }
  }

  /**
   * Hash SHA-256 d'un contenu
   */
  static hashSHA256(data: any): string {
    const contenu = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(contenu).digest('hex');
  }

  /**
   * Hash SHA-512
   */
  static hashSHA512(data: any): string {
    const contenu = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha512').update(contenu).digest('hex');
  }

  /**
   * Signe une attestation complète
   */
  static async signerAttestation(data: {
    numero: string;
    participantId: string;
    sessionId: string;
    dateEmission: Date;
  }): Promise<{ hash: string; signature: string }> {
    const payload = {
      numero: data.numero,
      participantId: data.participantId,
      sessionId: data.sessionId,
      dateEmission: data.dateEmission.toISOString(),
    };

    const hash = this.hashSHA256(payload);
    const signature = await this.signer({ ...payload, hash });

    return { hash, signature };
  }

  /**
   * Vérifie une attestation signée
   */
  static async verifierAttestation(
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

    return this.verifier(payload, signature);
  }

  /**
   * Génère un identifiant unique (UUID v4)
   */
  static genererUuid(): string {
    return crypto.randomUUID();
  }

  /**
   * Génère un token aléatoire sécurisé
   */
  static genererToken(longueur = 32): string {
    return crypto.randomBytes(longueur).toString('hex');
  }

  /**
   * Génère un code numérique OTP
   */
  static genererOtp(longueur = 6): string {
    const min = Math.pow(10, longueur - 1);
    const max = Math.pow(10, longueur) - 1;
    return String(crypto.randomInt(min, max + 1));
  }

  /**
   * Chiffre un contenu (AES-256-GCM)
   */
  static chiffrer(data: string, secretKey: string): string {
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Déchiffre un contenu
   */
  static dechiffrer(encrypted: string, secretKey: string): string {
    const [ivHex, authTagHex, data] = encrypted.split(':');
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