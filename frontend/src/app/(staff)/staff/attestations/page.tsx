import type { Metadata } from 'next';
import { AttestationsTable } from './components/AttestationsTable';
import { GenerateDialog } from './components/GenerateDialog';

export const metadata: Metadata = { title: 'Attestations' };

export default function AttestationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Attestations</h1>
          <p className="text-odc-muted mt-1">Générez et gérez les attestations</p>
        </div>
        <GenerateDialog />
      </header>

      <AttestationsTable />
    </div>
  );
}