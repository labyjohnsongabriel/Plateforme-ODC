'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Clock, BarChart3, Users, BookOpen, Target, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionList } from './SessionList';
import { InscriptionCta } from './InscriptionCta';
import type { Formation } from '@/types/formation.types';

const NIVEAU_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
};

interface Props {
  formation: Formation;
}

export function FormationDetail({ formation }: Props) {
  const imageSrc = formation.imageUrl || '/images/formations/placeholder.jpg';

  return (
    <>
      <section className="bg-odc-surface-alt border-b border-odc-border">
        <div className="container-page py-8">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-odc-muted">
              <li>
                <Link href="/" className="hover:text-odc-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li>
                <Link
                  href="/formations"
                  className="hover:text-odc-primary transition-colors"
                >
                  Formations
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li className="text-odc-text-primary font-medium truncate max-w-xs">
                {formation.titre}
              </li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-odc-primary text-white">
                  {formation.domaineRelation?.nom ?? formation.domaine}
                </Badge>
                <Badge variant="outline">{NIVEAU_LABELS[formation.niveau]}</Badge>
                {formation.prix === 0 && (
                  <Badge className="bg-green-600 text-white">Gratuit</Badge>
                )}
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {formation.titre}
              </h1>

              <p className="text-lg text-odc-secondary leading-relaxed mb-6">
                {formation.description}
              </p>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center">
                    <Clock className="h-5 w-5 text-odc-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-odc-muted">Durée</p>
                    <p className="font-semibold">{formation.dureeHeures}h</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-odc-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-odc-muted">Niveau</p>
                    <p className="font-semibold">{NIVEAU_LABELS[formation.niveau]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center">
                    <Users className="h-5 w-5 text-odc-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-odc-muted">Places max</p>
                    <p className="font-semibold">{formation.nbParticipantsMax}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <InscriptionCta formation={formation} />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div>
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8 bg-odc-surface-alt">
              <Image
                src={imageSrc}
                alt={formation.titre}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="programme">Programme</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-6">
                {formation.objectifs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-odc-primary" />
                        Objectifs pédagogiques
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-odc-secondary">
                        {formation.objectifs}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {formation.prerequis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-odc-primary" />
                        Prérequis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-odc-secondary">
                        {formation.prerequis}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="programme">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-odc-primary" />
                      Programme détaillé
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formation.programme ? (
                      <p className="whitespace-pre-line text-odc-secondary leading-relaxed">
                        {formation.programme}
                      </p>
                    ) : (
                      <p className="text-odc-muted italic">
                        Programme en cours de finalisation.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions">
                <SessionList formationId={formation.id} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:hidden">
            <InscriptionCta formation={formation} />
          </div>
        </div>
      </section>
    </>
  );
}