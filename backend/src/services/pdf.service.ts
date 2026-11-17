// src/services/pdf.service.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import handlebars, { HandlebarsTemplateDelegate } from 'handlebars';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { logger } from '../config/logger';
import { env } from '../config/env';

/* ============================================================================
   TYPES
   ============================================================================ */

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
  logoDataUrl?: string;
  odcName: string;
  odcAdresse: string;
  odcWebsite: string;
  signataireNom: string;
  signataireFonction: string;
}

export interface PdfOptions {
  landscape?: boolean;
  format?: 'A4' | 'A3' | 'Letter';
  timeout?: number;
}

/* ============================================================================
   ⭐ LOGO ODC — Cache mémoire + fallbacks
   ============================================================================ */

const LOGO_CANDIDATES: string[] = [
  path.resolve(process.cwd(), 'src/assets/brand/logo-odc.png'),
  path.resolve(process.cwd(), 'assets/brand/logo-odc.png'),
  path.resolve(__dirname, '../assets/brand/logo-odc.png'),
  path.resolve(__dirname, '../../src/assets/brand/logo-odc.png'),
  path.resolve(process.cwd(), 'public/images/brand/logo-odc.png'),
  path.resolve(process.cwd(), '../frontend/public/images/brand/logo-odc.png'),
  path.resolve(process.cwd(), 'frontend/public/images/brand/logo-odc.png'),
  'E:\\Dossier\\odc-platform\\frontend\\public\\images\\brand\\logo-odc.png',
];

let _logoCache: string | null | undefined = undefined;

function loadLogoDataUrl(): string | undefined {
  if (_logoCache !== undefined) return _logoCache ?? undefined;

  for (const p of LOGO_CANDIDATES) {
    try {
      if (!fsSync.existsSync(p)) continue;

      const stat = fsSync.statSync(p);
      if (stat.size === 0) {
        logger.warn(`[logo] Fichier vide ignoré : ${p}`);
        continue;
      }

      const buffer = fsSync.readFileSync(p);
      const ext = path.extname(p).toLowerCase();
      const mime =
        ext === '.svg' ? 'image/svg+xml' :
        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
        ext === '.webp' ? 'image/webp' :
        'image/png';

      _logoCache = `data:${mime};base64,${buffer.toString('base64')}`;
      logger.info(`[logo] ✅ Chargé depuis ${p} (${stat.size} octets)`);
      return _logoCache;
    } catch (err) {
      logger.warn(`[logo] Erreur lecture ${p}: ${(err as Error).message}`);
    }
  }

  logger.error(
    '[logo] ❌ Aucun logo ODC trouvé. Copie "logo-odc.png" dans backend/src/assets/brand/',
  );
  _logoCache = null;
  return undefined;
}

/* ============================================================================
   SERVICE
   ============================================================================ */

export class PdfService {
  private static browser: Browser | null = null;
  private static templateCache = new Map<string, HandlebarsTemplateDelegate>();
  private static initLock: Promise<Browser> | null = null;
  private static helpersRegistered = false;

  /* ==========================================================================
     BROWSER
     ========================================================================== */
  private static async getBrowser(): Promise<Browser> {
    if (this.initLock) return this.initLock;
    if (this.browser && this.browser.connected) return this.browser;
    if (this.browser && !this.browser.connected) {
      try { await this.browser.close(); } catch { /* noop */ }
      this.browser = null;
    }

    this.initLock = (async () => {
      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--no-first-run',
            '--hide-scrollbars',
            '--mute-audio',
            '--font-render-hinting=none',
          ],
          timeout: 60_000,
        });
        this.browser = browser;
        logger.info('🌐 Puppeteer browser démarré');
        return browser;
      } catch (err) {
        logger.error('❌ Puppeteer launch échoué:', err);
        throw err;
      } finally {
        this.initLock = null;
      }
    })();

    return this.initLock;
  }

  static async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        logger.info('🌐 Puppeteer browser fermé');
      } catch (err) {
        logger.warn('Erreur fermeture browser:', err);
      } finally {
        this.browser = null;
        this.templateCache.clear();
      }
    }
  }

  /* ==========================================================================
     HELPERS HANDLEBARS
     ========================================================================== */
  private static registerHelpers(): void {
    if (this.helpersRegistered) return;

    handlebars.registerHelper('formatDate', (d: Date | string) => {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'long', year: 'numeric',
        });
      } catch { return '—'; }
    });
    handlebars.registerHelper('uppercase', (s: string) => String(s ?? '').toUpperCase());
    handlebars.registerHelper('lowercase', (s: string) => String(s ?? '').toLowerCase());
    handlebars.registerHelper('formatNumber', (n: number, decimals = 2) => {
      const v = Number(n);
      return Number.isFinite(v) ? v.toFixed(decimals) : '—';
    });
    handlebars.registerHelper('eq', (a: any, b: any) => a === b);

    this.helpersRegistered = true;
  }

  /* ==========================================================================
     TEMPLATE
     ========================================================================== */
  private static async chargerTemplate(
    templateName = 'attestation.hbs',
  ): Promise<HandlebarsTemplateDelegate> {
    const cached = this.templateCache.get(templateName);
    if (cached) return cached;

    this.registerHelpers();

    const candidates = [
      path.join(process.cwd(), 'src', 'templates', templateName),
      path.join(process.cwd(), 'dist', 'templates', templateName),
      path.join(__dirname, '..', 'templates', templateName),
      path.join(__dirname, '..', '..', 'src', 'templates', templateName),
    ];

    let source: string | null = null;
    for (const p of candidates) {
      try {
        source = await fs.readFile(p, 'utf-8');
        logger.debug(`[pdf] Template chargé : ${p}`);
        break;
      } catch { /* noop */ }
    }

    if (!source) {
      throw new Error(`Template "${templateName}" introuvable dans : ${candidates.join(', ')}`);
    }

    const compiled = handlebars.compile(source);
    this.templateCache.set(templateName, compiled);
    return compiled;
  }

  /* ==========================================================================
     ⭐ GÉNÉRATION PDF
     ========================================================================== */
  static async genererAttestation(data: AttestationPdfData): Promise<Buffer> {
    const template = await this.chargerTemplate();
    const html = template(data);

    if (html.includes('data:image/')) {
      logger.info('[pdf] ✅ HTML contient une image base64');
    } else {
      logger.warn('[pdf] ❌ HTML NE contient PAS de data URL — SVG fallback utilisé');
    }

    if (env.isDev) {
      try {
        const dir = path.join(process.cwd(), 'uploads', '_debug');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(
          path.join(dir, `attestation-${data.numero || 'test'}.html`),
          html, 'utf-8',
        );
      } catch { /* noop */ }
    }

    const browser = await this.getBrowser();
    let page: Page | null = null;

    try {
      page = await browser.newPage();
      page.setDefaultTimeout(30_000);
      page.setDefaultNavigationTimeout(30_000);

      await page.setContent(html, {
        waitUntil: ['load', 'networkidle0'],
        timeout: 30_000,
      });

      await page.evaluate(async () => {
        const imgs = Array.from(document.images);
        await Promise.all(imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
                setTimeout(() => resolve(), 5000);
              }),
        ));
        await new Promise((r) => setTimeout(r, 100));
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      });

      return Buffer.from(pdfBuffer);
    } catch (err) {
      logger.error('[PdfService.genererAttestation] Erreur:', err);
      if (this.browser && !this.browser.connected) this.browser = null;
      throw err;
    } finally {
      if (page) try { await page.close(); } catch { /* noop */ }
    }
  }

  /* ==========================================================================
     QR CODE
     ========================================================================== */
  static async genererQrCode(url: string): Promise<string> {
    try {
      return await QRCode.toDataURL(url, {
        width: 300, margin: 1, errorCorrectionLevel: 'M',
        color: { dark: '#0f172a', light: '#ffffff' },
      });
    } catch (err) {
      logger.warn('[PdfService] QR génération échouée:', err);
      return '';
    }
  }

  /* ==========================================================================
     HELPERS — extraction robuste
     ========================================================================== */
  private static extractDomaine(formation: any): string {
    if (!formation) return '';
    const d = formation.domaine;
    if (typeof d === 'string') return d;
    if (d && typeof d === 'object' && d.nom) return d.nom;
    if (formation.domaineRelation?.nom) return formation.domaineRelation.nom;
    if (formation.domaineNom) return formation.domaineNom;
    return '';
  }

  private static extractFormateurNom(session: any): string {
    const f = session?.formateur;
    if (!f) return 'Formateur ODC';
    if (f.nomComplet) return f.nomComplet;
    return `${f.prenom ?? ''} ${f.nom ?? ''}`.trim() || 'Formateur ODC';
  }

  /* ==========================================================================
     BUILD DATA (sync)
     ========================================================================== */
  static buildData(
    attestation: any,
    options: { verificationUrl?: string } = {},
  ): AttestationPdfData {
    const formation = attestation.session?.formation;

    return {
      numero: attestation.numero ?? '',
      hash: attestation.hashVerification ?? attestation.hash ?? '',
      participantNom: attestation.participant?.nom ?? '',
      participantPrenom: attestation.participant?.prenom ?? '',
      formationTitre: formation?.titre ?? 'Formation',
      formationDomaine: this.extractDomaine(formation),
      formationDuree: Number(formation?.dureeHeures ?? 0),
      sessionDateDebut: attestation.session?.dateDebut ?? new Date(),
      sessionDateFin: attestation.session?.dateFin ?? new Date(),
      formateurNom: this.extractFormateurNom(attestation.session),
      note: Number(attestation.noteFinale ?? 0),
      tauxPresence: Number(attestation.tauxPresence ?? 0),
      dateEmission: attestation.dateEmission ?? new Date(),
      qrCodeDataUrl: '',
      logoDataUrl: undefined,

      // ⭐ Organisation — Fianarantsoa depuis .env
      odcName: env.ODC_NAME,
      odcAdresse: env.ODC_ADRESSE,
      odcWebsite: env.ODC_WEBSITE,
      signataireNom: env.ODC_SIGNATAIRE_NOM,
      signataireFonction: env.ODC_SIGNATAIRE_FONCTION,
    };
  }

  /* ==========================================================================
     BUILD DATA ASYNC — injecte QR + LOGO
     ========================================================================== */
  static async buildDataAsync(
    attestation: any,
    options: { verificationUrl?: string; logoDataUrl?: string } = {},
  ): Promise<AttestationPdfData> {
    const data = this.buildData(attestation, options);

    try {
      const baseUrl = (env.CLIENT_URL ?? 'https://odc.mg').replace(/\/+$/, '');
      const url = options.verificationUrl ?? `${baseUrl}/verifier-attestation/${attestation.numero}`;
      data.qrCodeDataUrl = await this.genererQrCode(url);
    } catch (err) {
      logger.warn('[pdf] QR non généré:', err);
    }

    const logo = options.logoDataUrl ?? loadLogoDataUrl();
    if (logo) {
      data.logoDataUrl = logo;
      logger.debug(`[pdf] logoDataUrl injecté (${logo.length} chars)`);
    } else {
      logger.warn('[pdf] ⚠️ logoDataUrl absent — SVG fallback utilisé');
    }

    return data;
  }

  /* ==========================================================================
     PDF GÉNÉRIQUE
     ========================================================================== */
  static async genererPdfGenerique(
    templateName: string, context: any, options?: PdfOptions,
  ): Promise<Buffer> {
    const template = await this.chargerTemplate(templateName);
    const html = template(context);
    const browser = await this.getBrowser();
    let page: Page | null = null;
    try {
      page = await browser.newPage();
      page.setDefaultTimeout(options?.timeout ?? 30_000);
      await page.setContent(html, {
        waitUntil: ['load', 'networkidle0'],
        timeout: options?.timeout ?? 30_000,
      });
      const pdfBuffer = await page.pdf({
        format: options?.format || 'A4',
        landscape: options?.landscape ?? false,
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }

  /* ==========================================================================
     SAUVEGARDE
     ========================================================================== */
  static async sauvegarderPdf(
    buffer: Buffer, filename: string, subfolder = 'attestations',
  ): Promise<string> {
    const dir = path.join(process.cwd(), 'uploads', subfolder);
    await fs.mkdir(dir, { recursive: true });
    const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    const filePath = path.join(dir, safeName);
    await fs.writeFile(filePath, buffer);
    logger.info(`📄 PDF sauvegardé : /uploads/${subfolder}/${safeName}`);
    return `/uploads/${subfolder}/${safeName}`;
  }

  /* ==========================================================================
     HELPERS HTML
     ========================================================================== */
  static async genererBufferDepuisHtml(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    let page: Page | null = null;
    try {
      page = await browser.newPage();
      await page.setContent(html, { waitUntil: ['load', 'networkidle0'], timeout: 30_000 });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdfBuffer);
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }

  static async screenshotHtml(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    let page: Page | null = null;
    try {
      page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      await page.setContent(html, { waitUntil: ['load', 'networkidle0'], timeout: 30_000 });
      const screenshot = await page.screenshot({ type: 'png', fullPage: true });
      return Buffer.from(screenshot);
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }
}

/* ============================================================================
   CLEANUP
   ============================================================================ */
process.on('SIGTERM', async () => { await PdfService.close(); });
process.on('SIGINT', async () => { await PdfService.close(); process.exit(0); });