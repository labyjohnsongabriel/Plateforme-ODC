<<<<<<< HEAD
=======
// src/services/signature.service.ts
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../config/logger';
<<<<<<< HEAD

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
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      return;
    } catch {
      // À générer
    }

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

<<<<<<< HEAD
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
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  static async signer(data: any): Promise<string> {
    const contenu = typeof data === 'string' ? data : JSON.stringify(data);
    const privateKey = await this.getPrivateKey();

<<<<<<< HEAD
    const signature = crypto.sign('sha256', Buffer.from(contenu), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
=======
    const signature = crypto.sign('sha256', Buffer.from(contenu, 'utf-8'), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    });

    return signature.toString('base64');
  }

<<<<<<< HEAD
  /**
   * Vérifie une signature
   */
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  static async verifier(data: any, signature: string): Promise<boolean> {
    try {
      const contenu = typeof data === 'string' ? data : JSON.stringify(data);
      const publicKey = await this.getPublicKey();

      return crypto.verify(
        'sha256',
<<<<<<< HEAD
        Buffer.from(contenu),
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        Buffer.from(signature, 'base64')
      );
    } catch {
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      return false;
    }
  }

<<<<<<< HEAD
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
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  static async signerAttestation(data: {
    numero: string;
    participantId: string;
    sessionId: string;
    dateEmission: Date;
  }): Promise<{ hash: string; signature: string }> {
<<<<<<< HEAD
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
=======
    const payload = this.buildAttestationPayload(data);
    const hash = this.hashSHA256(payload);
    const signature = await this.signer({ ...payload, hash });
    return { hash, signature };
  }

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  static async verifierAttestation(
    data: {
      numero: string;
      participantId: string;
      sessionId: string;
      dateEmission: Date;
      hash: string;
    },
<<<<<<< HEAD
    signature: string
  ): Promise<boolean> {
    const payload = {
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      numero: data.numero,
      participantId: data.participantId,
      sessionId: data.sessionId,
      dateEmission: data.dateEmission.toISOString(),
<<<<<<< HEAD
      hash: data.hash,
    };

    return this.verifier(payload, signature);
  }

  /**
   * Génère un identifiant unique (UUID v4)
   */
=======
    };
  }

  // ==========================================================================
  // 🎲 GÉNÉRATEURS ALÉATOIRES
  // ==========================================================================
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  static genererUuid(): string {
    return crypto.randomUUID();
  }

<<<<<<< HEAD
  /**
   * Génère un token aléatoire sécurisé
   */
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  static genererToken(longueur = 32): string {
    return crypto.randomBytes(longueur).toString('hex');
  }

<<<<<<< HEAD
  /**
   * Génère un code numérique OTP
   */
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  static genererOtp(longueur = 6): string {
    const min = Math.pow(10, longueur - 1);
    const max = Math.pow(10, longueur) - 1;
    return String(crypto.randomInt(min, max + 1));
  }

<<<<<<< HEAD
  /**
   * Chiffre un contenu (AES-256-GCM)
   */
  static chiffrer(data: string, secretKey: string): string {
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(16);
=======
  // ==========================================================================
  // 🔐 CHIFFREMENT AES-256-GCM
  // ==========================================================================
  static chiffrer(data: string, secretKey: string): string {
    if (!secretKey) throw new InternalError('Clé secrète requise');

    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(12); // 96 bits recommandé pour GCM
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

<<<<<<< HEAD
  /**
   * Déchiffre un contenu
   */
  static dechiffrer(encrypted: string, secretKey: string): string {
    const [ivHex, authTagHex, data] = encrypted.split(':');
=======
  static dechiffrer(encrypted: string, secretKey: string): string {
    const parts = encrypted.split(':');
    if (parts.length !== 3) throw new InternalError('Format chiffré invalide');

    const [ivHex, authTagHex, data] = parts;
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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