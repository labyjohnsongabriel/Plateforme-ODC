import type { Metadata } from 'next';
import { PublicInscriptionForm } from './components/PublicInscriptionForm';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'Inscription en ligne',
  description:
    "Inscrivez-vous en ligne à une formation de l'Orange Digital Center Madagascar.",
};

export default function InscriptionEnLignePage() {
  return (
    <>
      <PageHero
        title="Inscription en ligne"
        subtitle="Remplissez le formulaire pour vous inscrire à une session de formation"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Inscription en ligne' },
        ]}
      />
      <div className="container-page py-12 max-w-3xl">
        <PublicInscriptionForm />
      </div>
    </>
  );
}