// src/app/(admin)/admin/partenaires/components/PartenairesPageClient.tsx
'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PartnerStats } from './PartnerStats';
import { PartnersTable } from './PartnersTable';
import { PartnerFormModal } from './PartnerFormModal';

export function PartenairesPageClient() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Partenaires
          </h1>
          <p className="mt-1 text-sm text-odc-text-muted">
            Gérez les partenaires de l&apos;écosystème ODC : entreprises,
            institutions et organismes collaborateurs.
          </p>
        </div>

        <Button
          variant="odc"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateOpen(true)}
          className="shrink-0"
        >
          Nouveau partenaire
        </Button>
      </div>

      <PartnerStats />
      <PartnersTable />

      <PartnerFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}