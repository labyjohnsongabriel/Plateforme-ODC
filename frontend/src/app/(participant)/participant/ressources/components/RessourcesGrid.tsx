// src/app/(participant)/participant/ressources/components/RessourcesGrid.tsx
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText,
  Video,
  Image as ImageIcon,
  Link2,
  FolderOpen,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Calendar,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatBytes, formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG PAR TYPE
   ═══════════════════════════════════════════════════════════════════════════ */

interface TypeMeta {
  icon: LucideIcon;
  label: string;
  color: string;
  bg: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  PDF: {
    icon: FileText,
    label: 'PDF',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
  },
  VIDEO: {
    icon: Video,
    label: 'Vidéo',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
  },
  IMAGE: {
    icon: ImageIcon,
    label: 'Image',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
  },
  DOCUMENT: {
    icon: FileSpreadsheet,
    label: 'Document',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  PRESENTATION: {
    icon: FileSpreadsheet,
    label: 'Présentation',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  LIEN: {
    icon: Link2,
    label: 'Lien',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
  },
};

const DEFAULT_META: TypeMeta = {
  icon: FileText,
  label: 'Fichier',
  color: 'text-slate-600 dark:text-slate-400',
  bg: 'bg-slate-100 dark:bg-slate-800',
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function RessourcesGrid() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['participant', 'ressources'],
    queryFn: async () => {
      const { data } = await api.get('/participant/ressources');
      return data.data;
    },
  });

  const telechargerMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/participant/ressources/${id}/telecharger`);
      const ressource = data?.find((r: any) => r.id === id);
      return ressource;
    },
    onSuccess: (ressource) => {
      if (ressource?.fichierUrl) {
        window.open(ressource.fichierUrl, '_blank');
      }
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Impossible de charger les ressources
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {getErrorMessage(error)}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4 h-9 rounded-lg"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} aria-hidden />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const ressources = data ?? [];

  /* ── Vide ───────────────────────────────────────────── */
  if (!ressources.length) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <EmptyState
          icon={FolderOpen}
          title="Aucune ressource"
          description="Les ressources de vos sessions apparaîtront ici."
        />
      </Card>
    );
  }

  /* ── Rendu principal ────────────────────────────────── */
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ressources.map((r: any) => {
        const meta = TYPE_META[r.type] ?? DEFAULT_META;
        const Icon = meta.icon;

        return (
          <Card
            key={r.id}
            className={cn(
              'group overflow-hidden transition-all duration-300',
              'border-slate-200 bg-white',
              'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
              'dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700',
            )}
          >
            {/* Bandeau orange */}
            <div className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-700" />

            <CardContent className="p-5">
              {/* Header */}
              <div className="mb-3 flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-110 dark:ring-slate-700',
                    meta.bg,
                    meta.color,
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-slate-900 transition-colors group-hover:text-orange-600 dark:text-slate-50 dark:group-hover:text-orange-400">
                    {r.titre}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn('text-xs font-medium', meta.bg, meta.color, 'border-transparent')}
                    >
                      {meta.label}
                    </Badge>
                    {r.session?.formation?.titre && (
                      <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {r.session.formation.titre}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {r.description && (
                <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {r.description}
                </p>
              )}

              {/* Métadonnées */}
              <div className="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-slate-400 dark:text-slate-500" aria-hidden />
                  {formatDate(r.createdAt)}
                </span>
                {r.fichierTaille != null && <span>{formatBytes(r.fichierTaille)}</span>}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 flex-1 rounded-lg font-medium"
                  onClick={() => telechargerMutation.mutate(r.id)}
                  disabled={telechargerMutation.isPending}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Ouvrir
                </Button>

                {r.type === 'LIEN' && (
                  <Button
                    variant="secondary"
                    size="icon"
                    asChild
                    className="h-9 w-9 rounded-lg"
                  >
                    <a
                      href={r.fichierUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ouvrir dans un nouvel onglet"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}