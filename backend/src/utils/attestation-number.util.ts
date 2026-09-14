import crypto from 'crypto';

/**
 * Génère un numéro d'attestation au format :
 * ODC-AAAA-DOMAINE-XXXXXX
 *
 * Exemple : ODC-2026-WEB-A1B2C3
 */
export function generateAttestationNumber(
  domaine: string,
  annee: number = new Date().getFullYear()
): string {
  const domaineCode = normalizeDomaineCode(domaine);
  const unique = crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 6);
  return `ODC-${annee}-${domaineCode}-${unique}`;
}

/**
 * Normalise le code du domaine (3 lettres majuscules)
 */
export function normalizeDomaineCode(domaine: string): string {
  return domaine
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');
}

/**
 * Valide le format d'un numéro d'attestation
 */
export function isValidAttestationNumber(numero: string): boolean {
  return /^ODC-\d{4}-[A-Z]{3}-[A-F0-9]{6}$/.test(numero);
}

/**
 * Extrait les informations d'un numéro
 */
export function parseAttestationNumber(numero: string): {
  organisme: string;
  annee: number;
  domaine: string;
  unique: string;
} | null {
  if (!isValidAttestationNumber(numero)) return null;

  const parts = numero.split('-');
  return {
    organisme: parts[0],
    annee: parseInt(parts[1], 10),
    domaine: parts[2],
    unique: parts[3],
  };
}

/**
 * Calcule le hash SHA-256 d'une attestation
 */
export function generateAttestationHash(data: {
  numero: string;
  participantId: string;
  sessionId: string;
  dateEmission: Date;
}): string {
  const payload = [
    data.numero,
    data.participantId,
    data.sessionId,
    new Date(data.dateEmission).toISOString(),
  ].join('|');

  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Génère un hash court (12 caractères) pour affichage
 */
export function generateShortHash(data: any): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 12);
}

/**
 * Génère un code de vérification (6 caractères)
 */
export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return code;
}

/**
 * Construit les métadonnées d'une attestation
 */
export function buildAttestationMetadata(data: {
  numero: string;
  hash: string;
  dateEmission: Date;
}): {
  numero: string;
  hash: string;
  codeVerification: string;
  dateEmission: string;
  dateExpiration: string | null;
  version: string;
} {
  return {
    numero: data.numero,
    hash: data.hash,
    codeVerification: generateVerificationCode(),
    dateEmission: data.dateEmission.toISOString(),
    dateExpiration: null, // Illimitée
    version: '1.0',
  };
}

/**
 * Vérifie l'intégrité d'une attestation
 */
export function verifyAttestationIntegrity(
  data: {
    numero: string;
    participantId: string;
    sessionId: string;
    dateEmission: Date;
  },
  expectedHash: string
): boolean {
  const computed = generateAttestationHash(data);
  return computed === expectedHash;
}

/**
 * Génère un identifiant unique pour un certificat
 */
export function generateCertificateId(): string {
  return crypto.randomUUID();
}

/**
 * Génère une signature courte (8 caractères) pour vérification manuelle
 */
export function generateManualVerificationSignature(numero: string): string {
  return crypto
    .createHash('sha256')
    .update(numero + 'odc-secret')
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();
}