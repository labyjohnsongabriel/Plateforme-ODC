import type { Metadata } from 'next';
import { ContactForm } from './components/ContactForm';
import { ContactInfo } from './components/ContactInfo';
import { ContactMap } from './components/ContactMap';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Contactez l'Orange Digital Center Madagascar — formulaire, email, téléphone, adresse.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contactez-nous"
        subtitle="Une question ? Un projet ? Nous sommes là pour vous accompagner"
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Contact' }]}
      />

      <div className="container-page py-12">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ContactForm />
          <ContactInfo />
        </div>

        <ContactMap />
      </div>
    </>
  );
}