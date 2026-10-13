'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Building2, Globe, Mail, Phone, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Partenaire } from '@/types/partenaire.types';

interface Props {
  partenaire: Partenaire;
}

export function PartenaireDetail({ partenaire }: Props) {
  return (
    <>
      <section className="bg-odc-surface-alt border-b border-odc-border">
        <div className="container-page py-8">
          <nav className="mb-6 text-sm text-odc-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-odc-primary">
                  Accueil
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li>
                <Link href="/partenaires" className="hover:text-odc-primary">
                  Partenaires
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li className="text-odc-text-primary font-medium">{partenaire.nom}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-white dark:bg-odc-surface flex items-center justify-center overflow-hidden shadow-odc-md">
              {partenaire.logoUrl ? (
                <Image
                  src={partenaire.logoUrl}
                  alt={partenaire.nom}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              ) : (
                <Building2 className="h-10 w-10 text-odc-muted" />
              )}
            </div>

            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                {partenaire.nom}
              </h1>
              {partenaire.secteur && (
                <p className="text-odc-muted">{partenaire.secteur}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-semibold mb-4">À propos</h2>
                <p className="text-odc-secondary leading-relaxed whitespace-pre-line">
                  {partenaire.description || 'Aucune description disponible.'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display font-semibold">Contact</h3>

                {partenaire.contactEmail && (
                  <a
                    href={`mailto:${partenaire.contactEmail}`}
                    className="flex items-center gap-3 text-sm hover:text-odc-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 text-odc-primary" />
                    {partenaire.contactEmail}
                  </a>
                )}

                {partenaire.contactTel && (
                  <a
                    href={`tel:${partenaire.contactTel}`}
                    className="flex items-center gap-3 text-sm hover:text-odc-primary transition-colors"
                  >
                    <Phone className="h-4 w-4 text-odc-primary" />
                    {partenaire.contactTel}
                  </a>
                )}

                {partenaire.siteWeb && (
                  <a
                    href={partenaire.siteWeb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:text-odc-primary transition-colors"
                  >
                    <Globe className="h-4 w-4 text-odc-primary" />
                    Visiter le site
                  </a>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/partenaires">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tous les partenaires
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}