import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { Formation } from '../entities/Formation.entity';
import { Session } from '../entities/Session.entity';
import { Inscription } from '../entities/Inscription.entity';
import { Attestation } from '../entities/Attestation.entity';
import { logger } from '../config/logger';
import fs from 'fs/promises';
import path from 'path';

export class StatsJob {
  /**
   * Calcule et sauvegarde les statistiques quotidiennes
   */
  static async executer(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalUsers,
      totalFormations,
      totalSessions,
      totalInscriptions,
      totalAttestations,
    ] = await Promise.all([
      AppDataSource.getRepository(User).count({ where: { actif: true } }),
      AppDataSource.getRepository(Formation).count({ where: { actif: true } }),
      AppDataSource.getRepository(Session).count(),
      AppDataSource.getRepository(Inscription).count(),
      AppDataSource.getRepository(Attestation).count(),
    ]);

    const stats = {
      date: today,
      timestamp: new Date().toISOString(),
      kpis: {
        totalUsers,
        totalFormations,
        totalSessions,
        totalInscriptions,
        totalAttestations,
      },
    };

    // Sauvegarder dans un fichier
    const dir = path.join(process.cwd(), 'logs', 'stats');
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, `stats-${today}.json`);
    await fs.writeFile(filePath, JSON.stringify(stats, null, 2));

    logger.info(`📊 Stats du jour sauvegardées : ${filePath}`);
  }
}