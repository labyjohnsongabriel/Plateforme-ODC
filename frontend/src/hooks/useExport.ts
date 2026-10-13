// src/hooks/useExport.ts
'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export interface UseExportReturn {
  exporting: boolean;
  download: (url: string, filename: string) => Promise<void>;
  exportToCSV: (url: string, filename?: string) => Promise<void>;
  exportToPDF: (url: string, filename?: string) => Promise<void>;
  exportToExcel: (url: string, filename?: string) => Promise<void>;
}

export function useExport(): UseExportReturn {
  const [exporting, setExporting] = useState(false);

  const download = useCallback(async (url: string, filename: string) => {
    setExporting(true);
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success('Téléchargement démarré');
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setExporting(false);
    }
  }, []);

  const date = () => new Date().toISOString().slice(0, 10);

  return {
    exporting,
    download,
    exportToCSV: (url, filename = `export-${date()}.csv`) =>
      download(url, filename),
    exportToPDF: (url, filename = `export-${date()}.pdf`) =>
      download(url, filename),
    exportToExcel: (url, filename = `export-${date()}.xlsx`) =>
      download(url, filename),
  };
}