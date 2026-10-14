// src/app/(admin)/admin/formations/[id]/page.tsx
import type { Metadata } from 'next';
import { FormationDetailClient } from './components/FormationDetailClient';

interface PageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Détail formation | ODC Admin',
  description: 'Consultez et modifiez les informations de la formation.',
};

export default function FormationDetailPage({ params }: PageProps) {
  return <FormationDetailClient formationId={params.id} />;
}