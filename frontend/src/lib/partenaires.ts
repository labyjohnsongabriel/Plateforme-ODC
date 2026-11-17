// src/lib/api/partenaires.ts
import type { Partenaire } from '@/types/partenaire.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractItem<T>(data: any): T | null {
  if (!data) return null;
  if (data.data) return data.data as T;
  return data as T;
}

function extractList<T>(data: any): T[] {
  if (!data) return [];
  const list = data?.data ?? data?.partenaires ?? data ?? [];
  return Array.isArray(list) ? list : [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   API PARTENAIRES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Récupère un partenaire par son slug.
 * Utilise fetch natif (compatible Server Components).
 */
export async function getPartenaireBySlug(
  slug: string,
): Promise<Partenaire | null> {
  try {
    const res = await fetch(`${API_URL}/public/partenaires/${slug}`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return extractItem<Partenaire>(data);
  } catch (error: any) {
    console.error(`[getPartenaireBySlug] Erreur "${slug}":`, error?.message);
    return null;
  }
}

/**
 * Récupère tous les partenaires publics.
 */
export async function getPartenairesPublic(): Promise<Partenaire[]> {
  try {
    const res = await fetch(`${API_URL}/public/partenaires`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return extractList<Partenaire>(data);
  } catch (error: any) {
    console.error('[getPartenairesPublic] Erreur:', error?.message);
    return [];
  }
}