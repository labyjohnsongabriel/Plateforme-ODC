import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormationForm } from '../components/FormationForm';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Nouvelle formation',
  description: 'Créer une nouvelle formation ODC',
};

export default function NouvelleFormationPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d'Ariane" className="text-sm text-odc-muted">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href={ROUTES.admin.dashboard}
              className="hover:text-odc-primary transition-colors"
            >
              Admin
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={ROUTES.admin.formations}
              className="hover:text-odc-primary transition-colors"
            >
              Formations
            </Link>
          </li>
          <li>/</li>
          <li className="text-odc-text-primary font-medium">Nouvelle</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-odc-primary-soft flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6 text-odc-primary" />
          </div>

          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-odc-text-primary">
              Nouvelle formation
            </h1>
            <p className="text-odc-muted mt-1">
              Créez une formation pour le catalogue ODC
            </p>
          </div>
        </div>

        <Button variant="outline" asChild>
          <Link href={ROUTES.admin.formations}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Link>
        </Button>
      </div>

      {/* Formulaire */}
      <FormationForm mode="create" />
    </div>
  );
}