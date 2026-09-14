// ============================================================================
//  DOWNLOAD HELPERS
// ============================================================================

/**
 * Télécharge un fichier depuis une URL
 */
export function downloadFromUrl(url: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || url.split('/').pop() || 'download';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Télécharge un Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Télécharge un texte comme fichier
 */
export function downloadText(content: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  downloadBlob(blob, filename);
}

/**
 * Télécharge un JSON
 */
export function downloadJson(data: any, filename: string): void {
  const content = JSON.stringify(data, null, 2);
  downloadText(content, filename, 'application/json');
}

/**
 * Télécharge un CSV
 */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Télécharge un PDF depuis un Blob
 */
export function downloadPdf(blob: Blob, filename: string): void {
  downloadBlob(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Ouvre un fichier dans un nouvel onglet
 */
export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Génère un nom de fichier avec timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Télécharge une image
 */
export async function downloadImage(url: string, filename?: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    downloadBlob(blob, filename || generateFilename('image', 'png'));
  } catch (err) {
    console.error('Erreur de téléchargement image :', err);
  }
}