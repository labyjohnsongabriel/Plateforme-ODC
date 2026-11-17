// src/app/(staff)/staff/notes/page.tsx
import type { Metadata } from 'next';
import { StaffNotesContent } from './components/StaffNotesContent';

export const metadata: Metadata = { title: 'Notes — Staff' };

export default function StaffNotesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <StaffNotesContent />
    </div>
  );
}