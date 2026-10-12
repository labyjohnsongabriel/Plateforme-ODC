'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight, ChevronRight, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/formatters';
import type { Session } from '@/types/session.types';

const STATUT_LABELS: Record<string, string> = {
  PLANIFIEE: 'Planifiée',
  OUVERTE: 'Inscriptions ouvertes',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

interface Props {
  session: Session;
}

export function SessionDetail({ session }: Props) {
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
                <Link href="/sessions" className="hover:text-odc-primary">
                  Sessions
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li className="text-odc-text-primary font-medium">
                {session.codeSession}
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-mono text-sm text-odc-muted mb-2">
                {session.codeSession}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
                {session.formation?.titre}
              </h1>
              <Badge variant="outline" className="text-sm">
                {STATUT_LABELS[session.statut]}
              </Badge>
            </div>

            <Button variant="odc" size="lg" asChild>
              <Link href={`/inscription-en-ligne?session=${session.id}`}>
                S&apos;inscrire à cette session
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de la session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-odc-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-odc-muted">Début</p>
                      <p className="font-medium">{formatDate(session.dateDebut)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-odc-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-odc-muted">Fin</p>
                      <p className="font-medium">{formatDate(session.dateFin)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-odc-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-odc-muted">Lieu</p>
                      <p className="font-medium">{session.lieu || 'En ligne'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center">
                      <Users className="h-5 w-5 text-odc-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-odc-muted">Capacité</p>
                      <p className="font-medium">{session.capacite} places</p>
                    </div>
                  </div>
                </div>

                {session.lienVisio && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-odc-primary" />
                      <a
                        href={session.lienVisio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-odc-primary hover:underline font-medium"
                      >
                        Lien de la visioconférence
                      </a>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 self-start">
            {session.formateur && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Formateur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-odc-500 to-odc-700 flex items-center justify-center text-white font-bold">
                      {session.formateur.prenom?.charAt(0)}
                      {session.formateur.nom?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {session.formateur.prenom} {session.formateur.nom}
                      </p>
                      <p className="text-xs text-odc-muted">
                        {session.formateur.poste || 'Formateur ODC'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </>
  );
}