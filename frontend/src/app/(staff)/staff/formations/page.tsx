// src/app/(staff)/staff/formations/page.tsx
import type { Metadata } from 'next';
import { FormationsTable } from './components/FormationsTable';

export const metadata: Metadata = { title: 'Formations' };

export default function StaffFormationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <FormationsTable />
    </div>
  );
}