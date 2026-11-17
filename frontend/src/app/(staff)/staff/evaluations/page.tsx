// src/app/(staff)/staff/evaluations/page.tsx
import type { Metadata } from 'next';
import * as EvaluationsTableModule from './components/EvaluationsTable';

// ⭐ Récupère le composant quel que soit l'export (nommé ou default)
const EvaluationsTable =
  (EvaluationsTableModule as any).EvaluationsTable ??
  (EvaluationsTableModule as any).default;

export const metadata: Metadata = { title: 'Évaluations — Staff' };

export default function EvaluationsPage() {
  if (!EvaluationsTable) {
    return (
      <div className="p-6 text-destructive">
        ❌ EvaluationsTable introuvable (mauvais export dans components/EvaluationsTable.tsx)
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <EvaluationsTable />
    </div>
  );
}