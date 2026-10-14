// src/utils/csv.util.ts

/* ============================================================================
   CSV GENERATOR — Utilitaire de génération CSV
   ============================================================================ */

/**
 * Échappe une valeur pour le format CSV.
 * - Entoure de guillemets si nécessaire
 * - Double les guillemets internes
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';

  const str = String(value);

  // Entourer de guillemets si contient : virgule, guillemet, retour ligne
  if (
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Formate une valeur pour l'affichage CSV.
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();

  // Booléen → Oui/Non
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';

  // Nombre → string
  if (typeof value === 'number') return String(value);

  // Objet → JSON
  if (typeof value === 'object') return JSON.stringify(value);

  return String(value);
}

/* ============================================================================
   INTERFACES
   ============================================================================ */

export interface CSVColumn<T = any> {
  /** Clé dans l'objet source */
  key: keyof T | string;
  /** En-tête affiché dans le CSV */
  header: string;
  /** Fonction de transformation optionnelle */
  format?: (value: any, row: T) => string;
}

/* ============================================================================
   GÉNÉRATION
   ============================================================================ */

/**
 * Génère un contenu CSV à partir d'un tableau d'objets.
 *
 * @example
 * generateCSV(users, [
 *   { key: 'nom', header: 'Nom' },
 *   { key: 'email', header: 'Email' },
 *   { key: 'role.nom', header: 'Rôle' },
 * ])
 */
export function generateCSV<T extends Record<string, any>>(
  data: T[],
  columns: CSVColumn<T>[],
): string {
  /* -------------------- En-tête -------------------- */
  const header = columns.map((col) => escapeCSV(col.header)).join(',');

  /* -------------------- Lignes -------------------- */
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        // Récupérer la valeur (supporte la notation pointée : 'role.nom')
        const value = getNestedValue(row, String(col.key));

        // Appliquer la transformation si fournie
        const formatted = col.format
          ? col.format(value, row)
          : formatValue(value);

        return escapeCSV(formatted);
      })
      .join(',');
  });

  return [header, ...rows].join('\r\n');
}

/**
 * Récupère une valeur imbriquée depuis un objet.
 *
 * @example
 * getNestedValue({ a: { b: 42 } }, 'a.b') // → 42
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/* ============================================================================
   BOM UTF-8 (pour Excel)
   ============================================================================ */

/**
 * Ajoute le BOM UTF-8 pour que Excel détecte correctement les accents.
 */
export function withUTF8BOM(csv: string): string {
  return '\uFEFF' + csv;
}

/* ============================================================================
   HELPER COMPLET
   ============================================================================ */

/**
 * Prépare la réponse HTTP pour un fichier CSV.
 */
export function prepareCSVResponse(
  res: any,
  csv: string,
  filename: string,
): void {
  const content = withUTF8BOM(csv);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(filename)}"`,
  );
  res.setHeader('Content-Length', Buffer.byteLength(content, 'utf-8'));

  res.send(content);
}