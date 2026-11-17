import type { Metadata } from 'next';
import { AttestationVerifier } from '../components/AttestationVerifier';
import { PageHero } from '@/components/shared/PageHero';

interface Props {
  params: { numero: string };
}

export const metadata: Metadata = {
  title: "Vérification d'attestation",
};

export default function VerifierNumeroPage({ params }: Props) {
  return (
    <>
      <PageHero
        title={`Attestation ${params.numero}`}
        description="Résultat de la vérification de l'authenticité et du statut."
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Vérifier', href: '/verifier-attestation' },
          { label: params.numero },
        ]}
      />
      <div className="container-page max-w-3xl py-12">
        <AttestationVerifier numero={params.numero} />
      </div>
    </>
  );
}
