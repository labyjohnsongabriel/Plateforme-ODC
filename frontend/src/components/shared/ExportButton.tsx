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

  if (options.length === 1) {
    const opt = options[0];
    const Icon = opt.icon ?? FORMAT_ICONS[opt.format] ?? Download;
    return (
      <Button
        variant={variant}
        onClick={() => handleExport(opt)}
        disabled={!!loading}
        className={className}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Icon className="h-4 w-4 mr-2" />
        )}
        Exporter
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} disabled={!!loading} className={className}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exporter
        </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Format d&apos;export</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => {
          const Icon = opt.icon ?? FORMAT_ICONS[opt.format] ?? Download;
          return (
            <DropdownMenuItem
              key={opt.format}
              onClick={() => handleExport(opt)}
              disabled={loading === opt.format}
            >
              <Icon className="h-4 w-4 mr-2" />
              {opt.label}
              {loading === opt.format && (
                <Loader2 className="h-3 w-3 ml-auto animate-spin" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}