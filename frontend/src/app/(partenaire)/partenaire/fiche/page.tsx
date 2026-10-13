import type { Metadata } from 'next';
import { PartenaireForm } from './components/PartenaireForm';

export const metadata: Metadata = { title: 'Ma fiche' };

export default function FichePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Ma fiche</h1>
        <p className="text-odc-muted mt-1">
          Gérez les informations publiques de votre organisation
        </p>
      </header>
      <PartenaireForm />
    </div>
  );
}