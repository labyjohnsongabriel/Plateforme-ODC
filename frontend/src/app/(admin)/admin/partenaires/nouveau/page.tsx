// nouveau/page.tsx
import type { Metadata } from 'next';
import { PartnerForm } from '../components/PartnerForm';

export const metadata: Metadata = { title: 'Nouveau partenaire' };

export default function NewPartnerPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-bold">
        Nouveau partenaire
      </h1>
      <PartnerForm mode="create" />
    </div>
  );
}