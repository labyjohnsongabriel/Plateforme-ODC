// src/app/(participant)/participant/reseau/profil/[id]/page.tsx
import type { Metadata } from 'next';
import { ProfileDetail } from './components/ProfileDetail';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: 'Profil — Réseau' };

export default function ProfilePage({ params }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <ProfileDetail userId={params.id} />
    </div>
  );
}