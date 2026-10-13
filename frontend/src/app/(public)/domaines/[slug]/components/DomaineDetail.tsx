'use client';

import Link from 'next/link';
import { ChevronRight, FolderTree, ArrowLeft } from 'lucide-react';
import { FormationCard } from '../../../formations/components/FormationCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import type { Domaine } from '@/types/formation.types';

interface Props {
  domaine: Domaine;
}

export function DomaineDetail({ domaine }: Props) {
  const formations = domaine.formations ?? [];

  return (
    <>
      <section className="bg-gradient-to-br from-odc-500 to-odc-700 text-white py-16">
        <div className="container-page">
          <nav className="mb-6 text-sm text-white/80">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Accueil
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li>
                <Link href="/domaines" className="hover:text-white">
                  Domaines
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li className="text-white font-medium">{domaine.nom}</li>
            </ol>
          </nav>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {domaine.nom}
          </h1>

          {domaine.description && (
            <p className="text-lg text-white/90 max-w-3xl">{domaine.description}</p>
          )}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold mb-1">
              Formations dans ce domaine
            </h2>
            <p className="text-sm text-odc-muted">
              {formations.length} formation{formations.length > 1 ? 's' : ''}{' '}
              disponible{formations.length > 1 ? 's' : ''}
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/domaines">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Tous les domaines
            </Link>
          </Button>
        </div>

        {formations.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="Aucune formation dans ce domaine"
            description="Revenez bientôt pour découvrir les nouvelles formations."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((f, i) => (
              <FormationCard
                key={f.id}
                formation={f}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}