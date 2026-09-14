import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ValidationError } from '../errors/AppError';

export class UploadService {
  /**
   * Chemin absolu du dossier d'upload
   */
  private static getUploadDir(): string {
    return path.resolve(process.cwd(), env.UPLOAD_DIR);
  }

  /**
   * Supprime un fichier
   */
  static async deleteFile(relativePath: string): Promise<boolean> {
    try {
      // Sécurité : éviter path traversal
      const safe = relativePath.replace(/^\/+/, '').replace(/\.\./g, '');
      const fullPath = path.join(this.getUploadDir(), safe);

      await fs.unlink(fullPath);
      logger.info(`🗑️  Fichier supprimé : ${relativePath}`);
      return true;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        logger.warn(`⚠️  Fichier introuvable : ${relativePath}`);
        return false;
      }
      logger.error(`❌ Erreur suppression : ${err.message}`);
      return false;
    }
  }

  /**
   * Vérifie si un fichier existe
   */
  static async fileExists(relativePath: string): Promise<boolean> {
    try {
      const safe = relativePath.replace(/^\/+/, '').replace(/\.\./g, '');
      const fullPath = path.join(this.getUploadDir(), safe);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtient les informations d'un fichier
   */
  static async getFileInfo(relativePath: string) {
    try {
      const safe = relativePath.replace(/^\/+/, '').replace(/\.\./g, '');
      const fullPath = path.join(this.getUploadDir(), safe);
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

  /**
   * Liste les fichiers d'un sous-dossier
   */
  static async listFiles(subfolder: string) {
    try {
      const dir = path.join(this.getUploadDir(), subfolder);
      const files = await fs.readdir(dir);

      const details = await Promise.all(
        files.map(async (f) => {
          const fullPath = path.join(dir, f);
          const stats = await fs.stat(fullPath);
          return {
            name: f,
            url: `/uploads/${subfolder}/${f}`,
            size: stats.size,
            sizeReadable: this.formatSize(stats.size),
            createdAt: stats.birthtime,
          };
        })
      );

      return details;
    } catch {
      return [];
    }
  }

  /**
   * Supprime tous les fichiers d'un dossier (sauf .gitkeep)
   */
  static async cleanFolder(subfolder: string): Promise<number> {
    try {
      const dir = path.join(this.getUploadDir(), subfolder);
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

  /**
   * Renomme un fichier
   */
  static async renameFile(
    subfolder: string,
    oldName: string,
    newName: string
  ): Promise<string> {
    const dir = path.join(this.getUploadDir(), subfolder);
    const oldPath = path.join(dir, oldName);
    const newPath = path.join(dir, newName);

    await fs.rename(oldPath, newPath);

    logger.info(`📝 Fichier renommé : ${oldName} → ${newName}`);
    return `/uploads/${subfolder}/${newName}`;
  }

  /**
   * Formate une taille en octets
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  /**
   * Vérifie le type MIME
   */
  static validateMimeType(
    mimetype: string,
    allowed: string[]
  ): void {
    if (!allowed.includes(mimetype)) {
      throw new ValidationError(`Type de fichier non autorisé : ${mimetype}`);
    }
  }

  /**
   * Vérifie la taille
   */
  static validateSize(size: number, maxSize: number): void {
    if (size > maxSize) {
      throw new ValidationError(
        `Fichier trop volumineux. Max : ${this.formatSize(maxSize)}`
      );
    }
  }

  /**
   * Statistiques globales d'utilisation
   */
  static async getStats() {
    const subfolders = ['avatars', 'formations', 'attestations', 'ressources', 'temp'];
    const stats: any = { total: 0, totalSize: 0, folders: {} };

    for (const sub of subfolders) {
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