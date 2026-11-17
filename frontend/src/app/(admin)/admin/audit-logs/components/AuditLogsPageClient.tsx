// src/app/(admin)/admin/audit-logs/components/AuditLogsPageClient.tsx
'use client';

import { Activity } from 'lucide-react';
import { AuditLogStats } from './AuditLogStats';
import { AuditLogFilters } from './AuditLogFilters';
import { AuditLogsTable } from './AuditLogsTable';

export function AuditLogsPageClient() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md ring-1 ring-primary/20">
          <Activity
            className="h-6 w-6 text-primary-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Journal d&apos;audit
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultez l&apos;historique complet des actions effectuées sur la
            plateforme ODC.
          </p>
        </div>
      </header>

      <AuditLogStats />
      <AuditLogFilters />
      <AuditLogsTable />
    </div>
  );
}