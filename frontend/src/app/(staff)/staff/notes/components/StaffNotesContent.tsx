// src/app/(staff)/staff/notes/components/StaffNotesContent.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { NotesSaisieTable } from '@/app/(formateur)/formateur/evaluations/components/NotesSaisieTable';
import { NotesTable } from './NotesTable';

/**
 * Contenu des notes côté Staff :
 * - Si `evaluationId` présent dans l'URL → formulaire de saisie (NotesSaisieTable)
 * - Sinon → liste des notes saisies (NotesTable)
 */
export function StaffNotesContent() {
  const searchParams = useSearchParams();
  const evaluationId = searchParams.get('evaluationId');

  if (evaluationId) {
    return (
      <NotesSaisieTable
        evaluationId={evaluationId}
        basePath="staff"
      />
    );
  }

  return <NotesTable />;
}