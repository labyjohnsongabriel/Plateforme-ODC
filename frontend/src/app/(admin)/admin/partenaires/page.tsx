// src/app/(admin)/admin/partenaires/page.tsx
import type { Metadata } from 'next';
import { PartenairesPageClient } from './components/PartenairesPageClient';

export const metadata: Metadata = {
  title: 'Partenaires | ODC Admin',
  description: 'Gérez les partenaires de l\'écosystème ODC.',
};

export default function PartenairesPage() {
  return <PartenairesPageClient />;
}