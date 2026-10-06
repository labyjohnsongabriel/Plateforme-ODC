// src/services/upload.service.ts
import fs from 'fs/promises';
import path from 'path';
import { env }    from '../config/env';
import { logger } from '../config/logger';
import { ValidationError, NotFoundError } from '../errors/AppError';

export interface FileInfo {
  exists: boolean;
  size?: number;
  sizeReadable?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  extension?: string;
  name?: string;
}

export interface ListedFile {
  name: string;
  url: string;
  size: number;
  sizeReadable: string;
  createdAt: Date;
}

export class UploadService {
  private static readonly SAFE_SUBFOLDERS = [
    'avatars',
    'formations',
    'attestations',
    'ressources',
    'partenaires',
    'exports',
    'temp',
  ] as const;

  // ==========================================================================
  // 🔒 SÉCURITÉ
  // ==========================================================================
  private static getUploadDir(): string {
    return path.resolve(process.cwd(), env.UPLOAD_DIR);
  }

  /** Empêche le path traversal */
  private static sanitize(relativePath: string): string {
    const cleaned = relativePath
      .replace(/^\/+/, '')
      .replace(/\.\./g, '')
      .replace(/\\/g, '/');
    return cleaned;
  }

  private static resolveSafe(relativePath: string): string {
    const uploadDir = this.getUploadDir();
    const safe = this.sanitize(relativePath);
    const full = path.join(uploadDir, safe);

    // S'assurer que le chemin final est bien dans uploadDir
    if (!full.startsWith(uploadDir)) {
      throw new ValidationError('Chemin invalide');
    }
    return full;
  }

  // ==========================================================================
  // 🗑️ SUPPRESSION
  // ==========================================================================
  static async deleteFile(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.resolveSafe(relativePath);
      await fs.unlink(fullPath);
      logger.info(`🗑️ Fichier supprimé : ${relativePath}`);
      return true;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        logger.warn(`⚠️ Fichier introuvable : ${relativePath}`);
        return false;
      }
      logger.error(`❌ Erreur suppression : ${err.message}`);
      return false;
    }
  }

  // ==========================================================================
  // ℹ️ INFOS FICHIER
  // ==========================================================================
  static async fileExists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.resolveSafe(relativePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  static async getFileInfo(relativePath: string): Promise<FileInfo> {
    try {
      const fullPath = this.resolveSafe(relativePath);
      const stats = await fs.stat(fullPath);

      return {
        exists: true,
        size: stats.size,
        sizeReadable: this.formatSize(stats.size),
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        extension: path.extname(fullPath),
        name: path.basename(fullPath),
      };
    } catch {
      return { exists: false };
    }
  }

  // ==========================================================================
  // 📂 LISTE / NETTOYAGE / RENOMMAGE
  // ==========================================================================
  static async listFiles(subfolder: string): Promise<ListedFile[]> {
    try {
      const dir = path.join(this.getUploadDir(), this.sanitize(subfolder));
      const files = await fs.readdir(dir);

      const details = await Promise.all(
        files
          .filter((f) => f !== '.gitkeep')
          .map(async (f) => {
            const fullPath = path.join(dir, f);
            const stats = await fs.stat(fullPath);
            return {
              name: f,
              url: `/uploads/${subfolder}/${f}`,
              size: stats.size,
              sizeReadable: this.formatSize(stats.size),
              createdAt: stats.birthtime,
            };
          }),
      );

      return details;
    } catch {
      return [];
    }
  }

  static async cleanFolder(subfolder: string): Promise<number> {
    try {
      const dir = path.join(this.getUploadDir(), this.sanitize(subfolder));
      const files = await fs.readdir(dir);
      let deleted = 0;

      for (const f of files) {
        if (f === '.gitkeep') continue;
        await fs.unlink(path.join(dir, f));
        deleted++;
      }

      logger.info(`🧹 ${deleted} fichier(s) supprimé(s) dans ${subfolder}`);
      return deleted;
    } catch {
      return 0;
    }
  }

  static async renameFile(
    subfolder: string,
    oldName: string,
    newName: string,
  ): Promise<string> {
    const dir = path.join(this.getUploadDir(), this.sanitize(subfolder));
    const oldPath = path.join(dir, path.basename(oldName));
    const newPath = path.join(dir, path.basename(newName));

    await fs.rename(oldPath, newPath);

    logger.info(`📝 Fichier renommé : ${oldName} → ${newName}`);
    return `/uploads/${subfolder}/${path.basename(newName)}`;
  }

  // ==========================================================================
  // 📏 UTILITAIRES
  // ==========================================================================
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  static validateMimeType(mimetype: string, allowed: string[]): void {
    if (!allowed.includes(mimetype)) {
      throw new ValidationError(`Type de fichier non autorisé : ${mimetype}`);
    }
  }

  static validateSize(size: number, maxSize: number): void {
    if (size > maxSize) {
      throw new ValidationError(
        `Fichier trop volumineux. Max : ${this.formatSize(maxSize)}`,
      );
    }
  }

  // ==========================================================================
  // 📊 STATISTIQUES D'UTILISATION
  // ==========================================================================
  static async getStats() {
    const stats: any = { total: 0, totalSize: 0, folders: {} };

    for (const sub of this.SAFE_SUBFOLDERS) {
      const files = await this.listFiles(sub);
      const size = files.reduce((s, f) => s + f.size, 0);

      stats.folders[sub] = {
        count: files.length,
        size,
        sizeReadable: this.formatSize(size),
      };
      stats.total += files.length;
      stats.totalSize += size;
    }

    stats.totalSizeReadable = this.formatSize(stats.totalSize);
    return stats;
  }
}