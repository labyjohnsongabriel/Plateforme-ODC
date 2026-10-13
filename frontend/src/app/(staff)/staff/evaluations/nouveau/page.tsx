import type { Metadata } from 'next';
import { EvaluationForm } from '../components/EvaluationForm';

export const metadata: Metadata = { title: 'Nouvelle évaluation' };

export default function NewEvaluationPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-bold">Nouvelle évaluation</h1>
      <EvaluationForm mode="create" />
    </div>
  );
}