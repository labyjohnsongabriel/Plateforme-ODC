// src/app/(formateur)/formateur/sessions/[id]/SessionDetail.tsx
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  QrCode,
  Video,
  Clock,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { ParticipantsList } from './ParticipantsList';

const STATUT_LABELS: Record<string, string> = {
  PLANIFIEE: 'Planifiée',
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

/**
 * Statuts — couleurs sémantiques avec dark.
 * Pattern : bg-*-50 text-*-700 (light) / bg-*-500/10 text-*-300 (dark).
 */
const STATUT_COLORS: Record<string, string> = {
  PLANIFIEE:
    'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
  OUVERTE:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
  EN_COURS:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
  TERMINEE: 'bg-muted text-muted-foreground ring-border',
  ANNULEE:
    'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
};

export function SessionDetail({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  const { data: session, isLoading } = useQuery({
    queryKey: ['formateur', 'session', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/sessions/${sessionId}`);
      return data.data;
    },
  });

  if (isLoading || !session) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Retour
      </Button>

      {/* Hero — gradient sur --primary (light + dark) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground shadow-md ring-1 ring-primary/20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary-foreground/15 px-3 py-1 font-mono text-sm backdrop-blur-sm">
              {session.codeSession}
            </span>
            <Badge
              variant="outline"
              className="border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
            >
              {STATUT_LABELS[session.statut]}
            </Badge>
          </div>
          <h1 className="mb-3 font-display text-3xl font-bold leading-tight md:text-4xl">
            {session.formation?.titre}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-primary-foreground/90">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {formatDate(session.dateDebut)} → {formatDate(session.dateFin)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />{' '}
              {session.lieu || 'En ligne'}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden="true" /> {session.capacite} places
            </span>
          </div>
        </div>
      </section>

      {/* Actions rapides */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Button asChild className="justify-start bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={`/formateur/presences/${sessionId}`}>
            <QrCode className="mr-2 h-4 w-4" aria-hidden="true" /> Présence QR
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link href={`/formateur/evaluations/nouveau?sessionId=${sessionId}`}>
            <ClipboardCheck className="mr-2 h-4 w-4" aria-hidden="true" /> Évaluation
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link href={`/formateur/notes?sessionId=${sessionId}`}>
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" /> Notes
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link href={`/formateur/ressources?sessionId=${sessionId}`}>
            <FolderOpen className="mr-2 h-4 w-4" aria-hidden="true" /> Ressources
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link href={`/staff/attestations?sessionId=${sessionId}`}>
            <Award className="mr-2 h-4 w-4" aria-hidden="true" /> Attestations
          </Link>
        </Button>
      </div>

      {/* Détails + Participants */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Détails de la session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={Calendar} label="Début" value={formatDate(session.dateDebut)} />
              <InfoItem icon={Calendar} label="Fin" value={formatDate(session.dateFin)} />
              <InfoItem icon={MapPin} label="Lieu" value={session.lieu || 'En ligne'} />
              <InfoItem icon={Users} label="Capacité" value={`${session.capacite} places`} />
              <InfoItem icon={Clock} label="Statut" value={STATUT_LABELS[session.statut]} />
            </div>

            {session.lienVisio && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-primary" aria-hidden="true" />
                  <a
                    href={session.lienVisio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Rejoindre la visioconférence
                  </a>
                </div>
              </>
            )}

            {session.notes && (
              <>
                <Separator />
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Notes internes</p>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {session.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <ParticipantsList sessionId={sessionId} />
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 dark:bg-primary/15">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}