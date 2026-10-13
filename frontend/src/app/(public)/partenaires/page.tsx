import type { Metadata } from 'next';
import { PartenairesGrid } from './components/PartenairesGrid';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'Nos partenaires',
  description: "Découvrez les partenaires de l'Orange Digital Center Madagascar.",
};

export default function PartenairesPage() {
  return (
    <>
      <PageHero
        title="Nos partenaires"
        subtitle="Ils nous accompagnent dans notre mission d'inclusion numérique"
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Partenaires' }]}
      />
      <div className="container-page py-12">
        <PartenairesGrid />
      </div>
    </>
  );
}