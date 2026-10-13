import type { Metadata } from 'next';
import { RessourcesGrid } from './components/RessourcesGrid';

export const metadata: Metadata = { title: 'Ressources' };

export default function RessourcesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Ressources</h1>
        <p className="text-odc-muted mt-1">
          Supports pédagogiques mis à disposition par vos formateurs
        </p>
      </header>
      <RessourcesGrid />
    </div>
  );
}