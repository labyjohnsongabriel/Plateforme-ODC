// src/app/(formateur)/formateur/ressources/page.tsx
import type { Metadata } from 'next';
import { RessourceUpload } from './components/RessourceUpload';
import { RessourcesList } from '@/app/(staff)/staff/ressources/components/RessourcesList';

export const metadata: Metadata = { title: 'Ressources — Formateur' };

export default function FormateurRessourcesPage() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* En-tête de page */}
      <header className="flex flex-wrap items-start justify-between gap-4">
      </header>

      {/* Liste (déjà neutre) */}
      <RessourcesList basePath="formateur" />
    </div>
  );
}