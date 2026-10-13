import type { Metadata } from 'next';
import { MyInscriptionsTable } from './components/MyInscriptionsTable';

export const metadata: Metadata = { title: 'Mes inscriptions' };

export default function InscriptionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Mes inscriptions
        </h1>
        <p className="text-odc-muted mt-1">
          Suivez l&apos;état de vos demandes d&apos;inscription
        </p>
      </header>
      <MyInscriptionsTable />
    </div>
  );
}