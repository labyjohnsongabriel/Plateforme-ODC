import type { Metadata } from 'next';
import { HistorySection } from './components/HistorySection';
import { ValuesSection } from './components/ValuesSection';
import { OrganigrammeSection } from './components/OrganigrammeSection';
import { TeamSection } from './components/TeamSection';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Découvrez l\'histoire, les valeurs et l\'équipe de l\'Orange Digital Center Madagascar.',
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="À propos de l'ODC"
        subtitle="Orange Digital Center Madagascar — un lieu d'innovation, de formation et d'inclusion numérique"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'À propos' },
        ]}
      />

      <div className="container-page py-16 md:py-24 space-y-24">
        <HistorySection />
        <ValuesSection />
        <OrganigrammeSection />
        <TeamSection />
      </div>
    </>
  );
}