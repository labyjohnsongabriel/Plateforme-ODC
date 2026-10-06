import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Fusionne intelligemment les classes Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formate une taille en octets. */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
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