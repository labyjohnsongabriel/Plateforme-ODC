/**
 * Met en majuscule la première lettre
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Met en majuscule la première lettre de chaque mot
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Slugifie une chaîne (pour URLs)
 */
export function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Tronque une chaîne
 */
export function truncate(str: string, maxLength = 100, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Génère les initiales (JM pour Jean Martin)
 */
export function getInitials(nom: string, prenom?: string): string {
  if (prenom) {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }
  const parts = nom.split(' ').filter(Boolean);
  return parts
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Masque une partie d'une chaîne (email, téléphone)
 */
export function maskString(str: string, visibleStart = 3, visibleEnd = 2): string {
  if (str.length <= visibleStart + visibleEnd) return str;
  const start = str.substring(0, visibleStart);
  const end = str.substring(str.length - visibleEnd);
  const masked = '*'.repeat(Math.max(3, str.length - visibleStart - visibleEnd));
  return `${start}${masked}${end}`;
}

/**
 * Masque un email
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;

  const visibleLocal = local.length > 3 ? local.substring(0, 3) : local.charAt(0);
  const maskedLocal = visibleLocal + '***';

  return `${maskedLocal}@${domain}`;
}

/**
 * Masque un numéro de téléphone
 */
export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 2);
}

/**
 * Génère un code aléatoire lisible
 */
export function generateCode(length = 6, chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Génère un slug unique avec suffixe
 */
export function generateUniqueSlug(str: string, suffix?: string): string {
  const slug = slugify(str);
  return suffix ? `${slug}-${suffix}` : slug;
}

/**
 * Vérifie si une chaîne est un email valide
 */
export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Vérifie si une chaîne est un numéro de téléphone malgache
 */
export function isPhoneMG(phone: string): boolean {
  return /^(\+261|0)(32|33|34|38|20)\d{7}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Normalise un numéro de téléphone
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s|-|\./g, '');
  if (cleaned.startsWith('0')) return '+261' + cleaned.substring(1);
  if (cleaned.startsWith('261')) return '+' + cleaned;
  return cleaned;
}

/**
 * Nettoie un nom (supprime les caractères spéciaux)
 */
export function cleanName(name: string): string {
  return name
    .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compte les mots
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Extrait les n premiers mots
 */
export function firstWords(str: string, count: number): string {
  return str.split(/\s+/).slice(0, count).join(' ');
}

/**
 * Échappe le HTML (anti-XSS)
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Comparaison insensible à la casse et aux accents
 */
export function compareNormalized(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  return norm(a) === norm(b);
}

/**
 * Génère un username unique à partir du nom complet
 */
export function generateUsername(nom: string, prenom: string): string {
  const base = slugify(`${prenom}.${nom}`).replace(/-/g, '.');
  const suffix = Math.floor(Math.random() * 1000);
  return `${base}${suffix}`;
}

/**
 * Pluralise un mot selon le nombre
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count > 1 ? plural || `${singular}s` : singular;
}

/**
 * Formate un nom complet
 */
export function formatFullName(prenom: string, nom: string): string {
  return `${capitalize(prenom)} ${nom.toUpperCase()}`;
}