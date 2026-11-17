// src/controllers/HealthController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';

export class HealthController {
  static async check(_req: Request, res: Response) {
    const dbUp = AppDataSource.isInitialized;
    res.status(dbUp ? 200 : 503).json({
      success: dbUp,
      status: dbUp ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      database: dbUp ? 'up' : 'down',
    });
  }

  static live(_req: Request, res: Response) {
    res.status(200).json({ status: 'alive' });
  }

  static ready(_req: Request, res: Response) {
    const ready = AppDataSource.isInitialized;
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready' });
  }

  static async db(_req: Request, res: Response) {
    try {
      await AppDataSource.query('SELECT 1');
      res.json({ success: true, db: 'up' });
    } catch (e: any) {
      res.status(503).json({ success: false, error: e.message });
    }
  }
}