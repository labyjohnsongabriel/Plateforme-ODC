'use client';

import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExport } from '@/hooks/useExport';

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  endpoints: {
    csv?: string;
    pdf?: string;
  };
  filename: string;
}

export function ExportCard({ title, description, icon: Icon, endpoints, filename }: Props) {
  const { exportToCSV, exportToPDF } = useExport();
  const date = new Date().toISOString().slice(0, 10);

  return (
    <Card className="hover:shadow-odc-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-lg bg-odc-primary-soft flex items-center justify-center">
            <Icon className="h-5 w-5 text-odc-primary" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-odc-muted">{description}</p>

        <div className="flex gap-2">
          {endpoints.csv && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                exportToCSV(endpoints.csv!, `${filename}-${date}.csv`)
              }
            >
              <FileSpreadsheet className="h-4 w-4 mr-1.5" />
              CSV
            </Button>
          )}

          {endpoints.pdf && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                exportToPDF(endpoints.pdf!, `${filename}-${date}.pdf`)
              }
            >
              <FileText className="h-4 w-4 mr-1.5" />
              PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}