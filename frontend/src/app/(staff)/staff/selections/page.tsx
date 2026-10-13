import type { Metadata } from 'next';
import { SessionsSelector } from './components/SessionsSelector';

export const metadata: Metadata = { title: 'Sélections' };

export default function SelectionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Sélections</h1>
        <p className="text-odc-muted mt-1">
          Sélectionnez les candidats pour chaque session
        </p>
      </header>
      <SessionsSelector />
    </div>
  );
}