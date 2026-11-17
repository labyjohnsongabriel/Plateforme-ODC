// src/app/(staff)/staff/ressources/components/RessourcesList.tsx
'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText, Video, Image as ImageIcon, Link2, FolderOpen,
  FileSpreadsheet, Presentation, ExternalLink, Trash2, Loader2,
  Download, Filter, RefreshCw, AlertCircle, Search, X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/shared/EmptyState';
import { RessourceUploadDialog } from './RessourceUploadDialog';
import { api } from '@/lib/api';
import { formatBytes, formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type ResourceType = 'PDF' | 'VIDEO' | 'IMAGE' | 'LIEN' | 'DOCUMENT' | 'PRESENTATION';

interface Ressource {
  id: string;
  titre: string;
  description?: string | null;
  type: ResourceType | string;
  fichierUrl?: string | null;
  fichierTaille?: number | null;
  url?: string | null;
  createdAt: string;
  sessionId?: string;
  session?: {
    codeSession: string;
    formation?: { titre: string } | null;
  } | null;
}

interface Props {
  basePath?: 'staff' | 'formateur';
  sessionId?: string;
}

interface TypeMeta {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG PAR TYPE
   ═══════════════════════════════════════════════════════════════════════════ */

const TYPE_META: Record<string, TypeMeta> = {
  PDF: {
    icon: FileText,
    label: 'PDF',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-500/10',
  },
  VIDEO: {
    icon: Video,
    label: 'Vidéo',
    color: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
  },
  IMAGE: {
    icon: ImageIcon,
    label: 'Image',
    color: 'text-violet-700 dark:text-violet-300',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
  },
  DOCUMENT: {
    icon: FileSpreadsheet,
    label: 'Document',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  PRESENTATION: {
    icon: Presentation,
    label: 'Présentation',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  LIEN: {
    icon: Link2,
    label: 'Lien',
    color: 'text-primary',
    bg: 'bg-primary/10 dark:bg-primary/15',
  },
};

const DEFAULT_META: TypeMeta = {
  icon: FileText,
  label: 'Fichier',
  color: 'text-muted-foreground',
  bg: 'bg-muted',
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractRessources(data: unknown): Ressource[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Ressource[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['ressources', 'data', 'items', 'results']) {
      const arr = obj[key];
      if (Array.isArray(arr)) return arr as Ressource[];
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   SQUELETTE
   ═══════════════════════════════════════════════════════════════════════════ */

function ListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function RessourcesList({ basePath = 'staff', sessionId }: Props) {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Ressource | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* ─── Query ─── */
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<Ressource[]>({
    queryKey: [basePath, 'ressources', sessionId],
    queryFn: async () => {
      const response = await api.get(`/${basePath}/ressources`, {
        params: {
          limit: 200,
          ...(sessionId ? { sessionId } : {}),
        },
      });
      return extractRessources(response.data?.data ?? response.data);
    },
    staleTime: 30_000,
    retry: 1,
  });

  /* ─── Suppression ─── */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/${basePath}/ressources/${id}`);
    },
    onSuccess: () => {
      toast.success('Ressource supprimée');
      qc.invalidateQueries({ queryKey: [basePath, 'ressources'] });
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Données ─── */
  const ressources = data ?? [];

  const filteredRessources = useMemo(() => {
    let result = ressources;

    // Filtre par type
    if (filterType !== 'all') {
      result = result.filter((r) => r.type === filterType);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.titre.toLowerCase().includes(q) ||
          (r.description ?? '').toLowerCase().includes(q) ||
          (r.session?.codeSession ?? '').toLowerCase().includes(q),
      );
    }

    return result;
  }, [ressources, filterType, searchQuery]);

  const availableTypes = useMemo(() => {
    const types = new Set(ressources.map((r) => r.type).filter(Boolean));
    return Array.from(types) as string[];
  }, [ressources]);

  const totalSize = useMemo(
    () =>
      ressources.reduce((sum, r) => sum + (r.fichierTaille ?? 0), 0),
    [ressources],
  );

  /* ─── Header ─── */
  const header = (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Ressources
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gérez les ressources pédagogiques
        </p>
        {!isLoading && !isError && ressources.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {ressources.length}
            </span>{' '}
            ressource{ressources.length > 1 ? 's' : ''}
            {totalSize > 0 && ` • ${formatBytes(totalSize)} au total`}
          </p>
        )}
      </div>
      <RessourceUploadDialog lockedSessionId={sessionId} />
    </header>
  );

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <ListSkeleton />
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <div className="flex items-start gap-3 p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground">
                Erreur de chargement
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Impossible de charger les ressources.
              </p>
              {error instanceof Error && (
                <p className="mt-1 text-xs font-mono text-muted-foreground">
                  {error.message}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="mt-3"
              >
                {isFetching ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden />
                )}
                Réessayer
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ─── Vide ─── */
  if (ressources.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <EmptyState
            icon={FolderOpen}
            title="Aucune ressource"
            description="Uploadez votre premier support pédagogique pour vos participants."
          />
        </Card>
      </div>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <div className="space-y-6">
      {header}

      {/* Barre de filtres et recherche */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Rechercher une ressource…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        {/* Filtre par type */}
        {availableTypes.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {availableTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_META[t]?.label ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Compteur de résultats */}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {filteredRessources.length}
        </span>{' '}
        ressource{filteredRessources.length > 1 ? 's' : ''}
        {filterType !== 'all' &&
          ` • ${TYPE_META[filterType]?.label ?? filterType}`}
        {searchQuery && ` • « ${searchQuery} »`}
      </p>

      {/* Grille */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRessources.map((r) => {
          const meta = TYPE_META[r.type] ?? DEFAULT_META;
          const Icon = meta.icon;
          const url = r.fichierUrl ?? r.url;
          const hasUrl = !!url;

          return (
            <Card
              key={r.id}
              className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <CardContent className="flex flex-1 flex-col p-5">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-border transition-transform duration-300 group-hover:scale-110',
                      meta.bg,
                      meta.color,
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {meta.label}
                  </Badge>
                </div>

                {/* Titre */}
                <h3
                  className="mb-1 line-clamp-2 font-display text-base font-semibold text-foreground transition-colors group-hover:text-primary"
                  title={r.titre}
                >
                  {r.titre}
                </h3>

                {/* Description */}
                {r.description && (
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {r.description}
                  </p>
                )}

                {/* Métadonnées */}
                <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  {r.session?.codeSession && (
                    <span className="font-mono">{r.session.codeSession}</span>
                  )}
                  <span className="tabular-nums">{formatDate(r.createdAt)}</span>
                  {r.fichierTaille != null && (
                    <span>• {formatBytes(r.fichierTaille)}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  {hasUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <a
                        href={url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={r.type !== 'LIEN' ? true : undefined}
                      >
                        {r.type === 'LIEN' ? (
                          <>
                            <ExternalLink
                              className="mr-1.5 h-3.5 w-3.5"
                              aria-hidden
                            />
                            Ouvrir
                          </>
                        ) : (
                          <>
                            <Download
                              className="mr-1.5 h-3.5 w-3.5"
                              aria-hidden
                            />
                            Télécharger
                          </>
                        )}
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled
                    >
                      Indisponible
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(r)}
                    className="h-9 w-9 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Supprimer ${r.titre}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtre sans résultat */}
      {filteredRessources.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={FolderOpen}
              title="Aucun résultat"
              description={
                searchQuery
                  ? `Aucune ressource ne correspond à « ${searchQuery} ».`
                  : `Aucune ressource de type « ${TYPE_META[filterType]?.label ?? filterType} ».`
              }
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterType('all');
                    setSearchQuery('');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer « {deleteTarget?.titre} » ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette ressource sera définitivement supprimée. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending && (
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden
                />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}