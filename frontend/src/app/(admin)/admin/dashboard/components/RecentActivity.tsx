// src/app/(admin)/admin/dashboard/components/RecentActivity.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  UserPlus,
  BookOpen,
  Award,
  Calendar,
  Trash2,
  Edit,
  LogIn,
  Shield,
  FileCheck,
  UserCog,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatters';
import { cn, getInitials } from '@/lib/utils';

/* ============================================================================
   CONFIGURATION PAR ACTION
   ============================================================================ */

const ACTION_CONFIG: Record<
  string,
  { icon: any; color: string; label: string; badge: string }
> = {
  'user.created': {
    icon: UserPlus,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-950',
    label: 'Nouvel utilisateur',
    badge: 'text-blue-700 bg-blue-100',
  },
  'user.updated': {
    icon: UserCog,
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-950',
    label: 'Utilisateur modifié',
    badge: 'text-amber-700 bg-amber-100',
  },
  'user.login': {
    icon: LogIn,
    color: 'text-green-600 bg-green-100 dark:bg-green-950',
    label: 'Connexion',
    badge: 'text-green-700 bg-green-100',
  },
  'formation.created': {
    icon: BookOpen,
    color: 'text-odc-primary bg-odc-primary-soft',
    label: 'Formation créée',
    badge: 'text-odc-primary bg-odc-primary-soft',
  },
  'formation.updated': {
    icon: Edit,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-950',
    label: 'Formation modifiée',
    badge: 'text-purple-700 bg-purple-100',
  },
  'formation.deleted': {
    icon: Trash2,
    color: 'text-red-600 bg-red-100 dark:bg-red-950',
    label: 'Formation supprimée',
    badge: 'text-red-700 bg-red-100',
  },
  'attestation.generated': {
    icon: Award,
    color: 'text-pink-600 bg-pink-100 dark:bg-pink-950',
    label: 'Attestation générée',
    badge: 'text-pink-700 bg-pink-100',
  },
  'session.created': {
    icon: Calendar,
    color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950',
    label: 'Session créée',
    badge: 'text-indigo-700 bg-indigo-100',
  },
  'inscription.accepted': {
    icon: FileCheck,
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950',
    label: 'Inscription acceptée',
    badge: 'text-emerald-700 bg-emerald-100',
  },
  'role.changed': {
    icon: Shield,
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-950',
    label: 'Rôle modifié',
    badge: 'text-orange-700 bg-orange-100',
  },
};

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function RecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', 'recent'],
    queryFn: async () => {
      const { data } = await api.get('/admin/audit-logs', {
        params: { limit: 8 },
      });
      return data.data;
    },
  });

  /* -------------------- Loading -------------------- */
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const logs = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Activité récente</CardTitle>
          <p className="text-sm text-odc-muted mt-1">
            Dernières actions sur la plateforme
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/audit-logs">
            Voir tout
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {logs.length === 0 ? (
          <EmptyState
            title="Aucune activité récente"
            description="Les actions apparaîtront ici"
            size="sm"
          />
        ) : (
          <ul className="space-y-1">
            {logs.map((log: any) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================================
   ACTIVITY ITEM
   ============================================================================ */

function ActivityItem({ log }: { log: any }) {
  const config = ACTION_CONFIG[log.action] ?? {
    icon: FileCheck,
    color: 'text-gray-600 bg-gray-100',
    label: log.action,
    badge: 'text-gray-700 bg-gray-100',
  };
  const Icon = config.icon;

  return (
    <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-odc-surface-alt/50 transition-colors">
      {/* Icône action */}
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
          config.color,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Contenu */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium truncate">
            {config.label}
          </p>
          <Badge
            variant="outline"
            className={cn('text-[10px] shrink-0', config.badge)}
          >
            {log.action.split('.')[0]}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-odc-muted">
          {log.user && (
            <>
              <Avatar className="h-4 w-4">
                <AvatarImage src={log.user.photoUrl} />
                <AvatarFallback className="text-[8px] bg-odc-primary-soft text-odc-primary">
                  {getInitials(log.user.nom, log.user.prenom)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {log.user.prenom} {log.user.nom}
              </span>
              <span>•</span>
            </>
          )}
          <span className="shrink-0">
            {formatRelativeTime(log.createdAt)}
          </span>
        </div>
      </div>
    </li>
  );
}