// src/controllers/export.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ExportService } from '../services/export.service';
import { prepareCSVResponse } from '../utils/csv.util';
import { preparePDFResponse } from '../utils/pdf.util';
import { BadRequestError } from '../errors/AppError';

/* ============================================================================
   HELPERS
   ============================================================================ */

function getDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDateTimeString(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  return `${date}_${time}`;
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class ExportController {
  /* ==========================================================================
     UTILISATEURS
     ========================================================================== */
  static async utilisateursCSV(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const csv = (await ExportService.exportUtilisateurs('csv')) as string;
      prepareCSVResponse(res, csv, `utilisateurs-${getDateString()}.csv`);
    } catch (e) {
      next(e);
    }
  }

  static async utilisateursPDF(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const pdf = (await ExportService.exportUtilisateurs('pdf')) as Buffer;
      preparePDFResponse(res, pdf, `utilisateurs-${getDateString()}.pdf`);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     FORMATIONS
     ========================================================================== */
  static async formationsCSV(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const csv = (await ExportService.exportFormations('csv')) as string;
      prepareCSVResponse(res, csv, `formations-${getDateString()}.csv`);
    } catch (e) {
      next(e);
    }
  }

  static async formationsPDF(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const pdf = (await ExportService.exportFormations('pdf')) as Buffer;
      preparePDFResponse(res, pdf, `formations-${getDateString()}.pdf`);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     INSCRIPTIONS
     ========================================================================== */
  static async inscriptionsCSV(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const csv = (await ExportService.exportInscriptions('csv')) as string;
      prepareCSVResponse(res, csv, `inscriptions-${getDateString()}.csv`);
    } catch (e) {
      next(e);
    }
  }

  static async inscriptionsPDF(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const pdf = (await ExportService.exportInscriptions('pdf')) as Buffer;
      preparePDFResponse(res, pdf, `inscriptions-${getDateString()}.pdf`);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ATTESTATIONS
     ========================================================================== */
  static async attestationsCSV(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const csv = (await ExportService.exportAttestations('csv')) as string;
      prepareCSVResponse(res, csv, `attestations-${getDateString()}.csv`);
    } catch (e) {
      next(e);
    }
  }

  static async attestationsPDF(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const pdf = (await ExportService.exportAttestations('pdf')) as Buffer;
      preparePDFResponse(res, pdf, `attestations-${getDateString()}.pdf`);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     SESSIONS
     ========================================================================== */
  static async sessionsCSV(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const csv = (await ExportService.exportSessions('csv')) as string;
      prepareCSVResponse(res, csv, `sessions-${getDateString()}.csv`);
    } catch (e) {
      next(e);
    }
  }

  static async sessionsPDF(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const pdf = (await ExportService.exportSessions('pdf')) as Buffer;
      preparePDFResponse(res, pdf, `sessions-${getDateString()}.pdf`);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     PARTENAIRES
     ========================================================================== */
  static async partenairesCSV(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const csv = (await ExportService.exportPartenaires('csv')) as string;
      prepareCSVResponse(res, csv, `partenaires-${getDateString()}.csv`);
    } catch (e) {
      next(e);
    }
  }

  static async partenairesPDF(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const pdf = (await ExportService.exportPartenaires('pdf')) as Buffer;
      preparePDFResponse(res, pdf, `partenaires-${getDateString()}.pdf`);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     DOMAINES
     ========================================================================== */
  static async domainesCSV(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const csv = (await ExportService.exportDomaines('csv')) as string;
      prepareCSVResponse(res, csv, `domaines-${getDateString()}.csv`);
    } catch (e) {
      next(e);
    }
  }

  static async domainesPDF(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const pdf = (await ExportService.exportDomaines('pdf')) as Buffer;
      preparePDFResponse(res, pdf, `domaines-${getDateString()}.pdf`);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     AUDIT LOGS
     ========================================================================== */
  static async auditLogsCSV(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters = {
        dateDebut: req.query.dateDebut as string | undefined,
        dateFin: req.query.dateFin as string | undefined,
        action: req.query.action as string | undefined,
      };

      const csv = (await ExportService.exportAuditLogs(
        'csv',
        filters,
      )) as string;

      prepareCSVResponse(res, csv, `audit-logs-${getDateString()}.csv`);
    } catch (e) {
      next(e);
    }
  }

  static async auditLogsPDF(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters = {
        dateDebut: req.query.dateDebut as string | undefined,
        dateFin: req.query.dateFin as string | undefined,
        action: req.query.action as string | undefined,
      };

      const pdf = (await ExportService.exportAuditLogs(
        'pdf',
        filters,
      )) as Buffer;

      preparePDFResponse(res, pdf, `audit-logs-${getDateString()}.pdf`);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     EXPORT COMPLET (ZIP)
     ========================================================================== */
  static async complet(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const zipBuffer = await ExportService.exportComplet();

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="odc-export-${getDateTimeString()}.zip"`,
      );
      res.setHeader('Content-Length', zipBuffer.length);

      res.send(zipBuffer);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     STATISTIQUES
     ========================================================================== */
  static async stats(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await ExportService.getStats();
      res.json({ success: true, data: stats });
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     EXPORT PERSONNALISÉ
     ========================================================================== */
  static async custom(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { type, format, filters } = req.body;

      if (!type || !format) {
        throw new BadRequestError('Les champs type et format sont requis');
      }

      if (!['csv', 'pdf'].includes(format)) {
        throw new BadRequestError('Format invalide (csv ou pdf)');
      }

      const validTypes = [
        'utilisateurs',
        'formations',
        'inscriptions',
        'attestations',
        'sessions',
        'partenaires',
        'domaines',
        'audit-logs',
      ];

      if (!validTypes.includes(type)) {
        throw new BadRequestError(`Type d'export invalide : ${type}`);
      }

      const data = await ExportService.exportCustom(type, format, filters);
      const filename = `${type}-${getDateString()}.${format}`;

      if (format === 'csv') {
        prepareCSVResponse(res, data as string, filename);
      } else {
        preparePDFResponse(res, data as Buffer, filename);
      }
    } catch (e) {
      next(e);
    }
  }
}