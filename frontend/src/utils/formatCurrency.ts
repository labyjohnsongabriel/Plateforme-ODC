// ============================================================================
//  FORMAT CURRENCY
// ============================================================================

export const DEFAULT_CURRENCY = 'MGA';
export const DEFAULT_LOCALE = 'fr-MG';

/**
 * Formate un montant en Ariary Malgache
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE
): string {
  if (value === null || value === undefined || value === '') return '0 Ar';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0 Ar';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Formate en Ariary (format court)
 */
export function formatAriary(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;
}

/**
 * Formate en Euro
 */
export function formatEuro(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

/**
 * Formate en Dollar
 */
export function formatDollar(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Formate un prix sans symbole
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}