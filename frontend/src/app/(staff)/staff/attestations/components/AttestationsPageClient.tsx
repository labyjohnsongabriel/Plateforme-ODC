// src/app/(admin)/admin/attestations/components/AttestationsPageClient.tsx
'use client';

import { AttestationsStats } from './AttestationsStats';
import { AttestationsFilters } from './AttestationsFilters';
import { AttestationsTable } from './AttestationsTable';
import { GenerateAttestationsDialog } from './GenerateAttestationsDialog';

export function AttestationsPageClient() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Attestations
          </h1>
          <p className="mt-1 text-sm text-odc-text-muted">
            Générez et gérez les attestations de formation ODC.
          </p>
        </div>

        <GenerateAttestationsDialog />
      </div>

      <AttestationsStats />
      <AttestationsFilters />
      <AttestationsTable />
    </div>
  );
}