'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { DomaineStats } from './components/DomaineStats';
import { DomainesTable } from './components/DomainesTable';
import { DomaineFormModal } from './components/DomaineFormModal';

export default function DomainesPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Domaines de formation"
        description="Organisez votre catalogue ODC par domaines thématiques."
        actions={
          <Button
            variant="odc"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Nouveau domaine
          </Button>
        }
      />

      <DomaineStats />

      <DomainesTable />

      {/* Modale de création globale */}
      <DomaineFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}