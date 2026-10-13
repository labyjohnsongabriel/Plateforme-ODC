// src/lib/chart-theme.ts
import { ROLE_COLORS, type RoleName } from '@/types/role.types';

/* ============================================================================
   PALETTE ODC — Couleurs principales
   ============================================================================ */

export const ODC_CHART_COLORS = {
  primary: '#FF7900',
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

  yellow: '#EAB308',
  yellowLight: '#FDE047',
  yellowDark: '#A16207',

  gray: '#6B7280',
  grayLight: '#9CA3AF',
  grayDark: '#4B5563',

  cyan: '#06B6D4',
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
   PALETTE SÉQUENTIELLE (pour camemberts)
   ============================================================================ */

export const CHART_PALETTE = [
  ODC_CHART_COLORS.primary,
  ODC_CHART_COLORS.blue,
  ODC_CHART_COLORS.green,
  ODC_CHART_COLORS.purple,
  ODC_CHART_COLORS.yellow,
  ODC_CHART_COLORS.cyan,
  ODC_CHART_COLORS.pink,
  ODC_CHART_COLORS.indigo,
  ODC_CHART_COLORS.red,
  ODC_CHART_COLORS.gray,
] as const;

/* ============================================================================
   ⭐ getRoleColor — FONCTION UTILISÉE PAR ChartsSection
   ============================================================================ */

/**
 * Retourne la couleur hexadécimale associée à un rôle.
 *
 * @example
 * getRoleColor('PARTICIPANT')   // → '#16A34A'
 * getRoleColor('ADMINISTRATEUR') // → '#DC2626'
 */
export function getRoleColor(role?: RoleName | string | null): string {
  if (!role) return ODC_CHART_COLORS.gray;

  const roleColors: Record<string, string> = {
    ADMINISTRATEUR: ODC_CHART_COLORS.red,
    STAFF_ODC: ODC_CHART_COLORS.primary,
    FORMATEUR: ODC_CHART_COLORS.blue,
    PARTICIPANT: ODC_CHART_COLORS.green,
    PARTENAIRE: ODC_CHART_COLORS.purple,
  };

  return roleColors[role] ?? ODC_CHART_COLORS.gray;
}

/**
 * Retourne l'objet de couleurs complet d'un rôle.
 */
export function getRoleColorObject(role?: RoleName | string | null) {
  if (!role) return ROLE_COLORS.PARTICIPANT;
  return ROLE_COLORS[role as RoleName] ?? ROLE_COLORS.PARTICIPANT;
}

/* ============================================================================
   HELPERS DE PALETTE
   ============================================================================ */

/**
 * Récupère une couleur du palette par index (avec rotation).
 */
export function getChartColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

/**
 * Génère un tableau de couleurs pour un dataset.
 */
export function getChartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getChartColor(i));
}

/**
 * Transforme des données en objets `{ name, value, color }`.
 */
export function colorizeData<T extends { name: string; value: number }>(
  data: T[],
): Array<T & { color: string }> {
  return data.map((item, i) => ({
    ...item,
    color: getChartColor(i),
  }));
}

/**
 * Génère des couleurs de rôle pour un dataset.
 */
export function colorizeByRole<T extends { name: string; value: number; role?: string }>(
  data: T[],
): Array<T & { color: string }> {
  return data.map((item) => ({
    ...item,
    color: getRoleColor(item.role ?? item.name),
  }));
}

/* ============================================================================
   GRADIENTS SVG
   ============================================================================ */

/**
 * Retourne les stops pour un gradient linéaire (à utiliser dans <linearGradient>).
 */
export function getGradientStops(color: string) {
  return [
    { offset: '5%', stopColor: color, stopOpacity: 0.3 },
    { offset: '95%', stopColor: color, stopOpacity: 0 },
  ];
}

/* ============================================================================
   CONFIGURATION DES AXES & GRILLES
   ============================================================================ */

export const CHART_AXIS_STYLE = {
  stroke: 'currentColor',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

export const CHART_GRID_STYLE = {
  stroke: 'rgba(0, 0, 0, 0.06)',
  strokeDasharray: '3 3',
  vertical: false,
} as const;

export const CHART_CURSOR_STYLE = {
  fill: 'rgba(255, 121, 0, 0.06)',
} as const;

/* ============================================================================
   CONFIGURATION DES TOOLTIPS
   ============================================================================ */

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: '8px',
    border: '1px solid var(--odc-border)',
    boxShadow: 'var(--odc-shadow-lg)',
    fontSize: '12px',
    padding: '8px 12px',
  },
  labelStyle: {
    fontWeight: 600,
    marginBottom: 4,
    color: 'var(--odc-text-primary)',
  },
  itemStyle: {
    color: 'var(--odc-text-secondary)',
  },
} as const;

/* ============================================================================
   FORMATTERS
   ============================================================================ */

/**
 * Format standard des nombres (fr-FR).
 */
export function formatChartNumber(value: number): string {
  return value.toLocaleString('fr-FR');
}

/**
 * Format compact (1,2 k, 3,4 M).
 */
export function formatChartCompact(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

/**
 * Format pourcentage.
 */
export function formatChartPercent(value: number): string {
  return `${value.toFixed(1)} %`;
}

/**
 * Format devise.
 */
export function formatChartCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 0,
  }).format(value);
}

/* ============================================================================
   TAILLES PAR DÉFAUT
   ============================================================================ */

export const CHART_DEFAULTS = {
  height: 300,
  barRadius: 6,
  barMaxWidth: 80,
  pieInnerRadius: 60,
  pieOuterRadius: 85,
  piePaddingAngle: 3,
  lineStrokeWidth: 2,
  lineDotRadius: 3,
  lineActiveDotRadius: 5,
  animationDuration: 600,
} as const;

/* ============================================================================
   DASHBOARD SPECIFIC CONFIG
   ============================================================================ */

/**
 * Configuration par défaut pour les graphiques du dashboard.
 */
export const DASHBOARD_CHART_CONFIG = {
  inscriptions: {
    color: ODC_CHART_COLORS.primary,
    label: 'Inscriptions',
  },
  formations: {
    color: ODC_CHART_COLORS.blue,
    label: 'Formations',
  },
  sessions: {
    color: ODC_CHART_COLORS.purple,
    label: 'Sessions',
  },
  participants: {
    color: ODC_CHART_COLORS.green,
    label: 'Participants',
  },
  attestations: {
    color: ODC_CHART_COLORS.yellow,
    label: 'Attestations',
  },
  revenus: {
    color: ODC_CHART_COLORS.cyan,
    label: 'Revenus',
  },
} as const;

/* ============================================================================
   EXPORT PAR DÉFAUT
   ============================================================================ */

export const chartTheme = {
  colors: ODC_CHART_COLORS,
  palette: CHART_PALETTE,
  getRoleColor,
  getChartColor,
  getChartColors,
  colorizeData,
  colorizeByRole,
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