import type { Metadata } from 'next';
import { MyEvaluationsList } from './components/MyEvaluationsList';

export const metadata: Metadata = { title: 'Mes évaluations' };

export default function EvaluationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Mes évaluations
        </h1>
        <p className="text-odc-muted mt-1">
          Évaluations disponibles pour vos sessions
        </p>
      </header>
      <MyEvaluationsList />
    </div>
  );
}