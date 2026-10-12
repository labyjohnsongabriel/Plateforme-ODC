import type { Metadata } from 'next';
import { SentRequestsList } from '../../components/SentRequestsList';

export const metadata: Metadata = { title: 'Demandes envoyées' };

export default function DemandesEnvoyeesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Demandes envoyées
        </h1>
        <p className="text-odc-muted mt-1">
          Demandes de connexion que vous avez envoyées
        </p>
      </header>
      <SentRequestsList />
    </div>
  );
}