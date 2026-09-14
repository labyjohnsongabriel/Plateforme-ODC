import puppeteer, { Browser } from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../config/logger';

export interface AttestationPdfData {
  numero: string;
  hash: string;
  participantNom: string;
  participantPrenom: string;
  formationTitre: string;
  formationDomaine: string;
  formationDuree: number;
  sessionDateDebut: Date;
  sessionDateFin: Date;
  formateurNom: string;
  note: number;
  tauxPresence: number;
  dateEmission: Date;
  qrCodeDataUrl: string;
}

export class PdfService {
  private static browser: Browser | null = null;
  private static templateCache: HandlebarsTemplateDelegate | null = null;

  /**
   * Singleton Puppeteer browser
   */
  private static async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.connected) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
        ],
      });
      logger.info('🌐 Puppeteer browser démarré');
    }
    return this.browser;
  }

  /**
   * Ferme le browser (pour arrêt propre)
   */
  static async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('🌐 Puppeteer browser fermé');
    }
  }

  /**
   * Charge et compile un template Handlebars
   */
  private static async chargerTemplate(
    templateName = 'attestation.hbs'
  ): Promise<HandlebarsTemplateDelegate> {
    if (this.templateCache) return this.templateCache;

    const tplPath = path.join(__dirname, '../templates', templateName);
    const source = await fs.readFile(tplPath, 'utf-8');

    // Helpers
    handlebars.registerHelper('formatDate', (d: Date) =>
      new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    );
    handlebars.registerHelper('uppercase', (s: string) => s.toUpperCase());
    handlebars.registerHelper('lowercase', (s: string) => s.toLowerCase());
    handlebars.registerHelper('formatNumber', (n: number, decimals = 2) =>
      Number(n).toFixed(decimals)
    );
    handlebars.registerHelper('eq', (a: any, b: any) => a === b);

    this.templateCache = handlebars.compile(source);
    return this.templateCache;
  }

  /**
   * Génère le PDF d'attestation
   */
  static async genererAttestation(data: AttestationPdfData): Promise<Buffer> {
    const template = await this.chargerTemplate();
    const html = template(data);

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  /**
   * Génère un PDF générique à partir d'un template + contexte
   */
  static async genererPdfGenerique(
    templateName: string,
    context: any,
    options?: {
      landscape?: boolean;
      format?: 'A4' | 'A3' | 'Letter';
    }
  ): Promise<Buffer> {
    const tplPath = path.join(__dirname, '../templates', templateName);
    const source = await fs.readFile(tplPath, 'utf-8');
    const html = handlebars.compile(source)(context);

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: options?.format || 'A4',
        landscape: options?.landscape ?? false,
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  /**
   * Sauvegarde un PDF sur disque
   */
  static async sauvegarderPdf(
    buffer: Buffer,
    filename: string,
    subfolder = 'attestations'
  ): Promise<string> {
    const dir = path.join(process.cwd(), 'uploads', subfolder);
    await fs.mkdir(dir, { recursive: true });

    const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    const filePath = path.join(dir, safeName);

    await fs.writeFile(filePath, buffer);
    logger.info(`📄 PDF sauvegardé : /uploads/${subfolder}/${safeName}`);

    return `/uploads/${subfolder}/${safeName}`;
  }

  /**
   * Génère un PDF et retourne un Buffer (sans sauvegarder)
   */
  static async genererBufferDepuisHtml(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  /**
   * Screenshot d'une page HTML
   */
  static async screenshotHtml(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setViewport({ width: 1200, height: 800 });
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const screenshot = await page.screenshot({ type: 'png', fullPage: true });
      return Buffer.from(screenshot);
    } finally {
      await page.close();
    }
  }
}