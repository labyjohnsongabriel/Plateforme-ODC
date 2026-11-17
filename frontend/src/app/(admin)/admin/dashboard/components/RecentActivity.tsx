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
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface AuditLog {
  id: string;
  action: string;
  createdAt: string;
  user?: {
    nom?: string | null;
    prenom?: string | null;
    photoUrl?: string | null;
  } | null;
}

type ActionConfig = {
  icon: LucideIcon;
  color: string;
  label: string;
  badge: string;
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION DES ACTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const ACTION_CONFIG: Record<string, ActionConfig> = {
  'user.created': {
    icon: UserPlus,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
    label: 'Nouvel utilisateur',
    badge: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-500/10 dark:border-blue-500/30',
  },
  'user.updated': {
    icon: UserCog,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400',
    label: 'Utilisateur modifié',
    badge: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30',
  },
  'user.login': {
    icon: LogIn,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
    label: 'Connexion',
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  },
  'formation.created': {
    icon: BookOpen,
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400',
    label: 'Formation créée',
    badge: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-500/10 dark:border-orange-500/30',
  },
  'formation.updated': {
    icon: Edit,
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400',
    label: 'Formation modifiée',
    badge: 'text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-300 dark:bg-violet-500/10 dark:border-violet-500/30',
  },
  'formation.deleted': {
    icon: Trash2,
    color: 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400',
    label: 'Formation supprimée',
    badge: 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/30',
  },
  'attestation.generated': {
    icon: Award,
    color: 'text-pink-600 bg-pink-50 dark:bg-pink-500/10 dark:text-pink-400',
    label: 'Attestation générée',
    badge: 'text-pink-700 bg-pink-50 border-pink-200 dark:text-pink-300 dark:bg-pink-500/10 dark:border-pink-500/30',
  },
  'session.created': {
    icon: Calendar,
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400',
    label: 'Session créée',
    badge: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-500/10 dark:border-indigo-500/30',
  },
  'inscription.accepted': {
    icon: FileCheck,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
    label: 'Inscription acceptée',
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  },
  'role.changed': {
    icon: Shield,
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400',
    label: 'Rôle modifié',
    badge: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-500/10 dark:border-orange-500/30',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function RecentActivity() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<AuditLog[]>({
    queryKey: ['admin', 'audit-logs', 'recent'],
    queryFn: async () => {
      const { data } = await api.get('/admin/audit-logs', {
        params: { limit: 8 },
      });
      return data.data;
    },
  });

  /* ── Loading ─────────────────────────────────────────── */
  if (isLoading) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader>
          <CardTitle className="text-base text-slate-900 dark:text-slate-50">
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QueryErrorState
            onRetry={() => {
              void refetch();
            }}
            isRetrying={isFetching}
          />
        </CardContent>
      </Card>
    );
  }

  const logs = data ?? [];

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base text-slate-900 dark:text-slate-50">
            Activité récente
          </CardTitle>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Dernières actions sur la plateforme
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/admin/audit-logs"
            className="text-slate-500 hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
          >
            Voir tout
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
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
            {logs.map((log) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACTIVITY ITEM
   ═══════════════════════════════════════════════════════════════════════════ */

function ActivityItem({ log }: { log: AuditLog }) {
  const config = ACTION_CONFIG[log.action] ?? {
    icon: FileCheck,
    color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
    label: log.action,
    badge: 'text-slate-500 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700',
  };
  const Icon = config.icon;

  const hasUser = log.user && (log.user.prenom || log.user.nom);

  return (
    <li className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
      {/* Icône action */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          config.color,
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Contenu */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
            {config.label}
          </p>
          <Badge
            variant="outline"
            className={cn('shrink-0 text-[10px] font-medium', config.badge)}
          >
            {log.action.split('.')[0]}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {hasUser && (
            <>
              <UserAvatar
                user={{
                  prenom: log.user?.prenom ?? undefined,
                  nom: log.user?.nom ?? undefined,
                  photoUrl: log.user?.photoUrl ?? null,
                }}
                size="sm"
                className="!h-5 !w-5 !text-[8px]"
              />
              <span className="truncate">
                {log.user?.prenom} {log.user?.nom}
              </span>
              <span aria-hidden>•</span>
            </>
          )}
          <span className="shrink-0 tabular-nums">
            {formatRelativeTime(log.createdAt)}
          </span>
        </div>
      </div>
    </li>
  );
}