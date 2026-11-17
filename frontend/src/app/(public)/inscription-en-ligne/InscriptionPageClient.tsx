'use client';

import { useRouter } from 'next/navigation';
import { PublicInscriptionForm } from './components/PublicInscriptionForm';

export function InscriptionPageClient() {
  const router = useRouter();

  return (
    <PublicInscriptionForm
      onClose={() => router.push('/formations')}
    />
  );
}