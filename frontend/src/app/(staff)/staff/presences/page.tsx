import type { Metadata } from 'next';
import { SessionsSelector } from './components/SessionsSelector';

export const metadata: Metadata = { title: 'Présences' };

export default function PresencesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Présences</h1>
        <p className="text-odc-muted mt-1">
          Consultez et gérez les présences par session
        </p>
      </header>
      <SessionsSelector />
    </div>
  );
}