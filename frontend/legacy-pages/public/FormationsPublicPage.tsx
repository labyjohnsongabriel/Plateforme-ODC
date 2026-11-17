import { BookOpen, Search, Filter } from 'lucide-react';
import { HeaderPublic } from '@/components/layout/HeaderPublic';
import { Footer } from '@/components/layout/Footer';
import { FormationList } from '@/features/formations';

export default function FormationsPublicPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderPublic />

      <main className="flex-1 bg-odc-bg-light dark:bg-odc-bg-dark py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
              Catalogue des formations
            </h1>
            <p className="text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Découvrez toutes nos formations disponibles
            </p>
          </div>

          <FormationList />
        </div>
      </main>

      <Footer />
    </div>
  );
}