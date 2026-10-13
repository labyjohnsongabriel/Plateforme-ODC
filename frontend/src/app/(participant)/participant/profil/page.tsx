import type { Metadata } from 'next';
import { ProfileCard } from './components/ProfileCard';
import { ProfileForm } from './components/ProfileForm';
import { VisibilityToggle } from './components/VisibilityToggle';

export const metadata: Metadata = { title: 'Mon profil' };

export default function ParticipantProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Mon profil</h1>
        <p className="text-odc-muted mt-1">
          Gérez vos informations personnelles et votre visibilité
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <ProfileCard />
          <VisibilityToggle />
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}