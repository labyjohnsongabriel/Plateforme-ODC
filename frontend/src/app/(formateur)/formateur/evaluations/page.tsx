import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EvaluationsList } from './components/EvaluationsList';

export const metadata: Metadata = { title: 'Mes évaluations' };

export default function EvaluationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Évaluations</h1>
          <p className="text-odc-muted mt-1">
            Créez et gérez les évaluations de vos sessions
          </p>
        </div>
        <Button variant="odc" asChild>
          <Link href="/formateur/evaluations/nouveau">
            <Plus className="h-4 w-4 mr-2" /> Nouvelle évaluation
          </Link>
        </Button>
      </header>

      <EvaluationsList />
    </div>
  );
}