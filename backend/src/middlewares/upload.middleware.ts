// src/middlewares/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { BadRequestError } from '../errors/AppError';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uuid()}${ext}`);
  },
});

/** Images uniquement — max 5 Mo */
export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|jpg|png|webp|gif|svg\+xml)$/.test(file.mimetype);
    if (!ok) return cb(new BadRequestError('Format d\'image non supporté'));
    cb(null, true);
  },
});

/** Documents / vidéos — max 50 Mo */
export const uploadDocument = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4', 'video/webm',
      'application/zip',
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new BadRequestError('Type de fichier non supporté'));
    }
    cb(null, true);
  },
});