// src/components/shared/ExportButton.tsx
'use client';

import * as React from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

interface ExportOption {
  label: string;
  format: 'csv' | 'pdf' | 'xlsx';
  endpoint: string;
  icon?: React.ElementType;
}

interface ExportButtonProps {
  options: ExportOption[];
  filename?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'odc';
}

const FORMAT_ICONS: Record<string, React.ElementType> = {
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  pdf: FileText,
};

/* Classes neutres réutilisables */
const NEUTRAL_BUTTON_CLASS = cn(
  'h-9 rounded-lg font-medium',
  'border-slate-200 bg-white text-slate-700',
  'hover:bg-slate-50 hover:text-slate-900',
  'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300',
  'dark:hover:bg-slate-900 dark:hover:text-slate-50',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
);

export function ExportButton({
  options,
  filename,
  className,
  variant = 'outline',
}: ExportButtonProps) {
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleExport = async (option: ExportOption) => {
    setLoading(option.format);
    try {
      const response = await api.get(option.endpoint, { responseType: 'blob' });
      const ext = option.format === 'xlsx' ? 'xlsx' : option.format;
      const date = new Date().toISOString().slice(0, 10);
      const name = `${filename ?? 'export'}-${date}.${ext}`;

      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Export téléchargé');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  /* ── Cas 1 : un seul format → bouton simple ─────────────── */
  if (options.length === 1) {
    const opt = options[0];
    const Icon = opt.icon ?? FORMAT_ICONS[opt.format] ?? Download;
    return (
      <Button
        variant={variant}
        onClick={() => handleExport(opt)}
        disabled={!!loading}
        className={cn(NEUTRAL_BUTTON_CLASS, className)}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Icon className="mr-2 h-4 w-4" aria-hidden />
        )}
        Exporter
      </Button>
    );
  }

  /* ── Cas 2 : plusieurs formats → dropdown ───────────────── */
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          disabled={!!loading}
          className={cn(NEUTRAL_BUTTON_CLASS, className)}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="mr-2 h-4 w-4" aria-hidden />
          )}
          Exporter
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
      >
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Format d&apos;export
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />

        {options.map((opt) => {
          const Icon = opt.icon ?? FORMAT_ICONS[opt.format] ?? Download;
          const isLoading = loading === opt.format;
          return (
            <DropdownMenuItem
              key={opt.format}
              onClick={() => handleExport(opt)}
              disabled={isLoading}
              className={cn(
                'cursor-pointer rounded-md px-2 py-2 text-sm font-medium',
                'text-slate-700 focus:bg-slate-100 focus:text-slate-900',
                'dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-slate-50',
              )}
            >
              <Icon
                className="mr-2 h-4 w-4 text-slate-400 dark:text-slate-500"
                aria-hidden
              />
              {opt.label}
              {isLoading && (
                <Loader2
                  className="ml-auto h-3 w-3 animate-spin text-slate-500 dark:text-slate-400"
                  aria-hidden
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}