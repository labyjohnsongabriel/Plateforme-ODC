// src/app/(admin)/admin/roles/components/RolesPageClient.tsx
'use client';

import * as React from 'react';
import { RoleStats } from './RoleStats';
import { RolesTable } from './RolesTable';

export function RolesPageClient() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Rôles & Permissions
          </h1>
          <p className="mt-1 text-sm text-odc-text-muted">
            Définissez les rôles et les permissions d&apos;accès pour les
            utilisateurs de la plateforme ODC.
          </p>
        </div>
      </div>

      <RoleStats />
      <RolesTable />
    </div>
  );
}