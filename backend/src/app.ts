import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

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
const normalizeOrigin = (url?: string): string | undefined =>
  url?.trim().replace(/\/+$/, '');

const allowedOrigins: string[] = Array.from(
  new Set(
    [
      normalizeOrigin(env.CLIENT_URL),
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000',
    ].filter((o): o is string => Boolean(o))
  )
);

if (env.isDev) {
  console.log('🌐 CORS — Origines autorisées :', allowedOrigins);
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (Postman, curl, mobile, SSR)
    if (!origin) return callback(null, true);

    const normalizedIncoming = normalizeOrigin(origin) ?? origin;

    if (allowedOrigins.includes(normalizedIncoming)) {
      return callback(null, true);
    }

    // ✅ Refus SILENCIEUX : pas de header CORS renvoyé,
    //    le navigateur bloque la requête → plus de 500 côté serveur.
    console.warn(`🚫 CORS refusé pour l'origine : ${origin}`);
    return callback(null, false);
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
  maxAge: env.isDev ? 0 : 86400, // ⚠️ 0 en dev : évite le cache navigateur des preflight échoués
};

app.use(cors(corsOptions));

// ⚠️ Preflight — compatible Express 4 et Express 5
// Express 5 utilise path-to-regexp v8 qui n'accepte plus '*'
// → on utilise une RegExp universelle
app.options(/.*/, cors(corsOptions));

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
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

app.get('/uploads/:subfolder/:filename', (req, res, next) => {
  const legacyFolders = new Set([
    'avatars',
    'couvertures',
    'documents',
    'logos',
    'ressources',
    'formations',
    'domaines',
  ]);
  const { subfolder, filename } = req.params;

  if (!legacyFolders.has(subfolder) || path.basename(filename) !== filename) {
    return next();
  }

  const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
  let filePath = path.resolve(uploadRoot, subfolder, filename);

  if (!fs.existsSync(filePath)) {
    const legacyFilename =
      ['formations', 'domaines'].includes(subfolder) &&
      /^\d+-\d+-[0-9a-f-]+\.[a-z0-9]+$/i.test(filename)
        ? filename.replace(/^\d+-/, '')
        : filename;
    filePath = path.resolve(uploadRoot, legacyFilename);
  }

  if (!fs.existsSync(filePath)) {
    return next();
  }

  res.sendFile(filePath, (error) => {
    if (error) {
      next(error);
    }
  });
});

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
app.use(errorMiddleware);

export default app;