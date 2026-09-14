import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env';

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  sizeReadable: string;
  mimeType: string;
  extension: string;
  createdAt: Date;
  modifiedAt: Date;
  hash: string;
}

/**
 * Formate une taille en octets
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/**
 * Obtient le chemin absolu
 */
export function getAbsolutePath(relativePath: string): string {
  const safe = relativePath.replace(/^\/+/, '').replace(/\.\./g, '');
  return path.join(process.cwd(), env.UPLOAD_DIR, safe);
}

/**
 * Vérifie si un fichier existe
 */
export async function fileExists(relativePath: string): Promise<boolean> {
  try {
    await fs.access(getAbsolutePath(relativePath));
    return true;
  } catch {
    return false;
  }
}

/**
 * Récupère les informations d'un fichier
 */
export async function getFileInfo(relativePath: string): Promise<FileInfo | null> {
  try {
    const fullPath = getAbsolutePath(relativePath);
    const stats = await fs.stat(fullPath);
    const buffer = await fs.readFile(fullPath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      name: path.basename(fullPath),
      path: relativePath,
      size: stats.size,
      sizeReadable: formatSize(stats.size),
      mimeType: getMimeTypeFromExt(path.extname(fullPath)),
      extension: path.extname(fullPath).toLowerCase(),
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      hash,
    };
  } catch {
    return null;
  }
}

/**
 * Supprime un fichier
 */
export async function deleteFile(relativePath: string): Promise<boolean> {
  try {
    await fs.unlink(getAbsolutePath(relativePath));
    return true;
  } catch {
    return false;
  }
}

/**
 * Supprime plusieurs fichiers
 */
export async function deleteFiles(relativePaths: string[]): Promise<number> {
  let count = 0;
  for (const p of relativePaths) {
    if (await deleteFile(p)) count++;
  }
  return count;
}

/**
 * Liste les fichiers d'un dossier
 */
export async function listFiles(subfolder: string): Promise<FileInfo[]> {
  try {
    const dir = getAbsolutePath(subfolder);
    const files = await fs.readdir(dir);

    const infos = await Promise.all(
      files
        .filter((f) => f !== '.gitkeep')
        .map((f) => getFileInfo(path.join(subfolder, f)))
    );

    return infos.filter((i): i is FileInfo => i !== null);
  } catch {
    return [];
  }
}

/**
 * Copie un fichier
 */
export async function copyFile(
  source: string,
  destination: string
): Promise<boolean> {
  try {
    const src = getAbsolutePath(source);
    const dest = getAbsolutePath(destination);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
    return true;
  } catch {
    return false;
  }
}

/**
 * Renomme un fichier
 */
export async function renameFile(
  subfolder: string,
  oldName: string,
  newName: string
): Promise<string | null> {
  try {
    const dir = getAbsolutePath(subfolder);
    const oldPath = path.join(dir, oldName);
    const newPath = path.join(dir, newName);
    await fs.rename(oldPath, newPath);
    return `/${env.UPLOAD_DIR.replace('./', '')}/${subfolder}/${newName}`;
  } catch {
    return null;
  }
}

/**
 * Crée un dossier
 */
export async function ensureDir(relativePath: string): Promise<void> {
  await fs.mkdir(getAbsolutePath(relativePath), { recursive: true });
}

/**
 * Détecte le type MIME depuis l'extension
 */
export function getMimeTypeFromExt(ext: string): string {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.zip': 'application/zip',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * Valide un type MIME
 */
export function isAllowedMimeType(mimeType: string, allowed: string[]): boolean {
  return allowed.includes(mimeType);
}

/**
 * Valide une extension
 */
export function isAllowedExtension(ext: string, allowed: string[]): boolean {
  return allowed.includes(ext.toLowerCase());
}

/**
 * Obtient l'extension d'un fichier
 */
export function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Génère un nom de fichier sécurisé
 */
export function generateSafeFilename(originalName: string): string {
  const ext = getExtension(originalName);
  const base = path.basename(originalName, ext);
  const safe = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 50);
  return `${Date.now()}-${safe}${ext}`;
}

/**
 * Lit un fichier en buffer
 */
export async function readFileBuffer(relativePath: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(getAbsolutePath(relativePath));
  } catch {
    return null;
  }
}

/**
 * Écrit un buffer dans un fichier
 */
export async function writeFileBuffer(
  relativePath: string,
  buffer: Buffer
): Promise<string | null> {
  try {
    const fullPath = getAbsolutePath(relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return relativePath;
  } catch {
    return null;
  }
}

/**
 * Statistiques globales des fichiers
 */
export async function getStorageStats(): Promise<{
  total: number;
  totalSize: number;
  totalSizeReadable: string;
  byFolder: Record<string, { count: number; size: number }>;
}> {
  const subfolders = ['avatars', 'formations', 'attestations', 'ressources', 'temp', 'exports'];
  const stats = {
    total: 0,
    totalSize: 0,
    totalSizeReadable: '0 B',
    byFolder: {} as Record<string, { count: number; size: number }>,
  };

  for (const sub of subfolders) {
    const files = await listFiles(sub);
    const size = files.reduce((sum, f) => sum + f.size, 0);
    stats.byFolder[sub] = { count: files.length, size };
    stats.total += files.length;
    stats.totalSize += size;
  }

  stats.totalSizeReadable = formatSize(stats.totalSize);
  return stats;
}