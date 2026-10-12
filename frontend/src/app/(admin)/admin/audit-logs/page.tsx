import type { Metadata } from 'next';
import { AuditLogsTable } from './components/AuditLogsTable';
import { AuditLogFilters } from './components/AuditLogFilters';

export const metadata: Metadata = { title: 'Journal d\'audit' };

export default function AuditLogsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Journal d&apos;audit
        </h1>
        <p className="text-odc-muted mt-1">
          Historique de toutes les actions effectuées sur la plateforme
        </p>
      </header>

      <AuditLogFilters />
      <AuditLogsTable />
    </div>
  );
}