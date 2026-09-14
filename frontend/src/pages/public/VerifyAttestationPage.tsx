import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { HeaderPublic } from '@/components/layout/HeaderPublic';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/common/Button';
import { AttestationVerify } from '@/features/attestations';

export default function VerifyAttestationPage() {
  const { numero } = useParams<{ numero: string }>();

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderPublic />

      <main className="flex-1 bg-odc-bg-light dark:bg-odc-bg-dark py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <Link to="/">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} className="mb-6">
              Retour à l'accueil
            </Button>
          </Link>

          <AttestationVerify />
        </div>
      </main>

      <Footer />
    </div>
  );
}