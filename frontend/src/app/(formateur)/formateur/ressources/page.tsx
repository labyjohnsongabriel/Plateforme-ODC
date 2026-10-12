import type { Metadata } from 'next';
import { RessourceUpload } from './components/RessourceUpload';
import { RessourcesList } from '@/app/(staff)/staff/ressources/components/RessourcesList';

export const metadata: Metadata = { title: 'Ressources' };

export default function FormateurRessourcesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Ressources</h1>
          <p className="text-odc-muted mt-1">
            Gérez les ressources pédagogiques de vos sessions
          </p>
        </div>
        <RessourceUpload />
      </header>

      <RessourcesList />
    </div>
  );
}