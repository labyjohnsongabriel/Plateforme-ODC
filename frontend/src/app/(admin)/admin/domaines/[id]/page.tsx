// src/app/(admin)/admin/domaines/[id]/page.tsx
import type { Metadata } from 'next';
import { DomaineForm } from '../components/DomaineForm';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: 'Modifier domaine' };

export default function EditDomainePage({ params }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-bold">
        Modifier le domaine
      </h1>
      <DomaineForm mode="edit" id={params.id} />
    </div>
  );
}