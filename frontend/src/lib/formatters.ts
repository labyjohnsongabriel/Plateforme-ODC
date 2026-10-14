// src/lib/formatters.ts

/* ============================================================================
   FORMATTERS — Utilitaires de formatage (dates, nombres, prix, durées)
   Locale par défaut : fr-FR / fr-MG (Madagascar)
   ============================================================================ */

/* ============================================================================
   HELPERS INTERNES
   ============================================================================ */

/**
 * Convertit une valeur en Date valide.
 * Retourne `null` si la date est invalide ou vide.
 */
function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;

  const d = typeof value === 'string' ? new Date(value) : value;

  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Vérifie qu'une date est valide.
 */
export function isValidDate(value: unknown): value is string | Date {
  return toDate(value as string | Date) !== null;
}

/* ============================================================================
   DATES
   ============================================================================ */

/**
 * Formate une date en français long.
 * @example formatDate('2025-03-15') → "15 mars 2025"
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = toDate(date);
  if (!d) return '—';

  return d.toLocaleDateString(
    'fr-FR',
    options ?? {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  );
}

/**
 * Formate une date courte (JJ/MM/AAAA).
 * @example formatDateShort('2025-03-15') → "15/03/2025"
 */
export function formatDateShort(
  date: string | Date | null | undefined,
): string {
  const d = toDate(date);
  if (!d) return '—';

  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formate une date et une heure (JJ/MM/AAAA HH:MM).
 * @example formatDateTime('2025-03-15T14:30') → "15/03/2025 14:30"
 */
export function formatDateTime(
  date: string | Date | null | undefined,
): string {
  const d = toDate(date);
  if (!d) return '—';

  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate uniquement l'heure (HH:MM).
 * @example formatTime('2025-03-15T14:30') → "14:30"
 */
export function formatTime(
  date: string | Date | null | undefined,
): string {
  const d = toDate(date);
  if (!d) return '—';

  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate la date en jour de la semaine + date.
 * @example formatDateWithWeekday('2025-03-15') → "samedi 15 mars 2025"
 */
export function formatDateWithWeekday(
  date: string | Date | null | undefined,
): string {
  const d = toDate(date);
  if (!d) return '—';

  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formate une plage de dates (début → fin).
 * @example formatDateRange('2025-03-15', '2025-03-20') → "15 mars 2025 → 20 mars 2025"
 */
export function formatDateRange(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  const s = formatDate(start, options);
  const e = formatDate(end, options);

  if (s === '—' && e === '—') return '—';
  if (s === '—') return `Jusqu'au ${e}`;
  if (e === '—') return `À partir du ${s}`;
  return `${s} → ${e}`;
}

/* ============================================================================
   PRIX & NOMBRES
   ============================================================================ */

/**
 * Formate un prix avec devise.
 * @example formatPrice(150000, 'MGA') → "150 000 Ar"
 * @example formatPrice(1500, 'EUR') → "1 500 €"
 */
export function formatPrice(
  price: number | null | undefined,
  currency = 'MGA',
  locale = 'fr-MG',
): string {
  if (price === null || price === undefined || isNaN(price)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formate un nombre avec séparateurs de milliers.
 * @example formatNumber(1500000) → "1 500 000"
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Formate un pourcentage.
 * @example formatPercent(45.678) → "45,7 %"
 */
export function formatPercent(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${value.toFixed(decimals).replace('.', ',')} %`;
}

/**
 * Formate un nombre de manière compacte.
 * @example formatCompactNumber(1500000) → "1,5 M"
 */
export function formatCompactNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

/* ============================================================================
   DURÉES
   ============================================================================ */

/**
 * Calcule la durée entre deux dates et la formate.
 * @example formatDuration(new Date('2025-03-15'), new Date('2025-03-18')) → "3 jours"
 */
export function formatDuration(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
): string {
  const s = toDate(start);
  const e = toDate(end);

  if (!s || !e) return '—';

  const diff = e.getTime() - s.getTime();

  // Négatif → inverser
  if (diff < 0) return formatDuration(e, s);

  const ms = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
  };

  const days = Math.floor(diff / ms.day);
  const hours = Math.floor((diff % ms.day) / ms.hour);
  const minutes = Math.floor((diff % ms.hour) / ms.minute);

  // Format long : "3 jours"
  if (days > 0) {
    if (days === 1) return '1 jour';
    if (hours === 0) return `${days} jours`;
    return `${days} jours ${hours}h`;
  }

  // Moins d'un jour
  if (hours > 0) {
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  }

  if (minutes > 0) return `${minutes}min`;
  return 'moins d\'une minute';
}

/**
 * Formate une durée courte (compacte).
 * @example formatDurationShort(new Date('2025-03-15'), new Date('2025-03-18')) → "3j"
 */
export function formatDurationShort(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
): string {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return '—';

  const diff = Math.abs(e.getTime() - s.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (days > 0) return `${days}j`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}min`;
}

/* ============================================================================
   TEMPS RELATIF
   ============================================================================ */

/**
 * Formate une date en temps relatif.
 * @example formatRelativeTime('2025-03-15T14:25') → "il y a 5 min"
 */
export function formatRelativeTime(
  date: string | Date | null | undefined,
): string {
  const d = toDate(date);
  if (!d) return '—';

  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Futur
  if (seconds < 0) {
    const futureSeconds = Math.abs(seconds);
    if (futureSeconds < 60) return 'dans un instant';
    const futureMinutes = Math.floor(futureSeconds / 60);
    if (futureMinutes < 60) return `dans ${futureMinutes} min`;
    const futureHours = Math.floor(futureMinutes / 60);
    if (futureHours < 24) return `dans ${futureHours}h`;
    const futureDays = Math.floor(futureHours / 24);
    if (futureDays < 7) return `dans ${futureDays}j`;
    return formatDateShort(d);
  }

  // Passé
  if (seconds < 30) return "à l'instant";
  if (seconds < 60) return `il y a ${seconds}s`;
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days}j`;
  if (days < 30) return `il y a ${Math.floor(days / 7)} sem`;
  return formatDateShort(d);
}

/* ============================================================================
   TEXTE
   ============================================================================ */

/**
 * Tronque un texte avec ellipsis.
 * @example formatTruncate('Bonjour le monde', 8) → "Bonjour…"
 */
export function formatTruncate(
  text: string | null | undefined,
  maxLength: number,
): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Formate un nom complet avec initiales.
 * @example formatInitials('Jean', 'Dupont') → "JD"
 */
export function formatInitials(
  prenom?: string | null,
  nom?: string | null,
): string {
  const p = prenom?.charAt(0)?.toUpperCase() ?? '';
  const n = nom?.charAt(0)?.toUpperCase() ?? '';
  return `${p}${n}` || '?';
}

/**
 * Formate un nom complet.
 * @example formatFullName('Jean', 'Dupont') → "Jean Dupont"
 */
export function formatFullName(
  prenom?: string | null,
  nom?: string | null,
): string {
  const parts = [prenom, nom].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '—';
}

/* ============================================================================
   FICHIERS
   ============================================================================ */

/**
 * Formate une taille de fichier.
 * @example formatFileSize(1500000) → "1,5 Mo"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 o';
  if (bytes < 0) return '—';

  const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
  const k = 1024;
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    units.length - 1,
  );
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(i === 0 ? 0 : 1).replace('.', ',')} ${units[i]}`;
}

/* ============================================================================
   DIVERS
   ============================================================================ */

/**
 * Formate un code session avec mise en valeur.
 * @example formatCodeSession('SES-2510-A3F9K2') → "SES-2510-A3F9K2"
 */
export function formatCodeSession(
  code: string | null | undefined,
): string {
  if (!code) return '—';
  return code.toUpperCase();
}

/**
 * Formate un numéro de téléphone (Madagascar).
 * @example formatPhone('0341234567') → "034 12 345 67"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';

  const cleaned = phone.replace(/\D/g, '');

  // Format Madagascar : 034 XX XXX XX (10 chiffres)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)}`;
  }

  return phone;
}

/**
 * Formate un slug en titre lisible.
 * @example formatSlugToTitle('developpement-web') → "Developpement Web"
 */
export function formatSlugToTitle(slug: string | null | undefined): string {
  if (!slug) return '—';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}