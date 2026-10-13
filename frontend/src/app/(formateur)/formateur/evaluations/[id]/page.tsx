import type { Metadata } from 'next';
import { EvaluationForm } from '../components/EvaluationForm';

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Modifier évaluation' };

export default function EditEvaluationPage({ params }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-bold">
        Modifier l&apos;évaluation
      </h1>
      <EvaluationForm mode="edit" id={params.id} />
    </div>
  );
}