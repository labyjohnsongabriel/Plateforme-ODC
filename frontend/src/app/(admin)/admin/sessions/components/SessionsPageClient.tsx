// src/app/(admin)/admin/sessions/components/SessionsPageClient.tsx
'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionStats } from './SessionStats';
import { SessionsTable } from './SessionsTable';
import { SessionFormModal } from './SessionFormModal';

export function SessionsPageClient() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Sessions
          </h1>
          <p className="mt-1 text-sm text-odc-text-muted">
            Planifiez, ouvrez et suivez les sessions de formation ODC.
          </p>
        </div>

        <Button
          variant="odc"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateOpen(true)}
          className="shrink-0"
        >
          Nouvelle session
        </Button>
      </div>

      <SessionStats />
      <SessionsTable />

      <SessionFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}