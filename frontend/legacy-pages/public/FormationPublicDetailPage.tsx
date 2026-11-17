import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { HeaderPublic } from '@/components/layout/HeaderPublic';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/common/Button';
import { FormationDetail } from '@/features/formations';

export default function FormationPublicDetailPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderPublic />

      <main className="flex-1 bg-odc-bg-light dark:bg-odc-bg-dark py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <Link to="/formations-public">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} className="mb-6">
              Retour au catalogue
            </Button>
          </Link>

          <FormationDetail />
        </div>
      </main>

      <Footer />
    </div>
  );
}