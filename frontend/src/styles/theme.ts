// ============================================================================
//  ODC PLATFORM — Thème JS
// ============================================================================

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;

  background: string;
  surface: string;
  surfaceAlt: string;
  elevated: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  border: string;
  borderLight: string;
  borderStrong: string;

  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;
  purple: string;
  purpleBg: string;
}

export interface Theme {
  name: string;
  mode: ThemeMode;
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
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// ============================================================================
//  LIGHT THEME
// ============================================================================

export const lightTheme: Theme = {
  name: 'ODC Light',
  mode: 'light',
  colors: {
    primary: '#FF7900',
    primaryDark: '#E65100',
    primaryLight: '#FFB74D',
    primarySoft: '#FFE0B2',

    background: '#FFF8F2',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F5F5',
    elevated: '#FFFFFF',

    textPrimary: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#6B6B6B',
    textInverse: '#FFFFFF',

    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    borderStrong: '#BDBDBD',

    success: '#2E7D32',
    successBg: '#E8F5E9',
    warning: '#F57C00',
    warningBg: '#FFF3E0',
    error: '#C62828',
    errorBg: '#FFEBEE',
    info: '#0277BD',
    infoBg: '#E1F5FE',
    purple: '#7B1FA2',
    purpleBg: '#F3E5F5',
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
    sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(255, 121, 0, 0.08)',
    lg: '0 10px 25px rgba(255, 121, 0, 0.12)',
    xl: '0 20px 40px rgba(255, 121, 0, 0.15)',
  },
};

// ============================================================================
//  DARK THEME
// ============================================================================

export const darkTheme: Theme = {
  name: 'ODC Dark',
  mode: 'dark',
  colors: {
    primary: '#FF7900',
    primaryDark: '#E65100',
    primaryLight: '#FFB74D',
    primarySoft: '#3D2A1A',

    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceAlt: '#242424',
    elevated: '#2A2A2A',

    textPrimary: '#F5F5F5',
    textSecondary: '#D0D0D0',
    textMuted: '#A0A0A0',
    textInverse: '#1A1A1A',

    border: '#333333',
    borderLight: '#2A2A2A',
    borderStrong: '#4A4A4A',

    success: '#4CAF50',
    successBg: '#1B3D1E',
    warning: '#FF9800',
    warningBg: '#3D2A00',
    error: '#EF5350',
    errorBg: '#3D1A1A',
    info: '#29B6F6',
    infoBg: '#1A2F3D',
    purple: '#BA68C8',
    purpleBg: '#2D1B3D',
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
    sm: '0 1px 3px rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.7)',
  },
};

// ============================================================================
//  EXPORTS
// ============================================================================

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};

export const theme = lightTheme; // Default theme

export const getTheme = (mode: ThemeMode): Theme => themes[mode] || lightTheme;

export const defaultTheme = lightTheme;

export default themes;