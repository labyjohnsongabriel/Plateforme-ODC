// src/app/(admin)/admin/audit-logs/components/AuditLogsPageClient.tsx
'use client';

import { AuditLogStats } from './AuditLogStats';
import { AuditLogFilters } from './AuditLogFilters';
import { AuditLogsTable } from './AuditLogsTable';

export function AuditLogsPageClient() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Journal d&apos;audit
        </h1>
        <p className="mt-1 text-sm text-odc-text-muted">
          Consultez l&apos;historique complet des actions effectuées sur la
          plateforme ODC.
        </p>
      </div>

      <AuditLogStats />
      <AuditLogFilters />
      <AuditLogsTable />
    </div>
  );
}