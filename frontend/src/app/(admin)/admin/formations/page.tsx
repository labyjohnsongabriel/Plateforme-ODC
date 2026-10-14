// src/app/(admin)/admin/formations/page.tsx
'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormationStats } from './components/FormationStats';
import { FormationsTable } from './components/FormationsTable';
import { FormationFormModal } from './components/FormationFormModal';

export default function FormationsPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Formations
          </h1>
          <p className="mt-1 text-sm text-odc-text-muted">
            Gérez le catalogue des formations ODC, publiez-les et suivez
            leurs inscriptions.
          </p>
        </div>

        <Button
          variant="odc"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateOpen(true)}
          className="shrink-0"
        >
          Nouvelle formation
        </Button>
      </div>

      <FormationStats />
      <FormationsTable />

      <FormationFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}