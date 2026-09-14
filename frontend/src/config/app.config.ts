// ============================================================================
//  APP CONFIGURATION
// ============================================================================

export const APP_CONFIG = {
  // Identité
  name: 'ODC Platform',
  shortName: 'ODC',
  fullName: 'Orange Digital Center',
  description: 'Plateforme de gestion des formations et suivi des bénéficiaires',
  version: '1.0.0',
  logo: '/logo-odc.svg',
  favicon: '/favicon.ico',

  // Contact
  email: 'contact@odc.mg',
  phone: '+261 34 12 345 67',
  address: 'Antananarivo, Madagascar',
  website: 'https://odc.orange.mg',

  // Réseaux sociaux
  social: {
    facebook: 'https://facebook.com/orangedigitalcenter',
    linkedin: 'https://linkedin.com/company/orange-digital-center',
    twitter: 'https://twitter.com/orangedigital',
    instagram: 'https://instagram.com/orangedigitalcenter',
  },

  // API
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Upload
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

  // Pagination
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
    limitOptions: [10, 25, 50, 100],
  },

  // Cache
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
  },

  // Notifications
  notifications: {
    defaultDuration: 4000,
    maxStack: 3,
  },

  // Features flags
  features: {
    darkMode: true,
    notifications: true,
    socketIO: true,
    qrCode: true,
    pdfGeneration: true,
    multiLanguage: true,
  },

  // Langues disponibles
  languages: [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'mg', label: 'Malagasy', flag: '🇲🇬' },
  ],

  // Devise
  currency: {
    code: 'MGA',
    symbol: 'Ar',
    locale: 'fr-MG',
  },

  // Timezone
  timezone: 'Indian/Antananarivo',
} as const;

export default APP_CONFIG;