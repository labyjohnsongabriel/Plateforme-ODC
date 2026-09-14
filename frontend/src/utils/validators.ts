import { REGEX } from './constants';

// ============================================================================
//  VALIDATORS
// ============================================================================

export const validators = {
  // Email
  email: (value: string): boolean => REGEX.EMAIL.test(value),

  // Téléphone malgache
  phoneMG: (value: string): boolean => REGEX.PHONE_MG.test(value.replace(/\s/g, '')),

  // Mot de passe fort
  passwordStrong: (value: string): boolean => REGEX.PASSWORD_STRONG.test(value),

  // URL
  url: (value: string): boolean => REGEX.URL.test(value),

  // UUID
  uuid: (value: string): boolean => REGEX.UUID.test(value),

  // Numéro d'attestation
  attestationNumber: (value: string): boolean => REGEX.ATTESTATION_NUMBER.test(value),

  // Nombre
  isNumber: (value: any): boolean => !isNaN(parseFloat(value)) && isFinite(value),

  // Entier
  isInteger: (value: any): boolean => Number.isInteger(Number(value)),

  // Positif
  isPositive: (value: number): boolean => value > 0,

  // Dans une plage
  inRange: (value: number, min: number, max: number): boolean => value >= min && value <= max,

  // Non vide
  notEmpty: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  // Date valide
  isValidDate: (value: any): boolean => {
    const d = new Date(value);
    return !isNaN(d.getTime());
  },

  // Date future
  isFutureDate: (value: any): boolean => {
    const d = new Date(value);
    return !isNaN(d.getTime()) && d.getTime() > Date.now();
  },
};

// ============================================================================
//  PASSWORD STRENGTH
// ============================================================================

export interface PasswordStrength {
  score: number; // 0-5
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent', 'Parfait'];
  const colors = ['#C62828', '#C62828', '#F57C00', '#0277BD', '#2E7D32', '#2E7D32'];

  return {
    score,
    label: labels[score],
    color: colors[score],
    checks,
  };
}

// ============================================================================
//  HELPERS
// ============================================================================

export function isValidEmail(email: string): boolean {
  return validators.email(email);
}

export function isStrongPassword(password: string): boolean {
  return validators.passwordStrong(password);
}

export function isValidPhoneMG(phone: string): boolean {
  return validators.phoneMG(phone);
}

export function isValidUrl(url: string): boolean {
  return validators.url(url);
}

export default validators;