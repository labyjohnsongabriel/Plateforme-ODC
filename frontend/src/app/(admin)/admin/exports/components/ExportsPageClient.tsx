// src/app/(admin)/admin/exports/components/ExportsPageClient.tsx
'use client';

import {
  Users,
  BookOpen,
  Calendar,
  Award,
  type LucideIcon,
} from 'lucide-react';
import { ExportCard } from './ExportCard';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

interface ExportConfig {
  title: string;
  description: string;
  icon: LucideIcon;
  endpoints: {
    csv?: string;
    pdf?: string;
  };
  filename: string;
}

const EXPORTS: ExportConfig[] = [
  {
    title: 'Utilisateurs',
    description: 'Liste complète des utilisateurs avec leurs rôles',
    icon: Users,
    endpoints: {
      csv: '/admin/exports/utilisateurs/csv',
      pdf: '/admin/exports/utilisateurs/pdf',
    },
    filename: 'utilisateurs',
  },
  {
    title: 'Formations',
    description: 'Catalogue des formations et statistiques',
    icon: BookOpen,
    endpoints: {
      csv: '/admin/exports/formations/csv',
    },
    filename: 'formations',
  },
  {
    title: 'Inscriptions',
    description: 'Toutes les inscriptions avec statuts',
    icon: Calendar,
    endpoints: {
      csv: '/admin/exports/inscriptions/csv',
    },
    filename: 'inscriptions',
  },
  {
    title: 'Attestations',
    description: 'Registre complet des attestations émises',
    icon: Award,
    endpoints: {
      csv: '/admin/exports/attestations/csv',
    },
    filename: 'attestations',
  },
];

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function ExportsPageClient() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          Exports
        </h1>
        <p className="mt-1 text-odc-text-muted">
          Exportez les données de la plateforme aux formats CSV et PDF
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {EXPORTS.map((exp) => (
          <ExportCard key={exp.title} {...exp} />
        ))}
      </div>
    </div>
  );
}