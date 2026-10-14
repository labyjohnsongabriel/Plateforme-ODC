// src/lib/utils.ts

/* ============================================================================
   UTILS — Utilitaires transverses (styles, strings, arrays, objects, files)
   ⚠️  Les formatters de dates/prix sont dans `@/lib/formatters`
   ⚠️  Le slugify est dans `@/lib/slugify`
   ============================================================================ */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* ============================================================================
   STYLES
   ============================================================================ */

/**
 * Fusionne intelligemment les classes Tailwind.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* ============================================================================
   STRINGS
   ============================================================================ */

/**
 * Génère les initiales d'un nom et prénom.
 *
 * @example
 * getInitials('Dupont', 'Jean') // → 'JD'
 */
export function getInitials(nom?: string, prenom?: string): string {
  const n = nom?.trim().charAt(0) ?? '';
  const p = prenom?.trim().charAt(0) ?? '';
  return `${p}${n}`.toUpperCase() || '?';
}

/**
 * Tronque un texte avec des points de suspension.
 *
 * @example
 * truncate('Bonjour le monde', 8) // → 'Bonjour…'
 */
export function truncate(text: string | null | undefined, length: number): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}

/**
 * Capitalise la première lettre d'un texte.
 *
 * @example
 * capitalize('bonjour') // → 'Bonjour'
 * capitalize('HELLO')   // → 'Hello'
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Met en majuscule la première lettre de chaque mot.
 *
 * @example
 * titleCase('developpement web') // → 'Developpement Web'
 */
export function titleCase(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Retire les accents d'un texte.
 *
 * @example
 * removeAccents('Développement') // → 'Developpement'
 */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Vérifie si une chaîne est un email valide.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Vérifie si une chaîne est un numéro de téléphone malgache valide.
 */
export function isValidPhoneMG(phone: string): boolean {
  return /^(?:\+261|0)\s?3[2-9]\s?\d{2}\s?\d{3}\s?\d{2}$/.test(
    phone.replace(/\s/g, ''),
  );
}

/* ============================================================================
   NUMBERS
   ============================================================================ */

/**
 * Limite une valeur entre min et max.
 *
 * @example
 * clamp(150, 0, 100) // → 100
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calcule un pourcentage arrondi.
 *
 * @example
 * percentage(25, 100) // → 25
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Génère un nombre aléatoire entre min et max (inclus).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ============================================================================
   ARRAYS
   ============================================================================ */

/**
 * Groupe un tableau par clé.
 *
 * @example
 * groupBy(users, 'role')
 * groupBy(users, (u) => u.role)
 */
export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string),
): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const k = typeof key === 'function' ? key(item) : String(item[key]);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Retire les doublons d'un tableau par clé.
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return array.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Trie un tableau par clé.
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc',
): T[] {
  return [...array].sort((a, b) => {
    const va = a[key];
    const vb = b[key];

    if (va == null) return 1;
    if (vb == null) return -1;

    if (va < vb) return direction === 'asc' ? -1 : 1;
    if (va > vb) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Découpe un tableau en chunks de taille donnée.
 *
 * @example
 * chunk([1,2,3,4,5], 2) // → [[1,2], [3,4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Mélange un tableau (shuffle Fisher-Yates).
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/* ============================================================================
   OBJECTS
   ============================================================================ */

/**
 * Retire des clés d'un objet.
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((k) => delete result[k]);
  return result;
}

/**
 * Garde uniquement certaines clés d'un objet.
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((k) => {
    if (k in obj) result[k] = obj[k];
  });
  return result;
}

/**
 * Vérifie si une valeur est vide.
 *
 * @example
 * isEmpty(null)          // → true
 * isEmpty('')            // → true
 * isEmpty([])            // → true
 * isEmpty({})            // → true
 * isEmpty('hello')       // → false
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Récupère une valeur imbriquée en toute sécurité.
 *
 * @example
 * getNestedValue({ a: { b: { c: 42 } } }, 'a.b.c') // → 42
 */
export function getNestedValue<T = unknown>(
  obj: unknown,
  path: string,
): T | undefined {
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    ) as T | undefined;
}

/**
 * Supprime les valeurs `undefined`, `null` et `''` d'un objet.
 */
export function cleanObject<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      (acc as Record<string, unknown>)[k] = v;
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Fusionne récursivement deux objets.
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof T];
    const targetValue = result[key as keyof T];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key as keyof T] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key as keyof T] = sourceValue as T[keyof T];
    }
  });

  return result;
}

/* ============================================================================
   FILES
   ============================================================================ */

/**
 * Récupère l'extension d'un fichier.
 *
 * @example
 * getFileExtension('photo.jpg') // → 'jpg'
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

/**
 * Vérifie si un fichier est une image.
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Vérifie si un fichier est un PDF.
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

/**
 * Formate une taille en octets (B, KB, MB, GB).
 *
 * @example
 * formatBytes(1536000) // → '1.46 MB'
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '—';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1,
  );

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/* ============================================================================
   ASYNC / TIMING
   ============================================================================ */

/**
 * Attend `ms` millisecondes.
 *
 * @example
 * await sleep(1000);
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce une fonction.
 *
 * ⚠️ Utilise `ReturnType<typeof setTimeout>` pour être compatible
 * navigateur ET Node.js (au lieu de `NodeJS.Timeout`).
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle une fonction (limite la fréquence d'appel).
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/* ============================================================================
   DIVERS
   ============================================================================ */

/**
 * Génère un UUID v4.
 */
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Copie du texte dans le presse-papier.
 *
 * @returns `true` si la copie a réussi, `false` sinon.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback pour anciens navigateurs
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Fonction vide (utile pour les valeurs par défaut).
 */
export function noop(): void {}

/**
 * Vérifie si on est côté client (navigateur).
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Génère un code aléatoire (ex: pour un code session).
 *
 * @example
 * generateCode('SES', 6) // → 'SES-A3F9K2'
 */
export function generateCode(prefix: string, length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}