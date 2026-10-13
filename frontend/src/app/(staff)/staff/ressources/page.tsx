import type { Metadata } from 'next';
import { RessourcesList } from './components/RessourcesList';
import { RessourceUploadDialog } from './components/RessourceUploadDialog';

export const metadata: Metadata = { title: 'Ressources' };

export default function RessourcesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Ressources</h1>
          <p className="text-odc-muted mt-1">Gérez les ressources pédagogiques</p>
        </div>
        <RessourceUploadDialog />
      </header>

      <RessourcesList />
    </div>
  );
}