// src/app/(admin)/admin/exports/page.tsx
import type { Metadata } from 'next';
import { ExportsPageClient } from './components/ExportsPageClient';

export const metadata: Metadata = {
  title: 'Exports | ODC Admin',
  description:
    'Exportez les données de la plateforme aux formats CSV et PDF.',
};

export default function ExportsPage() {
  return <ExportsPageClient />;
}