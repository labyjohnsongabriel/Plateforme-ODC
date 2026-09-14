import { env } from './env';

export const APP_CONFIG = {
  name: 'ODC Platform API',
  version: '1.0.0',
  description: 'Plateforme Orange Digital Center',
  env: env.NODE_ENV,
  apiPrefix: env.API_PREFIX,
  clientUrl: env.CLIENT_URL,

  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },

  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedMimes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    allowedExtensions: [
      '.jpg', '.jpeg', '.png', '.webp', '.svg',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    ],
  },

  security: {
    bcryptRounds: 12,
    rateLimitWindow: 15 * 60 * 1000, // 15 min
    rateLimitMax: 500,
    authRateLimitMax: 20,
  },

  cors: {
    origins: [
      env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  },
};