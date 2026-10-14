// src/app/(admin)/admin/exports/components/ExportCard.tsx
'use client';

import {
  Users,
  BookOpen,
  Calendar,
  Award,
  FileSpreadsheet,
  FileText,
  Download,
  type LucideIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExport } from '@/hooks/useExport';

/* ============================================================================
   MAPPING — Nom d'icône → Composant
   ============================================================================ */

const ICON_MAP = {
  Users,
  BookOpen,
  Calendar,
  Award,
  Download,
} as const;

export type IconName = keyof typeof ICON_MAP;

/* ============================================================================
   TYPES
   ============================================================================ */

interface ExportCardProps {
  title: string;
  description: string;
  /** ⭐ Nom de l'icône (string), PAS le composant */
  iconName: IconName;
  endpoints: {
    csv?: string;
    pdf?: string;
  };
  filename: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function ExportCard({
  title,
  description,
  iconName,
  endpoints,
  filename,
}: ExportCardProps) {
  const { exportToCSV, exportToPDF } = useExport();
  const date = new Date().toISOString().slice(0, 10);

  // ⭐ Résoudre l'icône dans le Client Component
  const Icon = ICON_MAP[iconName] ?? Download;

  return (
    <Card className="transition-shadow hover:shadow-odc-md">
      <CardHeader>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-odc-primary-soft">
            <Icon className="h-5 w-5 text-odc-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-odc-text-muted">{description}</p>

        <div className="flex gap-2">
          {endpoints.csv && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                exportToCSV(endpoints.csv!, `${filename}-${date}.csv`)
              }
              leftIcon={<FileSpreadsheet className="h-4 w-4" />}
            >
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
              leftIcon={<FileText className="h-4 w-4" />}
            >
              PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}