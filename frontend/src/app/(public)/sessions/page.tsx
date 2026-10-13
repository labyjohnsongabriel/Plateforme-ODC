import type { Metadata } from 'next';
import { SessionsList } from './components/SessionsList';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'Planning des sessions',
  description: 'Découvrez toutes les sessions de formation programmées à venir.',
};

export default function SessionsPage() {
  return (
    <>
      <PageHero
        title="Planning des sessions"
        subtitle="Toutes les prochaines sessions de formation ODC — inscrivez-vous dès maintenant"
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Sessions' }]}
      />
      <div className="container-page py-12">
        <SessionsList />
      </div>
    </>
  );
}