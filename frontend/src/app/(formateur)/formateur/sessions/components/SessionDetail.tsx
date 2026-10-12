'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Calendar, MapPin, Users, QrCode, Video, Clock,
  ClipboardCheck, FileText, FolderOpen, Award,
} from 'lucide-react';
import Link from 'next/link';
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
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>

      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-odc-500 to-odc-700 text-white p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-mono text-sm bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
              {session.codeSession}
            </span>
            <Badge className="bg-white/20 text-white hover:bg-white/30">
              {STATUT_LABELS[session.statut]}
            </Badge>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            {session.formation?.titre}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/90">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(session.dateDebut)} → {formatDate(session.dateFin)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {session.lieu || 'En ligne'}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {session.capacite} places
            </span>
          </div>
        </div>
      </section>

      {/* Actions rapides */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Button variant="odc" asChild className="justify-start">
          <Link href={`/formateur/presences/${sessionId}`}>
            <QrCode className="h-4 w-4 mr-2" /> Présence QR
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link href={`/formateur/evaluations/nouveau?sessionId=${sessionId}`}>
            <ClipboardCheck className="h-4 w-4 mr-2" /> Évaluation
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link href={`/formateur/notes?sessionId=${sessionId}`}>
            <FileText className="h-4 w-4 mr-2" /> Notes
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link href={`/formateur/ressources?sessionId=${sessionId}`}>
            <FolderOpen className="h-4 w-4 mr-2" /> Ressources
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link href={`/staff/attestations?sessionId=${sessionId}`}>
            <Award className="h-4 w-4 mr-2" /> Attestations
          </Link>
        </Button>
      </div>

      {/* Détails + Participants */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle>Détails de la session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
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
                  <Video className="h-5 w-5 text-odc-primary" />
                  <a
                    href={session.lienVisio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-odc-primary hover:underline font-medium"
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
                  <p className="text-xs text-odc-muted mb-1">Notes internes</p>
                  <p className="text-sm whitespace-pre-line">{session.notes}</p>
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
      <div className="w-9 h-9 rounded-lg bg-odc-primary-soft flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-odc-primary" />
      </div>
      <div>
        <p className="text-xs text-odc-muted">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}