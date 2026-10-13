import type { Metadata } from 'next';
import { DomainesGrid } from './components/DomainesGrid';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'Domaines de formation',
  description:
    "Explorez les domaines de formation proposés par l'Orange Digital Center Madagascar.",
};

export default function DomainesPage() {
  return (
    <>
      <PageHero
        title="Domaines de formation"
        subtitle="Développement, data, design, cybersécurité, entrepreneuriat — trouvez votre voie"
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Domaines' }]}
      />
      <div className="container-page py-12">
        <DomainesGrid />
      </div>
    </>
  );
}