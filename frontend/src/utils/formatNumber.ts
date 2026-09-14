// ============================================================================
//  FORMAT NOMBRES
// ============================================================================

/**
 * Formate un nombre avec séparateurs de milliers (fr-FR)
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: Intl.NumberFormatOptions = {}
): string {
  if (value === null || value === undefined || value === '') return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(num);
}

/**
 * Formate un nombre décimal
 */
export function formatDecimal(value: number, decimals = 2): string {
  return formatNumber(value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formate un pourcentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${formatDecimal(value, decimals)}%`;
}

/**
 * Formate une note (sur 20)
 */
export function formatNote(value: number, max = 20): string {
  return `${formatDecimal(value, 2)}/${max}`;
}

/**
 * Formate un grand nombre (K, M, B)
 */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return String(value);
}

/**
 * Formate un fichier en taille lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formate un nombre d'heures
 */
export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}min`;
  return `${formatDecimal(hours, 1)}h`;
}