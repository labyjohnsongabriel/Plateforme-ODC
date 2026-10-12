// [id]/page.tsx
import type { Metadata } from 'next';
import { PartnerForm } from '../components/PartnerForm';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: 'Modifier partenaire' };

export default function EditPartnerPage({ params }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-bold">
        Modifier le partenaire
      </h1>
      <PartnerForm mode="edit" id={params.id} />
    </div>
  );
}