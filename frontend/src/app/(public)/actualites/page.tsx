import type { Metadata } from 'next';
import { NewsFeed } from './components/NewsFeed';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'Actualités',
  description:
    "Suivez l'actualité de l'Orange Digital Center Madagascar — événements, partenariats, réussites.",
};

export default function ActualitesPage() {
  return (
    <>
      <PageHero
        title="Actualités"
        subtitle="Événements, partenariats et actualités de l'ODC"
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Actualités' }]}
      />
      <div className="container-page py-12">
        <NewsFeed />
      </div>
    </>
  );
}