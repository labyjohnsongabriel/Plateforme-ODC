import cors from 'cors';
import { APP_CONFIG } from './app.config';
import { logger } from './logger';

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Autoriser Postman / curl / tests
    if (!origin) return callback(null, true);

    if (APP_CONFIG.cors.origins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn(`⚠️  Origine CORS refusée : ${origin}`);
    return callback(new Error('Non autorisé par CORS'));
  },
  methods: APP_CONFIG.cors.methods,
  allowedHeaders: APP_CONFIG.cors.allowedHeaders,
  credentials: APP_CONFIG.cors.credentials,
  maxAge: 86400, // 24h
};

export const corsMiddleware = cors(corsOptions);