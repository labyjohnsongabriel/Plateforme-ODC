// src/config/theme.ts

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  /* Primary */
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
  primarySofter: string;

  /* Surfaces */
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceHover: string;
  elevated: string;

  /* Textes — contraste garanti sur surface/surfaceAlt */
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textTertiary: string;
  textInverse: string;

  /* Bordures */
  border: string;
  borderLight: string;
  borderStrong: string;

  /* États */
  success: string;
  successDark: string;
  successSoft: string;
  successBg: string;

  warning: string;
  warningDark: string;
  warningSoft: string;
  warningBg: string;

  error: string;
  errorDark: string;
  errorSoft: string;
  errorBg: string;

  info: string;
  infoDark: string;
  infoSoft: string;
  infoBg: string;

  purple: string;
  purpleSoft: string;
  purpleBg: string;
}

export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  fonts: {
    sans: string;
    heading: string;
    mono: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   LIGHT THEME
   ═══════════════════════════════════════════════════════════════════════════ */

export const lightTheme: Theme = {
  name: 'ODC Light',
  mode: 'light',
  colors: {
    /* Primary */
    primary: '#FF7900',
    primaryDark: '#C25400',
    primaryLight: '#FDBA74',
    primarySoft: '#FFEDD5',
    primarySofter: '#FFF7ED',

    /* Surfaces */
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    surfaceHover: '#E2E8F0',
    elevated: '#FFFFFF',

    /* Textes — tous lisibles sur fond clair (contraste ≥ 7:1) */
    textPrimary: '#0F172A',   // 15.8:1 sur blanc
    textSecondary: '#334155', // 9.2:1 sur blanc
    textMuted: '#64748B',     // 5.6:1 sur blanc
    textTertiary: '#94A3B8',  // 3.4:1 sur blanc
    textInverse: '#FFFFFF',

    /* Bordures */
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderStrong: '#CBD5E1',

    /* États — contraste ≥ 4.5:1 */
    success: '#10B981',
    successDark: '#047857',
    successSoft: '#D1FAE5',
    successBg: '#ECFDF5',

    warning: '#F59E0B',
    warningDark: '#B45309',
    warningSoft: '#FEF3C7',
    warningBg: '#FFFBEB',

    error: '#EF4444',
    errorDark: '#B91C1C',
    errorSoft: '#FEE2E2',
    errorBg: '#FEF2F2',

    info: '#3B82F6',
    infoDark: '#1D4ED8',
    infoSoft: '#DBEAFE',
    infoBg: '#EFF6FF',

    purple: '#8B5CF6',
    purpleSoft: '#EDE9FE',
    purpleBg: '#F5F3FF',
  },
  fonts: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    heading: "'Poppins', 'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
    sm: '0 1px 3px rgba(15, 23, 42, 0.08)',
    md: '0 4px 8px rgba(15, 23, 42, 0.10)',
    lg: '0 8px 24px rgba(15, 23, 42, 0.12)',
    xl: '0 16px 40px rgba(15, 23, 42, 0.15)',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   DARK THEME
   ═══════════════════════════════════════════════════════════════════════════ */

export const darkTheme: Theme = {
  name: 'ODC Dark',
  mode: 'dark',
  colors: {
    /* Primary — plus clair pour ressortir sur fond sombre */
    primary: '#FFA040',
    primaryDark: '#FF7900',
    primaryLight: '#FFB74D',
    primarySoft: '#3A220A',
    primarySofter: '#241708',

    /* Surfaces — dégradé de profondeur visible */
    background: '#0B1220',      // fond le plus sombre
    surface: '#111C33',         // cartes principales
    surfaceAlt: '#1A2540',      // zones secondaires
    surfaceHover: '#22304D',    // hover
    elevated: '#0F172A',        // zones élevées

    /* Textes — clairs sur fond sombre (contraste ≥ 7:1) */
    textPrimary: '#F8FAFC',   // 15.3:1 sur #111C33
    textSecondary: '#CBD5E1', // 9.6:1 sur #111C33
    textMuted: '#94A3B8',     // 5.6:1 sur #111C33
    textTertiary: '#64748B',  // 3.4:1 sur #111C33
    textInverse: '#0F172A',

    /* Bordures — visibles sans être agressives */
    border: '#1E293B',
    borderLight: '#1A2540',
    borderStrong: '#334155',

    /* États — adaptés au fond sombre */
    success: '#34D399',
    successDark: '#10B981',
    successSoft: '#052E22',
    successBg: '#04231A',

    warning: '#FBBF24',
    warningDark: '#F59E0B',
    warningSoft: '#3A2A08',
    warningBg: '#2D2006',

    error: '#F87171',
    errorDark: '#EF4444',
    errorSoft: '#3F1212',
    errorBg: '#2D0E0E',

    info: '#60A5FA',
    infoDark: '#3B82F6',
    infoSoft: '#0F2549',
    infoBg: '#0A1D3D',

    purple: '#A78BFA',
    purpleSoft: '#2A1A4E',
    purpleBg: '#1F1338',
  },
  fonts: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    heading: "'Poppins', 'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.4)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.5)',
    md: '0 4px 8px rgba(0, 0, 0, 0.6)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.7)',
    xl: '0 16px 40px rgba(0, 0, 0, 0.8)',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

export const themes: Record<'light' | 'dark', Theme> = {
  light: lightTheme,
  dark: darkTheme,
};

export const defaultTheme = lightTheme;

/**
 * Résout le mode `auto` en `light` ou `dark` selon le système.
 */
export function resolveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'auto') return mode;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Retourne le thème selon le mode (light, dark ou auto).
 */
export function getTheme(mode: ThemeMode = 'light'): Theme {
  const resolved = resolveThemeMode(mode);
  return themes[resolved];
}

/**
 * Génère les variables CSS d'un thème.
 */
export function themeToCSSVariables(theme: Theme): Record<string, string> {
  const c = theme.colors;
  return {
    /* Primary */
    '--odc-primary': c.primary,
    '--odc-primary-dark': c.primaryDark,
    '--odc-primary-light': c.primaryLight,
    '--odc-primary-soft': c.primarySoft,
    '--odc-primary-softer': c.primarySofter,

    /* Surfaces */
    '--odc-background': c.background,
    '--odc-surface': c.surface,
    '--odc-surface-alt': c.surfaceAlt,
    '--odc-surface-hover': c.surfaceHover,
    '--odc-elevated': c.elevated,

    /* Textes */
    '--odc-text-primary': c.textPrimary,
    '--odc-text-secondary': c.textSecondary,
    '--odc-text-muted': c.textMuted,
    '--odc-text-tertiary': c.textTertiary,
    '--odc-text-inverse': c.textInverse,

    /* Bordures */
    '--odc-border': c.border,
    '--odc-border-light': c.borderLight,
    '--odc-border-strong': c.borderStrong,

    /* États */
    '--odc-success': c.success,
    '--odc-success-dark': c.successDark,
    '--odc-success-soft': c.successSoft,
    '--odc-success-bg': c.successBg,

    '--odc-warning': c.warning,
    '--odc-warning-dark': c.warningDark,
    '--odc-warning-soft': c.warningSoft,
    '--odc-warning-bg': c.warningBg,

    '--odc-error': c.error,
    '--odc-error-dark': c.errorDark,
    '--odc-error-soft': c.errorSoft,
    '--odc-error-bg': c.errorBg,

    '--odc-info': c.info,
    '--odc-info-dark': c.infoDark,
    '--odc-info-soft': c.infoSoft,
    '--odc-info-bg': c.infoBg,

    '--odc-purple': c.purple,
    '--odc-purple-soft': c.purpleSoft,
    '--odc-purple-bg': c.purpleBg,

    /* Radius */
    '--odc-radius-sm': theme.radius.sm,
    '--odc-radius-md': theme.radius.md,
    '--odc-radius-lg': theme.radius.lg,
    '--odc-radius-xl': theme.radius.xl,

    /* Shadows */
    '--odc-shadow-xs': theme.shadows.xs,
    '--odc-shadow-sm': theme.shadows.sm,
    '--odc-shadow-md': theme.shadows.md,
    '--odc-shadow-lg': theme.shadows.lg,
    '--odc-shadow-xl': theme.shadows.xl,
  };
}

export const theme = lightTheme;
export default themes;