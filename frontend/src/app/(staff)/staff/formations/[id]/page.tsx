// src/app/(staff)/staff/formations/[id]/page.tsx
import type { Metadata } from 'next';
import { FormationDetail } from './components/FormationDetail';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: 'Détail de la formation' };

export default function FormationDetailPage({ params }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <FormationDetail formationId={params.id} />
    </div>
  );
}