import type { Metadata } from 'next';
import { ProfileForm } from '@/components/shared/ProfileForm';

export const metadata: Metadata = { title: 'Mon profil' };

export default function StaffProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Mon profil</h1>
        <p className="text-odc-muted mt-1">
          Gérez vos informations personnelles et professionnelles
        </p>
      </header>
      <ProfileForm />
    </div>
  );
}