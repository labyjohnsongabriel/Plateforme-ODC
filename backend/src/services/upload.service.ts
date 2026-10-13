<<<<<<< HEAD
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ValidationError } from '../errors/AppError';

export class UploadService {
  /**
   * Chemin absolu du dossier d'upload
   */
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  private static getUploadDir(): string {
    return path.resolve(process.cwd(), env.UPLOAD_DIR);
  }

<<<<<<< HEAD
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
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
        return false;
      }
      logger.error(`❌ Erreur suppression : ${err.message}`);
      return false;
    }
  }

<<<<<<< HEAD
  /**
   * Vérifie si un fichier existe
   */
  static async fileExists(relativePath: string): Promise<boolean> {
    try {
      const safe = relativePath.replace(/^\/+/, '').replace(/\.\./g, '');
      const fullPath = path.join(this.getUploadDir(), safe);
=======
  // ==========================================================================
  // ℹ️ INFOS FICHIER
  // ==========================================================================
  static async fileExists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.resolveSafe(relativePath);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

<<<<<<< HEAD
  /**
   * Obtient les informations d'un fichier
   */
  static async getFileInfo(relativePath: string) {
    try {
      const safe = relativePath.replace(/^\/+/, '').replace(/\.\./g, '');
      const fullPath = path.join(this.getUploadDir(), safe);
=======
  static async getFileInfo(relativePath: string): Promise<FileInfo> {
    try {
      const fullPath = this.resolveSafe(relativePath);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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

<<<<<<< HEAD
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
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      );

      return details;
    } catch {
      return [];
    }
  }

<<<<<<< HEAD
  /**
   * Supprime tous les fichiers d'un dossier (sauf .gitkeep)
   */
  static async cleanFolder(subfolder: string): Promise<number> {
    try {
      const dir = path.join(this.getUploadDir(), subfolder);
=======
  static async cleanFolder(subfolder: string): Promise<number> {
    try {
      const dir = path.join(this.getUploadDir(), this.sanitize(subfolder));
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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

<<<<<<< HEAD
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
=======
  static async renameFile(
    subfolder: string,
    oldName: string,
    newName: string,
  ): Promise<string> {
    const dir = path.join(this.getUploadDir(), this.sanitize(subfolder));
    const oldPath = path.join(dir, path.basename(oldName));
    const newPath = path.join(dir, path.basename(newName));
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

    await fs.rename(oldPath, newPath);

    logger.info(`📝 Fichier renommé : ${oldName} → ${newName}`);
<<<<<<< HEAD
    return `/uploads/${subfolder}/${newName}`;
  }

  /**
   * Formate une taille en octets
   */
=======
    return `/uploads/${subfolder}/${path.basename(newName)}`;
  }

  // ==========================================================================
  // 📏 UTILITAIRES
  // ==========================================================================
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

<<<<<<< HEAD
  /**
   * Vérifie le type MIME
   */
  static validateMimeType(
    mimetype: string,
    allowed: string[]
  ): void {
=======
  static validateMimeType(mimetype: string, allowed: string[]): void {
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    if (!allowed.includes(mimetype)) {
      throw new ValidationError(`Type de fichier non autorisé : ${mimetype}`);
    }
  }

<<<<<<< HEAD
  /**
   * Vérifie la taille
   */
  static validateSize(size: number, maxSize: number): void {
    if (size > maxSize) {
      throw new ValidationError(
        `Fichier trop volumineux. Max : ${this.formatSize(maxSize)}`
=======
  static validateSize(size: number, maxSize: number): void {
    if (size > maxSize) {
      throw new ValidationError(
        `Fichier trop volumineux. Max : ${this.formatSize(maxSize)}`,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      );
    }
  }

<<<<<<< HEAD
  /**
   * Statistiques globales d'utilisation
   */
  static async getStats() {
    const subfolders = ['avatars', 'formations', 'attestations', 'ressources', 'temp'];
    const stats: any = { total: 0, totalSize: 0, folders: {} };

    for (const sub of subfolders) {
      const files = await this.listFiles(sub);
      const size = files.reduce((s, f) => s + f.size, 0);
=======
  // ==========================================================================
  // 📊 STATISTIQUES D'UTILISATION
  // ==========================================================================
  static async getStats() {
    const stats: any = { total: 0, totalSize: 0, folders: {} };

    for (const sub of this.SAFE_SUBFOLDERS) {
      const files = await this.listFiles(sub);
      const size = files.reduce((s, f) => s + f.size, 0);

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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