// src/lib/slugify.ts

/**
 * Convertit un texte en slug URL-friendly.
 *
 * @example
 * slugify('Développement Web Full-Stack') // → 'developpement-web-full-stack'
 * slugify('Data Science & IA')            // → 'data-science-ia'
 * slugify('Formation ODC 2026')           // → 'formation-odc-2026'
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

export default slugify;