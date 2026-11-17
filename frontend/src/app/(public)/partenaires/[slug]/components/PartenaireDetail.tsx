// src/app/(public)/partenaires/[slug]/components/PartenaireDetail.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Award,
  Users,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Partenaire } from '@/types/partenaire.types';
import { getMediaUrl } from '@/lib/media';

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  partenaire: Partenaire;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function PartenaireDetail({ partenaire }: Props) {
  return (
    <main className="min-h-screen">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 py-12 md:py-16">
        {/* Motif décoratif */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 80%, white 0%, transparent 40%)',
          }}
        />

        <div className="relative container-page">
          {/* ═══════ Fil d'Ariane ═══════ */}
          <nav className="mb-8 text-sm text-white/90" aria-label="Fil d'Ariane">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Accueil
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li>
                <Link
                  href="/partenaires"
                  className="transition-colors hover:text-white"
                >
                  Partenaires
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li className="font-medium text-white">{partenaire.nom}</li>
            </ol>
          </nav>

          {/* ═══════ En-tête partenaire ═══════ */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Logo */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-2xl ring-2 ring-white/40">
              {partenaire.logoUrl ? (
                <Image
                  src={getMediaUrl(partenaire.logoUrl)!}
                  alt={`Logo ${partenaire.nom}`}
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              ) : (
                <Building2 className="h-10 w-10 text-orange-500" aria-hidden />
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              {partenaire.secteur && (
                <Badge className="mb-2 bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm">
                  <Award className="mr-1 h-3 w-3" aria-hidden />
                  {partenaire.secteur}
                </Badge>
              )}
              <h1 className="font-display mb-2 text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
                {partenaire.nom}
              </h1>
              {partenaire.description && (
                <p className="max-w-2xl line-clamp-2 text-sm text-white/90 md:text-base">
                  {partenaire.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENU
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* ═══════ Colonne principale ═══════ */}
          <div className="space-y-6">
            {/* À propos */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/40">
                    <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    À propos
                  </h2>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
                  {partenaire.description || 'Aucune description disponible.'}
                </p>
              </CardContent>
            </Card>

            {/* Informations complémentaires */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display mb-4 text-lg font-semibold text-foreground">
                  Informations
                </h3>
                <div className="space-y-3 text-sm">
                  {partenaire.secteur && (
                    <div className="flex items-start gap-3">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" aria-hidden />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Secteur
                        </p>
                        <p className="mt-0.5 text-foreground">{partenaire.secteur}</p>
                      </div>
                    </div>
                  )}
                  {partenaire.createdAt && (
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" aria-hidden />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Partenaire depuis
                        </p>
                        <p className="mt-0.5 text-foreground">
                          {new Date(partenaire.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ═══════ Sidebar ═══════ */}
          <div className="space-y-4">
            {/* Contact */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Mail className="h-4 w-4 text-orange-500" aria-hidden />
                  Contact
                </h3>

                <div className="space-y-3">
                  {partenaire.contactEmail && (
                    <a
                      href={`mailto:${partenaire.contactEmail}`}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:border-orange-300 hover:bg-orange-50 dark:hover:border-orange-900 dark:hover:bg-orange-950/40"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
                      <span className="truncate">{partenaire.contactEmail}</span>
                    </a>
                  )}

                  {partenaire.contactTel && (
                    <a
                      href={`tel:${partenaire.contactTel.replace(/\s/g, '')}`}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:border-orange-300 hover:bg-orange-50 dark:hover:border-orange-900 dark:hover:bg-orange-950/40"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
                      <span>{partenaire.contactTel}</span>
                    </a>
                  )}

                  {partenaire.siteWeb && (
                    <a
                      href={partenaire.siteWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/60"
                    >
                      <Globe className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="flex-1">Visiter le site</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  )}

                  {!partenaire.contactEmail &&
                    !partenaire.contactTel &&
                    !partenaire.siteWeb && (
                      <p className="text-sm italic text-muted-foreground">
                        Aucun contact disponible.
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Bouton retour */}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/partenaires">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                Tous les partenaires
              </Link>
            </Button>

            {/* Appel à partenariat */}
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-900 dark:from-orange-950/40 dark:to-amber-950/30">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
                  <Users className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display mb-2 text-base font-semibold text-foreground">
                  Devenir partenaire
                </h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Rejoignez notre réseau de partenaires engagés.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Link href="/contact">Nous contacter</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}