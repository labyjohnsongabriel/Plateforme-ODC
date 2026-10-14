// src/utils/pdf.util.ts

/* ============================================================================
   PDF GENERATOR — Utilitaire de génération PDF (avec PDFKit)
   ============================================================================ */

import PDFDocument from 'pdfkit';

/* ============================================================================
   INTERFACES
   ============================================================================ */

export interface PDFColumn<T = any> {
  /** Clé dans l'objet */
  key: keyof T | string;
  /** En-tête */
  header: string;
  /** Largeur relative (par défaut : auto) */
  width?: number;
  /** Alignement */
  align?: 'left' | 'center' | 'right';
}

export interface PDFOptions {
  /** Titre du document */
  title: string;
  /** Sous-titre / description */
  subtitle?: string;
  /** Nom de l'organisation */
  organization?: string;
  /** Orientation */
  orientation?: 'portrait' | 'landscape';
  /** Format */
  size?: 'A4' | 'A3' | 'letter';
}

/* ============================================================================
   GÉNÉRATION
   ============================================================================ */

/**
 * Génère un buffer PDF à partir d'un tableau de données.
 */
export async function generatePDF<T extends Record<string, any>>(
  data: T[],
  columns: PDFColumn<T>[],
  options: PDFOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: options.size ?? 'A4',
        layout: options.orientation ?? 'portrait',
        margin: 40,
        info: {
          Title: options.title,
          Author: options.organization ?? 'ODC Formations',
          Creator: 'ODC Platform',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      /* -------------------- EN-TÊTE -------------------- */
      const pageWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;

      // Bandeau ODC
      doc
        .fillColor('#FF7900')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(options.organization ?? 'ODC FORMATIONS', {
          align: 'left',
        });

      doc.moveDown(0.3);

      doc
        .fillColor('#111827')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(options.title, { align: 'left' });

      if (options.subtitle) {
        doc.moveDown(0.2);
        doc
          .fillColor('#6B7280')
          .fontSize(10)
          .font('Helvetica')
          .text(options.subtitle);
      }

      doc.moveDown(0.5);

      /* -------------------- MÉTADONNÉES -------------------- */
      doc
        .fillColor('#9CA3AF')
        .fontSize(8)
        .font('Helvetica')
        .text(`Généré le ${new Date().toLocaleString('fr-FR')}`, {
          align: 'right',
        })
        .text(`Total : ${data.length} enregistrement(s)`, {
          align: 'right',
        });

      doc.moveDown(0.8);

      /* -------------------- TABLEAU -------------------- */
      const tableTop = doc.y;
      const columnWidth = pageWidth / columns.length;
      const rowHeight = 20;
      const headerHeight = 24;

      // En-têtes
      doc
        .fillColor('#FF7900')
        .rect(doc.page.margins.left, tableTop, pageWidth, headerHeight)
        .fill();

      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');

      columns.forEach((col, i) => {
        doc.text(col.header, doc.page.margins.left + i * columnWidth + 4, tableTop + 7, {
          width: columnWidth - 8,
          align: col.align ?? 'left',
          lineBreak: false,
        });
      });

      let y = tableTop + headerHeight;

      /* -------------------- LIGNES -------------------- */
      doc.font('Helvetica').fontSize(8).fillColor('#111827');

      data.forEach((row, index) => {
        // Fond alterné
        if (index % 2 === 0) {
          doc
            .fillColor('#F9FAFB')
            .rect(doc.page.margins.left, y, pageWidth, rowHeight)
            .fill();
        }

        doc.fillColor('#111827');

        columns.forEach((col, i) => {
          const value = getNestedValue(row, String(col.key));
          const text = formatValue(value);

          doc.text(text, doc.page.margins.left + i * columnWidth + 4, y + 6, {
            width: columnWidth - 8,
            align: col.align ?? 'left',
            lineBreak: false,
            ellipsis: true,
          });
        });

        y += rowHeight;

        // Saut de page
        if (y > doc.page.height - doc.page.margins.bottom - 60) {
          doc.addPage();
          y = doc.page.margins.top;

          // Ré-afficher l'en-tête
          doc
            .fillColor('#FF7900')
            .rect(doc.page.margins.left, y, pageWidth, headerHeight)
            .fill();

          doc.fillColor('#FFFFFF').font('Helvetica-Bold');

          columns.forEach((col, i) => {
            doc.text(
              col.header,
              doc.page.margins.left + i * columnWidth + 4,
              y + 7,
              {
                width: columnWidth - 8,
                align: col.align ?? 'left',
                lineBreak: false,
              },
            );
          });

          y += headerHeight;
          doc.font('Helvetica').fillColor('#111827');
        }
      });

      /* -------------------- PIED DE PAGE -------------------- */
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        doc
          .fillColor('#9CA3AF')
          .fontSize(8)
          .font('Helvetica')
          .text(
            `Page ${i + 1} sur ${range.count}`,
            doc.page.margins.left,
            doc.page.height - 30,
            {
              width: pageWidth,
              align: 'center',
            },
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/* ============================================================================
   HELPERS
   ============================================================================ */

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (value instanceof Date) {
    return value.toLocaleDateString('fr-FR');
  }
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Prépare la réponse HTTP pour un PDF.
 */
export function preparePDFResponse(
  res: any,
  buffer: Buffer,
  filename: string,
): void {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(filename)}"`,
  );
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
}