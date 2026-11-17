// src/config/app.config.ts

/* ═══════════════════════════════════════════════════════════════════════════
   APP CONFIGURATION — variables d'environnement compatibles Next.js & Vite
   ═══════════════════════════════════════════════════════════════════════════ */

/** Lit une variable d'env, compatible Next.js (`process.env`) et Vite (`import.meta.env`) */
function getEnv(key: string, fallback = ''): string {
  // Next.js : variables préfixées NEXT_PUBLIC_
  if (typeof process !== 'undefined' && process.env) {
    const publicKey = key.startsWith('NEXT_PUBLIC_') ? key : `NEXT_PUBLIC_${key}`;
    const value = process.env[publicKey];
    if (value) return value;
  }

  // Vite : import.meta.env.VITE_*
  try {
    const meta = (import.meta as any);
    if (meta?.env) {
      const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
      if (meta.env[viteKey]) return meta.env[viteKey];
    }
  } catch {
    /* ignore */
  }

  return fallback;
}

export const APP_CONFIG = {
  /* Identité */
  name: 'ODC Platform',
  shortName: 'ODC',
  fullName: 'Orange Digital Center',
  description: 'Plateforme de gestion des formations et suivi des bénéficiaires',
  version: '1.0.0',
  logo: '/images/brand/logo-odc.jpeg',
  favicon: '/favicon.ico',

  /* Contact */
  email: 'contact@odc.mg',
  phone: '+261 34 12 345 67',
  address: 'Antananarivo, Madagascar',
  website: 'https://odc.orange.mg',

  /* Réseaux sociaux */
  social: {
    facebook: 'https://facebook.com/orangedigitalcenter',
    linkedin: 'https://linkedin.com/company/orange-digital-center',
    twitter: 'https://twitter.com/orangedigital',
    instagram: 'https://instagram.com/orangedigitalcenter',
  },

  /* API */
  api: {
    baseUrl: getEnv('API_URL', 'http://localhost:3000/api'),
    timeout: 30_000,
    retryAttempts: 3,
    retryDelay: 1_000,
  },

  /* Upload */
  upload: {
    maxAvatarSize: 2 * 1024 * 1024,
    maxDocumentSize: 20 * 1024 * 1024,
    maxFileSize: 10 * 1024 * 1024,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    allowedDocumentTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  /* Pagination */
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
    limitOptions: [10, 25, 50, 100] as const,
  },

  /* Cache */
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000,
  },

  /* Notifications */
  notifications: {
    defaultDuration: 4_000,
    maxStack: 3,
  },

  /* Feature flags */
  features: {
    darkMode: true,
    notifications: true,
    socketIO: true,
    qrCode: true,
    pdfGeneration: true,
    multiLanguage: true,
  },

  /* Langues */
  languages: [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'mg', label: 'Malagasy', flag: '🇲🇬' },
  ] as const,

  /* Devise */
  currency: {
    code: 'MGA',
    symbol: 'Ar',
    locale: 'fr-MG',
  },

  /* Timezone */
  timezone: 'Indian/Antananarivo',
} as const;

export default APP_CONFIG;