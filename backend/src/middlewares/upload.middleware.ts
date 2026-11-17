// src/middlewares/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { BadRequestError } from '../errors/AppError';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function createStorage(subfolder?: string) {
  const destination = subfolder ? path.join(UPLOAD_DIR, subfolder) : UPLOAD_DIR;
  fs.mkdirSync(destination, { recursive: true });

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${uuid()}${ext}`);
    },
  });
}

const storage = createStorage();
const avatarStorage = createStorage('avatars');
const formationImageStorage = createStorage('formations');
const domaineImageStorage = createStorage('domaines');
const logoStorage = createStorage('logos');
const couvertureStorage = createStorage('couvertures');
const imageFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ok = /^image\/(jpeg|jpg|png|webp|gif|svg\+xml)$/.test(file.mimetype);
  if (!ok) return cb(new BadRequestError("Format d'image non supporté"));
  cb(null, true);
};

/** Avatars stored in the matching public subfolder — max 5 Mo */
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

/** Images uniquement — max 5 Mo */
export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const uploadFormationImage = multer({
  storage: formationImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const uploadDomaineImage = multer({
  storage: domaineImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const uploadCouverture = multer({
  storage: couvertureStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
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
      'video/mp4',
      'video/webm',
      'application/zip',
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new BadRequestError('Type de fichier non supporté'));
    }
    cb(null, true);
  },
});
