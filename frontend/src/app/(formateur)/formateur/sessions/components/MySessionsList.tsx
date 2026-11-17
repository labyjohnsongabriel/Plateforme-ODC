// src/app/(formateur)/formateur/sessions/components/MySessionsList.tsx
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  QrCode,
  Clock,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Session {
  id: string;
  codeSession: string;
  dateDebut: string;
  dateFin: string;
  lieu?: string | null;
  capacite: number;
  statut: string;
  presenceOuverte?: boolean;
  formation?: { titre: string } | null;
}

/**
 * Statuts — couleurs sémantiques avec variantes dark explicites.
 * Pattern : bg-*-50 text-*-700 ring-*-200 (light) / bg-*-500/10 text-*-300 (dark).
 */
const STATUT_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  PLANIFIEE: {
    label: 'Planifiée',
    className:
      'bg-sky-50 text-sky-700 ring-sky-200 ' +
      'dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
    icon: Clock,
  },
  OUVERTE: {
    label: 'Ouverte',
    className:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 ' +
      'dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    icon: CheckCircle2,
  },
  EN_COURS: {
    label: 'En cours',
    className:
      'bg-amber-50 text-amber-700 ring-amber-200 ' +
      'dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    icon: PlayCircle,
  },
  TERMINEE: {
    label: 'Terminée',
    className: 'bg-muted text-muted-foreground ring-border',
    icon: CheckCircle2,
  },
  ANNULEE: {
    label: 'Annulée',
    className:
      'bg-red-50 text-red-700 ring-red-200 ' +
      'dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
    icon: XCircle,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER — Filtre sûr
   ═══════════════════════════════════════════════════════════════════════════ */

function toSafeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value.filter((v) => v !== null && v !== undefined) as T[];
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT CARTE
   ═══════════════════════════════════════════════════════════════════════════ */

function SessionCard({ session }: { session: Session }) {
  const statutConfig = STATUT_CONFIG[session.statut] ?? STATUT_CONFIG.PLANIFIEE;
  const StatutIcon = statutConfig.icon;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lg hover:border-primary/30',
      )}
    >
      {/* Bandeau gradient top — tokens primary */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60"
      />

      <div className="p-5 pt-6">
        {/* Header : code + statut */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <Badge variant="outline" className="font-mono text-[11px] tracking-wide">
            {session.codeSession}
          </Badge>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1',
              statutConfig.className,
            )}
          >
            <StatutIcon className="h-3 w-3" aria-hidden="true" />
            {statutConfig.label}
          </span>
        </div>

        {/* Titre */}
        <h3 className="mb-3 line-clamp-2 min-h-[3rem] font-display font-semibold text-foreground transition-colors group-hover:text-primary">
          {session.formation?.titre ?? 'Session de formation'}
        </h3>

        {/* Métadonnées */}
        <div className="mb-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">
              {formatDate(session.dateDebut)} → {formatDate(session.dateFin)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{session.lieu || 'En ligne'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span>{session.capacite} places</span>
          </div>
        </div>

        {/* Badge présences ouvertes */}
        {session.presenceOuverte && (
          <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              Présences ouvertes
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/formateur/sessions/${session.id}`}>
              Détails
              <ArrowRight
                className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-primary text-primary-foreground px-3 hover:bg-primary/90"
          >
            <Link
              href={`/formateur/presences/${session.id}`}
              aria-label="Gérer les présences"
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function MySessionsList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['formateur', 'sessions'],
    queryFn: async () => {
      const { data } = await api.get('/formateur/sessions');
      /* 🔍 DIAGNOSTIC — décommentez pour vérifier */
      // console.log('Sessions raw:', data);
      return toSafeArray<Session>(data?.data);
    },
  });

  /* ─── Séparer par statut ─── */
  const { enCours, aVenir, passees } = useMemo(() => {
    const sessions = data ?? [];
    return {
      enCours: sessions.filter((s) => s.statut === 'EN_COURS'),
      aVenir: sessions.filter((s) =>
        ['PLANIFIEE', 'OUVERTE'].includes(s.statut),
      ),
      passees: sessions.filter((s) =>
        ['TERMINEE', 'ANNULEE'].includes(s.statut),
      ),
    };
  }, [data]);

  /* ══════════════════════════════════════════════════════════════════════════
     RENDU — Chargement
     ══════════════════════════════════════════════════════════════════════════ */
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     RENDU — Erreur
     ══════════════════════════════════════════════════════════════════════════ */
  if (isError) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
          <p className="font-semibold text-foreground">
            Impossible de charger vos sessions
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Vérifiez votre connexion et réessayez.
          </p>
        </div>
      </Card>
    );
  }

  const allSessions = data ?? [];

  /* ══════════════════════════════════════════════════════════════════════════
     RENDU — Aucune session
     ══════════════════════════════════════════════════════════════════════════ */
  if (allSessions.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState
          icon={BookOpen}
          title="Aucune session"
          description="Vous n'avez pas encore de session assignée."
        />
      </Card>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     HELPER — Grille
     ══════════════════════════════════════════════════════════════════════════ */
  const renderGrid = (list: Session[]) => {
    if (!list.length) {
      return (
        <Card className="p-8">
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
        {list.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════════════════════
     RENDU PRINCIPAL
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    <Tabs defaultValue="a-venir" className="w-full">
      <TabsList className="inline-flex h-11 w-full justify-start gap-1 rounded-xl bg-muted p-1 sm:w-auto">
        <TabsTrigger
          value="en-cours"
          className={cn(
            'rounded-lg px-4 py-1.5 text-sm font-medium',
            'data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm',
          )}
        >
          <PlayCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />
          En cours
          {enCours.length > 0 && (
            <Badge className="ml-1.5 h-5 bg-primary/10 px-1.5 text-[10px] text-primary">
              {enCours.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="a-venir"
          className={cn(
            'rounded-lg px-4 py-1.5 text-sm font-medium',
            'data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm',
          )}
        >
          <Calendar className="mr-1.5 h-4 w-4" aria-hidden="true" />
          À venir
          {aVenir.length > 0 && (
            <Badge className="ml-1.5 h-5 bg-primary/10 px-1.5 text-[10px] text-primary">
              {aVenir.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="passees"
          className={cn(
            'rounded-lg px-4 py-1.5 text-sm font-medium',
            'data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm',
          )}
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Terminées
          {passees.length > 0 && (
            <Badge className="ml-1.5 h-5 bg-primary/10 px-1.5 text-[10px] text-primary">
              {passees.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="en-cours" className="mt-6">
        {renderGrid(enCours)}
      </TabsContent>
      <TabsContent value="a-venir" className="mt-6">
        {renderGrid(aVenir)}
      </TabsContent>
      <TabsContent value="passees" className="mt-6">
        {renderGrid(passees)}
      </TabsContent>
    </Tabs>
  );
}