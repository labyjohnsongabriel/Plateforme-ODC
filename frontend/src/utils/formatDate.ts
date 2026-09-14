import { format, formatDistanceToNow, formatRelative, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================================================
//  FORMATS STANDARD
// ============================================================================

export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  MEDIUM: 'dd MMM yyyy',
  LONG: 'dd MMMM yyyy',
  FULL: 'EEEE dd MMMM yyyy',
  TIME: 'HH:mm',
  DATETIME: 'dd/MM/yyyy HH:mm',
  DATETIME_LONG: 'dd MMMM yyyy à HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  DATE_ONLY: 'yyyy-MM-dd',
  MONTH_YEAR: 'MMMM yyyy',
} as const;

// ============================================================================
//  HELPERS
// ============================================================================

function toDate(date: Date | string | number | null | undefined): Date | null {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return isValid(d) ? d : null;
}

// ============================================================================
//  FORMAT FUNCTIONS
// ============================================================================

export function formatDate(
  date: Date | string | number | null | undefined,
  pattern: string = DATE_FORMATS.LONG
): string {
  const d = toDate(date);
  if (!d) return '-';
  return format(d, pattern, { locale: fr });
}

export function formatDateTime(date: Date | string | number | null | undefined): string {
  return formatDate(date, DATE_FORMATS.DATETIME);
}

export function formatTime(date: Date | string | number | null | undefined): string {
  return formatDate(date, DATE_FORMATS.TIME);
}

export function formatDateShort(date: Date | string | number | null | undefined): string {
  return formatDate(date, DATE_FORMATS.SHORT);
}

export function formatDateFull(date: Date | string | number | null | undefined): string {
  return formatDate(date, DATE_FORMATS.FULL);
}

export function formatMonthYear(date: Date | string | number | null | undefined): string {
  return formatDate(date, DATE_FORMATS.MONTH_YEAR);
}

// ============================================================================
//  RELATIVE
// ============================================================================

export function timeAgo(date: Date | string | number | null | undefined): string {
  const d = toDate(date);
  if (!d) return '-';
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

export function formatRelativeDate(date: Date | string | number | null | undefined): string {
  const d = toDate(date);
  if (!d) return '-';
  return formatRelative(d, new Date(), { locale: fr });
}

// ============================================================================
//  RANGES
// ============================================================================

export function formatDateRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
  pattern: string = DATE_FORMATS.MEDIUM
): string {
  const d1 = toDate(start);
  const d2 = toDate(end);

  if (!d1 && !d2) return '-';
  if (!d1) return formatDate(d2, pattern);
  if (!d2) return formatDate(d1, pattern);

  const sameYear = d1.getFullYear() === d2.getFullYear();
  const sameMonth = sameYear && d1.getMonth() === d2.getMonth();

  if (sameMonth) {
    return `${format(d1, 'dd')} - ${format(d2, pattern, { locale: fr })}`;
  }

  if (sameYear) {
    return `${format(d1, 'dd MMM', { locale: fr })} - ${format(d2, pattern, { locale: fr })}`;
  }

  return `${format(d1, pattern, { locale: fr })} - ${format(d2, pattern, { locale: fr })}`;
}

// ============================================================================
//  DURÉE
// ============================================================================

export function formatDuration(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}j`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}min`);
  if (s > 0 && d === 0 && h === 0) parts.push(`${s}s`);

  return parts.join(' ') || '0s';
}

// ============================================================================
//  UTILITAIRES
// ============================================================================

export function isToday(date: Date | string | null | undefined): boolean {
  const d = toDate(date);
  if (!d) return false;
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export function isYesterday(date: Date | string | null | undefined): boolean {
  const d = toDate(date);
  if (!d) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

export function isPast(date: Date | string | null | undefined): boolean {
  const d = toDate(date);
  return d ? d.getTime() < Date.now() : false;
}

export function isFuture(date: Date | string | null | undefined): boolean {
  const d = toDate(date);
  return d ? d.getTime() > Date.now() : false;
}

export function daysUntil(date: Date | string | null | undefined): number {
  const d = toDate(date);
  if (!d) return 0;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}