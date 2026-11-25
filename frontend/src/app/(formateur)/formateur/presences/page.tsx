import type { Metadata } from 'next';
import { SessionsPresenceSelector } from './components/SessionsPresenceSelector';

export const metadata: Metadata = { title: 'Présences' };

export default function PresencesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50 md:text-3xl">
          Présences
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Générez un QR code pour enregistrer les présences de vos sessions
        </p>
      </header>
      <SessionsPresenceSelector />
    </div>
  );
}