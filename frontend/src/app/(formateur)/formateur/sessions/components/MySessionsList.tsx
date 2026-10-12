'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, Users, MapPin, ArrowRight, QrCode, Clock, BookOpen,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

const STATUT_LABELS: Record<string, string> = {
  PLANIFIEE: 'Planifiée',
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

const STATUT_COLORS: Record<string, string> = {
  PLANIFIEE: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  OUVERTE: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  EN_COURS: 'bg-odc-primary-soft text-odc-primary',
  TERMINEE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  ANNULEE: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

export function MySessionsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['formateur', 'sessions'],
    queryFn: async () => {
      const { data } = await api.get('/formateur/sessions');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  const sessions = data ?? [];

  const enCours = sessions.filter((s: any) => s.statut === 'EN_COURS');
  const aVenir = sessions.filter((s: any) => ['PLANIFIEE', 'OUVERTE'].includes(s.statut));
  const passees = sessions.filter((s: any) => ['TERMINEE', 'ANNULEE'].includes(s.statut));

  const renderGrid = (list: any[]) => {
    if (!list.length) {
      return (
        <Card>
          <EmptyState
            icon={Calendar}
            title="Aucune session"
            description="Aucune session dans cette catégorie."
          />
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((s: any) => (
          <Card
            key={s.id}
            className="hover:shadow-odc-lg transition-all overflow-hidden group"
          >
            {/* Bandeau supérieur */}
            <div className="h-2 bg-gradient-to-r from-odc-500 to-odc-700" />

            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge variant="outline" className="font-mono text-xs">
                  {s.codeSession}
                </Badge>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[s.statut]}`}
                >
                  {STATUT_LABELS[s.statut]}
                </span>
              </div>

              <h3 className="font-display font-semibold mb-3 line-clamp-2 min-h-[3rem] group-hover:text-odc-primary transition-colors">
                {s.formation?.titre}
              </h3>

              <div className="space-y-2 text-sm text-odc-muted mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-odc-primary shrink-0" />
                  <span className="truncate">
                    {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-odc-primary shrink-0" />
                  <span className="truncate">{s.lieu || 'En ligne'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-odc-primary shrink-0" />
                  <span>{s.capacite} places</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/formateur/sessions/${s.id}`}>
                    Détails <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
                <Button variant="odc" size="sm" asChild>
                  <Link href={`/formateur/presences/${s.id}`} aria-label="QR présence">
                    <QrCode className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="a-venir" className="w-full">
      <TabsList>
        <TabsTrigger value="en-cours">
          En cours {enCours.length > 0 && `(${enCours.length})`}
        </TabsTrigger>
        <TabsTrigger value="a-venir">
          À venir {aVenir.length > 0 && `(${aVenir.length})`}
        </TabsTrigger>
        <TabsTrigger value="passees">
          Terminées {passees.length > 0 && `(${passees.length})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="en-cours" className="mt-6">{renderGrid(enCours)}</TabsContent>
      <TabsContent value="a-venir" className="mt-6">{renderGrid(aVenir)}</TabsContent>
      <TabsContent value="passees" className="mt-6">{renderGrid(passees)}</TabsContent>
    </Tabs>
  );
}