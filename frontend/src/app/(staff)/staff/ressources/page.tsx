// src/app/(formateur)/formateur/ressources/page.tsx
import type { Metadata } from 'next';
import { RessourcesList } from '@/app/(staff)/staff/ressources/components/RessourcesList';

export const metadata: Metadata = { title: 'Ressources — Formateur' };

export default function FormateurRessourcesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <RessourcesList basePath="formateur" />
    </div>
  );
}