import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { logger } from './config/logger';
import routes from './routes';

const app: Application = express();

// ============================================================================
// SÉCURITÉ
// ============================================================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Évite les blocages en dev
  })
);

// ============================================================================
// CORS — Configuration complète et robuste
// ============================================================================
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ];

    // Autoriser les requêtes sans origin (Postman, curl, mobile)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} non autorisé par CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'x-request-id',
    'X-Request-Id',
    'x-correlation-id',
    'Cache-Control',
  ],
  exposedHeaders: ['x-request-id', 'x-correlation-id'],
  maxAge: 86400, // Cache preflight 24h
};

app.use(cors(corsOptions));

// ⚠️ Gérer explicitement les requêtes OPTIONS (preflight)
app.options('*', cors(corsOptions));

// ============================================================================
// RATE LIMITING
// ============================================================================
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: 'Trop de requêtes' },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ============================================================================
// PARSING
// ============================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// LOGGING HTTP
// ============================================================================
if (env.isDev) {
  app.use(morgan('dev'));
}

// ============================================================================
// FICHIERS STATIQUES
// ============================================================================
app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), env.UPLOAD_DIR))
);

// ============================================================================
// ROOT
// ============================================================================
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API ODC Platform',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/api/health',
  });
});

// ============================================================================
// ROUTES
// ============================================================================
app.use(env.API_PREFIX, routes);

// ============================================================================
// 404 HANDLER
// ============================================================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée : ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ERROR HANDLER (TOUJOURS EN DERNIER)
// ============================================================================
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'Erreur interne du serveur';
  let errors: any = undefined;

  if (err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
    message = err.message || message;
    errors = err.errors;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode >= 500) {
    logger.error(
      `[${req.method}] ${req.originalUrl} - ${message}`,
      { statusCode, stack: err?.stack }
    );
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${message}`);
  }

  const response: any = { success: false, message };
  if (errors) response.errors = errors;
  if (env.isDev && err?.stack) response.stack = err.stack;

  res.status(statusCode).json(response);
});

export default app;