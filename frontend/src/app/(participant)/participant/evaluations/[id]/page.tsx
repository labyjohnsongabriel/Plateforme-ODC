import type { Metadata } from 'next';
import { EvaluationDetail } from './components/EvaluationDetail';

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Évaluation' };

export default function EvaluationDetailPage({ params }: Props) {
  return <EvaluationDetail evaluationId={params.id} />;
}