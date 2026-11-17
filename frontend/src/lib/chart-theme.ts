// src/lib/chart-theme.ts
import { ROLE_COLORS, type RoleName } from '@/types/role.types';

/* ============================================================================
   1. COULEURS STATIQUES (hex) — export PDF/PNG/canvas uniquement
   ----------------------------------------------------------------------------
   ⚠️ NE PAS utiliser en CSS/SVG/Recharts. Pour ça → CHART_PALETTE (tokens).
   ⚠️ Doit rester synchronisé avec les --chart-N de globals.css.
   ============================================================================ */

export const ODC_CHART_COLORS = {
  primary: '#FF7900',
  primaryStrong: '#E56A00',
  primaryLight: '#FFA34D',
  primaryDark: '#CC6100',

  blue: '#2563EB',
  blueLight: '#60A5FA',
  blueDark: '#1D4ED8',

  green: '#16A34A',
  greenLight: '#4ADE80',
  greenDark: '#15803D',

  purple: '#9333EA',
  purpleLight: '#C084FC',
  purpleDark: '#7E22CE',

  red: '#DC2626',
  redLight: '#F87171',
  redDark: '#B91C1C',

  yellow: '#A16207',        // contraste ≥ 4,5:1 (ancien #EAB308 insuffisant)
  yellowLight: '#FDE047',
  yellowDark: '#854D0E',

  gray: '#6B7280',
  grayLight: '#9CA3AF',
  grayDark: '#4B5563',

  cyan: '#0891B2',          // contraste ≥ 4,5:1 (ancien #06B6D4 insuffisant)
  cyanLight: '#22D3EE',
  cyanDark: '#0E7490',

  pink: '#EC4899',
  pinkLight: '#F472B6',
  pinkDark: '#BE185D',

  indigo: '#6366F1',
  indigoLight: '#818CF8',
  indigoDark: '#4338CA',
} as const;

/* ============================================================================
   2. PALETTE CATÉGORIELLE — tokens shadcn (thème clair / sombre)
   ----------------------------------------------------------------------------
   Source de vérité : globals.css --chart-1 … --chart-8.
   ============================================================================ */

export const CHART_PALETTE = [
  'hsl(var(--chart-1))', // orange ODС
  'hsl(var(--chart-2))', // bleu
  'hsl(var(--chart-3))', // vert
  'hsl(var(--chart-4))', // violet
  'hsl(var(--chart-5))', // jaune
  'hsl(var(--chart-6))', // cyan
  'hsl(var(--chart-7))', // rose
  'hsl(var(--chart-8))', // indigo
] as const;

/**
 * Équivalent hex (thème clair) — export PNG/PDF/canvas uniquement.
 * ⚠️ Doit rester synchronisé avec les HSL de globals.css --chart-N.
 */
export const CHART_PALETTE_HEX = [
  '#FF7900', // --chart-1 (24 100% 50%)
  '#2563EB', // --chart-2 (217 91% 60%)
  '#16A34A', // --chart-3 (142 71% 45%)
  '#9333EA', // --chart-4 (271 81% 56%)
  '#EAB308', // --chart-5 (45 93% 47%)
  '#06B6D4', // --chart-6 (189 94% 43%)
  '#EC4899', // --chart-7 (330 81% 60%)
  '#6366F1', // --chart-8 (239 84% 67%)
] as const;

export const CHART_PRIMARY = CHART_PALETTE[0];

/* ============================================================================
   3. HELPERS INTERNES
   ============================================================================ */

function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

function hashIndex(value: string, size: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash % size;
}

/* ============================================================================
   4. COULEURS PAR INDEX / PAR DONNÉE
   ============================================================================ */

export function getChartColor(index: number): string {
  const len = CHART_PALETTE.length;
  return CHART_PALETTE[((index % len) + len) % len];
}

export const getCategoricalColor = getChartColor;

export function getChartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getChartColor(i));
}

export function colorizeData<T extends { name: string; value: number }>(
  data: T[],
): Array<T & { color: string }> {
  return data.map((item, i) => ({ ...item, color: getChartColor(i) }));
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const CSS_VAR = /^var\(--[\w-]+\)$/;
const HSL_VAR = /^hsl\(var\(--[\w-]+\)(?:\s*\/\s*[\d.]+)?\)$/;

export function resolveColor(
  color: string | null | undefined,
  fallbackIndex: number,
): string {
  if (!color) return getChartColor(fallbackIndex);
  if (HEX_COLOR.test(color) || CSS_VAR.test(color) || HSL_VAR.test(color)) {
    return color;
  }
  return getChartColor(fallbackIndex);
}

/**
 * Transparence sur n'importe quelle couleur.
 * - hsl(var(--…)) → syntaxe native `hsl(... / α)` (meilleure précision)
 * - hex ou var(--…) nu → color-mix (supporté partout depuis 2023)
 */
export function withAlpha(color: string, alpha: number): string {
  const clamped = Math.min(Math.max(alpha, 0), 1);
  if (/^hsl\(var\(--[\w-]+\)\)$/.test(color)) {
    return color.replace(/\)$/, ` / ${clamped})`);
  }
  return `color-mix(in srgb, ${color} ${Math.round(clamped * 100)}%, transparent)`;
}

/* ============================================================================
   5. RÔLES
   ============================================================================ */

const ROLE_KEYS: Record<string, string> = {
  ADMINISTRATEUR: 'ADMINISTRATEUR',
  ADMIN: 'ADMINISTRATEUR',
  SUPER_ADMIN: 'ADMINISTRATEUR',
  STAFF_ODC: 'STAFF_ODC',
  STAFF: 'STAFF_ODC',
  FORMATEUR: 'FORMATEUR',
  PARTICIPANT: 'PARTICIPANT',
  APPRENANT: 'PARTICIPANT',
  ETUDIANT: 'PARTICIPANT',
  STAGIAIRE: 'PARTICIPANT',
  PARTENAIRE: 'PARTENAIRE',
};

const ROLE_CHART_COLORS: Record<string, string> = {
  ADMINISTRATEUR: 'hsl(var(--destructive))',
  STAFF_ODC: 'hsl(var(--chart-1))',
  FORMATEUR: 'hsl(var(--chart-2))',
  PARTICIPANT: 'hsl(var(--chart-3))',
  PARTENAIRE: 'hsl(var(--chart-4))',
};

const ROLE_HEX_COLORS: Record<string, string> = {
  ADMINISTRATEUR: ODC_CHART_COLORS.red,
  STAFF_ODC: ODC_CHART_COLORS.primaryStrong,
  FORMATEUR: ODC_CHART_COLORS.blue,
  PARTICIPANT: ODC_CHART_COLORS.green,
  PARTENAIRE: ODC_CHART_COLORS.purple,
};

function resolveRoleKey(role?: RoleName | string | null): string | null {
  if (!role) return null;
  return ROLE_KEYS[normalizeKey(String(role))] ?? null;
}

export function getRoleColor(role?: RoleName | string | null): string {
  const key = resolveRoleKey(role);
  if (key) return ROLE_CHART_COLORS[key];
  return role
    ? getChartColor(hashIndex(normalizeKey(String(role)), CHART_PALETTE.length))
    : 'hsl(var(--muted-foreground))';
}

export function getRoleColorHex(role?: RoleName | string | null): string {
  const key = resolveRoleKey(role);
  return key ? ROLE_HEX_COLORS[key] : ODC_CHART_COLORS.gray;
}

export function getRoleColorObject(role?: RoleName | string | null) {
  const key = resolveRoleKey(role) as RoleName | null;
  return (key && ROLE_COLORS[key]) ?? ROLE_COLORS.PARTICIPANT;
}

export function colorizeByRole<T extends { name: string; value: number; role?: string }>(
  data: T[],
): Array<T & { color: string }> {
  return data.map((item) => ({ ...item, color: getRoleColor(item.role ?? item.name) }));
}

/* ============================================================================
   6. STATUTS
   ============================================================================ */

const STATUT_COLORS: Record<string, string> = {
  BROUILLON: CHART_PALETTE[7],          // indigo — neutre
  PLANIFIEE: CHART_PALETTE[1],          // bleu
  PLANIFIE: CHART_PALETTE[1],
  OUVERTE: CHART_PALETTE[5],            // cyan
  OUVERT: CHART_PALETTE[5],
  EN_COURS: CHART_PALETTE[0],           // orange
  TERMINEE: CHART_PALETTE[3],           // violet
  TERMINE: CHART_PALETTE[3],
  CLOTUREE: CHART_PALETTE[3],
  COMPLETE: CHART_PALETTE[4],           // jaune
  COMPLET: CHART_PALETTE[4],
  ANNULEE: 'hsl(var(--destructive))',   // rouge sémantique
  ANNULE: 'hsl(var(--destructive))',
};

export function humanize(value: string): string {
  const text = value.replace(/_/g, ' ').trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getStatutMeta(statut: string): { label: string; color: string } {
  const key = normalizeKey(statut);
  return {
    label: humanize(statut),
    color: STATUT_COLORS[key] ?? getChartColor(hashIndex(key, CHART_PALETTE.length)),
  };
}

/* ============================================================================
   7. GRADIENTS SVG
   ============================================================================ */

export function getGradientStops(color: string, topOpacity = 0.3) {
  return [
    { offset: '5%', stopColor: color, stopOpacity: topOpacity },
    { offset: '95%', stopColor: color, stopOpacity: 0 },
  ];
}

/* ============================================================================
   8. AXES, GRILLES, CURSEUR, TOOLTIP — tokens shadcn (globals.css)
   ============================================================================ */

export const CHART_AXIS_TICK = {
  fill: 'hsl(var(--muted-foreground))',
  fontSize: 12,
} as const;

export const CHART_GRID_STROKE = 'hsl(var(--border))';

export const CHART_AXIS_STYLE = {
  stroke: 'hsl(var(--muted-foreground))',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

export const CHART_GRID_STYLE = {
  stroke: CHART_GRID_STROKE,
  strokeDasharray: '4 4',
  vertical: false,
} as const;

export const CHART_CURSOR_STYLE = {
  fill: 'hsl(var(--accent))',
  opacity: 0.5,
} as const;

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    color: 'hsl(var(--popover-foreground))',
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
    fontSize: '12px',
    padding: '8px 12px',
  },
  labelStyle: {
    fontWeight: 600,
    marginBottom: 4,
    color: 'hsl(var(--popover-foreground))',
  },
  itemStyle: {
    color: 'hsl(var(--muted-foreground))',
  },
} as const;

/* ============================================================================
   9. FORMATAGE (fr-FR)
   ============================================================================ */

const numberFormat = new Intl.NumberFormat('fr-FR');
const compactFormat = new Intl.NumberFormat('fr-FR', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
});
const percentRatioFormat = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 1,
});
const percentValueFormat = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const formatNumber = (value: number): string => numberFormat.format(value);
export const formatCompact = (value: number): string => compactFormat.format(value);
export const formatPercent = (ratio: number): string => percentRatioFormat.format(ratio);

export const formatChartNumber = formatNumber;
export const formatChartCompact = formatCompact;

export function formatChartPercent(value: number): string {
  return `${percentValueFormat.format(value)} %`;
}

export function formatChartCurrency(value: number, currency = 'MGA'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function truncateLabel(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function buildChartSummary(
  title: string,
  items: Array<{ name: string; value: number }>,
  max = 12,
): string {
  const shown = items
    .slice(0, max)
    .map((item) => `${item.name} : ${formatNumber(item.value)}`)
    .join(' ; ');
  const rest = items.length > max ? ` ; et ${items.length - max} autres` : '';
  return `${title}. ${shown}${rest}.`;
}

/* ============================================================================
   10. TAILLES PAR DÉFAUT
   ============================================================================ */

export const CHART_DEFAULTS = {
  height: 300,
  barRadius: 6,
  barMaxWidth: 80,
  pieInnerRadius: 70,
  pieOuterRadius: 100,
  piePaddingAngle: 2,
  lineStrokeWidth: 2.5,
  lineDotRadius: 3.5,
  lineActiveDotRadius: 5.5,
  animationDuration: 600,
} as const;

/* ============================================================================
   11. CONFIG DASHBOARD
   ============================================================================ */

export const DASHBOARD_CHART_CONFIG = {
  inscriptions: { color: CHART_PALETTE[0], label: 'Inscriptions' },
  formations:   { color: CHART_PALETTE[1], label: 'Formations' },
  sessions:     { color: CHART_PALETTE[3], label: 'Sessions' },
  participants: { color: CHART_PALETTE[2], label: 'Participants' },
  attestations: { color: CHART_PALETTE[4], label: 'Attestations' },
  revenus:      { color: CHART_PALETTE[5], label: 'Revenus' },
} as const;

/* ============================================================================
   12. EXPORT PAR DÉFAUT
   ============================================================================ */

export const chartTheme = {
  colors: ODC_CHART_COLORS,
  palette: CHART_PALETTE,
  paletteHex: CHART_PALETTE_HEX,
  getRoleColor,
  getRoleColorHex,
  getChartColor,
  getChartColors,
  colorizeData,
  colorizeByRole,
  withAlpha,
  axis: CHART_AXIS_STYLE,
  grid: CHART_GRID_STYLE,
  cursor: CHART_CURSOR_STYLE,
  tooltip: CHART_TOOLTIP_STYLE,
  defaults: CHART_DEFAULTS,
  dashboard: DASHBOARD_CHART_CONFIG,
  formatters: {
    number: formatChartNumber,
    compact: formatChartCompact,
    percent: formatChartPercent,
    currency: formatChartCurrency,
  },
};

export default chartTheme;