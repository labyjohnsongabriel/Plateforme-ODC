// src/utils/attestation-logo.ts
import fs from 'fs';
import path from 'path';
import { logger } from '../config/logger';

const CANDIDATES = [
  // Chemin prioritaire (recommandé)
  path.resolve(process.cwd(), 'src/assets/brand/logo-odc.png'),
  path.resolve(process.cwd(), 'assets/brand/logo-odc.png'),
  // Fallback compilé
  path.resolve(__dirname, '../assets/brand/logo-odc.png'),
  path.resolve(__dirname, '../../src/assets/brand/logo-odc.png'),
  // Fallback public
  path.resolve(process.cwd(), 'public/images/brand/logo-odc.png'),
  // Fallback frontend (dev uniquement)
  path.resolve(process.cwd(), '../frontend/public/images/brand/logo-odc.png'),
  'E:\\Dossier\\odc-platform\\frontend\\public\\images\\brand\\logo-odc.png',
];

let _cache: string | null | undefined = undefined;

/**
 * Retourne le logo ODC en data URL base64.
 * Le résultat est mis en cache pour tout le cycle de vie du process.
 */
export function getLogoDataUrl(): string | undefined {
  if (_cache !== undefined) return _cache ?? undefined;

  for (const p of CANDIDATES) {
    try {
      if (!fs.existsSync(p)) continue;

      const stat = fs.statSync(p);
      if (stat.size === 0) {
        logger.warn(`[logo] Fichier vide ignoré : ${p}`);
        continue;
      }

      const buffer = fs.readFileSync(p);
      const ext = path.extname(p).toLowerCase();
      const mime =
        ext === '.svg' ? 'image/svg+xml' :
        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
        ext === '.webp' ? 'image/webp' :
        'image/png';

      _cache = `data:${mime};base64,${buffer.toString('base64')}`;
      logger.info(`[logo] Chargé depuis ${p} (${stat.size} octets)`);
      return _cache;
    } catch (err) {
      logger.warn(`[logo] Erreur lecture ${p}:`, (err as Error).message);
    }
  }

  logger.error(
    '[logo] ❌ Aucun logo ODC trouvé. Copie "logo-odc.png" dans backend/src/assets/brand/',
  );
  _cache = null;
  return undefined;
}

/** Utile pour les tests */
export function resetLogoCache(): void {
  _cache = undefined;
}