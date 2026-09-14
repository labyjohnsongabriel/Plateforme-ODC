import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { env } from '../config/env';

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);

// Sous-dossiers
const SUBFOLDERS = ['avatars', 'formations', 'attestations', 'ressources', 'temp', 'exports'];

// Créer les dossiers
SUBFOLDERS.forEach((sub) => {
  const dir = path.join(uploadDir, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Détermine le sous-dossier selon l'URL
 */
function getSubfolder(req: Request): string {
  const p = req.path.toLowerCase();
  if (p.includes('avatar')) return 'avatars';
  if (p.includes('formation')) return 'formations';
  if (p.includes('attestation')) return 'attestations';
  if (p.includes('ressource')) return 'ressources';
  if (p.includes('export')) return 'exports';
  return 'temp';
}

/**
 * Storage personnalisé
 */
const storage: StorageEngine = multer.diskStorage({
  destination: (req, _file, cb) => {
    const sub = getSubfolder(req);
    cb(null, path.join(uploadDir, sub));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, '_')
      .substring(0, 50);
    cb(null, `${Date.now()}-${uuidv4().substring(0, 8)}-${safeName}${ext}`);
  },
});

// Types MIME autorisés
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const DOC_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
const ALL_MIMES = [...IMAGE_MIMES, ...DOC_MIMES, 'text/csv', 'text/plain'];

/**
 * Filtre de fichiers
 */
function makeFileFilter(allowed: string[]) {
  return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé : ${file.mimetype}`));
    }
  };
}

/**
 * Upload générique
 */
export const upload = multer({
  storage,
  fileFilter: makeFileFilter(ALL_MIMES),
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: 5,
  },
});

/**
 * Upload avatar (images seulement)
 */
export const uploadAvatar = multer({
  storage,
  fileFilter: makeFileFilter(IMAGE_MIMES),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

/**
 * Upload document (PDF, Office)
 */
export const uploadDocument = multer({
  storage,
  fileFilter: makeFileFilter([...DOC_MIMES, 'text/csv']),
  limits: { fileSize: 20 * 1024 * 1024, files: 3 },
});

/**
 * Upload image (formation, etc.)
 */
export const uploadImage = multer({
  storage,
  fileFilter: makeFileFilter(IMAGE_MIMES),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

/**
 * Upload multiple (jusqu'à 10 fichiers)
 */
export const uploadMultiple = multer({
  storage,
  fileFilter: makeFileFilter(ALL_MIMES),
  limits: { fileSize: env.MAX_FILE_SIZE, files: 10 },
});

/**
 * Export des sous-dossiers
 */
export { SUBFOLDERS };