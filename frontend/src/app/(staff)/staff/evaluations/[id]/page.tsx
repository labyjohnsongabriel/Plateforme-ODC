// src/app/(staff)/staff/evaluations/[id]/page.tsx
import type { Metadata } from 'next';
import { EvaluationDetail } from './components/EvaluationDetail';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: 'Détail de l’évaluation' };

export default function EvaluationDetailPage({ params }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <EvaluationDetail evaluationId={params.id} />
    </div>
  );
}