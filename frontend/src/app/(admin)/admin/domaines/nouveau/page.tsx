// src/app/(admin)/admin/domaines/nouveau/page.tsx
import type { Metadata } from 'next';
import { DomaineForm } from '../components/DomaineForm';

export const metadata: Metadata = { title: 'Nouveau domaine' };

export default function NewDomainePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-bold">
        Nouveau domaine
      </h1>
      <DomaineForm mode="create" />
    </div>
  );
}