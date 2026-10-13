import type { Metadata } from 'next';
import { AttestationsList } from './components/AttestationsList';

export const metadata: Metadata = { title: 'Mes attestations' };

export default function AttestationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Mes attestations
        </h1>
        <p className="text-odc-muted mt-1">
          Téléchargez vos attestations de formation
        </p>
      </header>
      <AttestationsList />
    </div>
  );
}