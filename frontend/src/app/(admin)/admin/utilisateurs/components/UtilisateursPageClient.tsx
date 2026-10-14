// src/app/(admin)/admin/utilisateurs/components/UtilisateursPageClient.tsx
'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserStats } from './UserStats';
import { UserFilters } from './UserFilters';
import { UsersTable } from './UsersTable';
import { UserFormModal } from './UserFormModal';

export function UtilisateursPageClient() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Utilisateurs
          </h1>
          <p className="mt-1 text-sm text-odc-text-muted">
            Gérez les comptes utilisateurs, leurs rôles et permissions.
          </p>
        </div>

        <Button
          variant="odc"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateOpen(true)}
          className="shrink-0"
        >
          Nouvel utilisateur
        </Button>
      </div>

      <UserStats />
      <UserFilters />
      <UsersTable />

      <UserFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}