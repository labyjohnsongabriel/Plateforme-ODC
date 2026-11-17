import type { Metadata } from 'next';
import { AttestationVerifier } from './components/AttestationVerifier';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'Vérifier une attestation',
  description:
    "Vérifiez l'authenticité d'une attestation de formation délivrée par l'ODC.",
};

export default function VerifierAttestationPage() {
  return (
    <>
      <PageHero
        title="Vérification d'attestation"
        description="Saisissez le numéro pour vérifier l'authenticité d'une attestation."
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Vérifier une attestation' },
        ]}
      />
      <div className="container-page max-w-3xl py-12">
        <AttestationVerifier />
      </div>
    </>
  );
}
