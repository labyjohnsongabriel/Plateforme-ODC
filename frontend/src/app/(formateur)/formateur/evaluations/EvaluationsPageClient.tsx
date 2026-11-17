'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EvaluationsList } from './components/EvaluationsList';
import { EvaluationFormModal } from './components/EvaluationFormModal';

export function EvaluationsPageClient() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Évaluations
          </h1>
          <p className="text-odc-muted mt-1">
            Créez et gérez les évaluations de vos sessions
          </p>
        </div>
      </header>

      <EvaluationsList onCreate={() => setFormOpen(true)} />

      <EvaluationFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="create"
      />
    </div>
  );
}