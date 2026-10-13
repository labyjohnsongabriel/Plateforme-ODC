// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* ============================================================================
   STYLES
   ============================================================================ */

/** Fusionne intelligemment les classes Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ============================================================================
   STRINGS ⭐
   ============================================================================ */

/**
 * Convertit un texte en slug URL-friendly.
 *
 * @example
 * slugify('Développement Web Full-Stack') // → 'developpement-web-full-stack'
 * slugify('Formation ODC 2026')           // → 'formation-odc-2026'
 * slugify('Data Science & IA')            // → 'data-science-ia'
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Génère les initiales. */
export function getInitials(nom: string, prenom: string): string {
  return `${prenom?.charAt(0) ?? ''}${nom?.charAt(0) ?? ''}`.toUpperCase();
}

/** Tronque un texte. */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}

/** Capitalise la première lettre. */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/** Retire les accents d'un texte. */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* ============================================================================
   NUMBERS
   ============================================================================ */

/** Formate une taille en octets. */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/** Formate un nombre en français. */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Formate un nombre en compact (1,2 K, 3,4 M). */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

/** Limite une valeur entre min et max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Calcule un pourcentage. */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/* ============================================================================
   ARRAYS
   ============================================================================ */

/** Groupe un tableau par clé. */
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

/** Retire les doublons d'un tableau par clé. */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Trie un tableau par clé. */
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

/** Découpe un tableau en chunks. */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/* ============================================================================
   OBJECTS
   ============================================================================ */

/** Retire des clés d'un objet. */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((k) => delete result[k]);
  return result;
}

/** Garde uniquement certaines clés d'un objet. */
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

/** Vérifie si une valeur est vide. */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/** Récupère une valeur imbriquée en toute sécurité. */
export function getNestedValue<T = any>(obj: any, path: string): T | undefined {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

/** Supprime les valeurs `undefined` et `null` d'un objet. */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      (acc as any)[k] = v;
    }
    return acc;
  }, {} as Partial<T>);
}

/* ============================================================================
   FILES
   ============================================================================ */

/** Récupère l'extension d'un fichier. */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

/** Vérifie si un fichier est une image. */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/* ============================================================================
   DIVERS
   ============================================================================ */

/** Attend `ms` millisecondes. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Génère un UUID v4. */
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Copie du texte dans le presse-papier. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Debounce une fonction. */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Fonction vide. */
export function noop(): void {}