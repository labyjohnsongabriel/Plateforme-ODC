// src/app/(staff)/staff/formations/[id]/components/FormationDetail.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Layers,
  Eye,
  EyeOff,
  Calendar,
  Award,
  Pencil,
  Trash2,
  ImageOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { FormationFormModal } from '../../components/FormationFormModal';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Formation {
  id: string;
  titre?: string | null;
  slug?: string | null;
  resume?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  niveau?: string | null;
  dureeHeures?: number | null;
  estPubliee?: boolean;
  miseEnAvant?: boolean;
  nbVues?: number | null;
  domaine?: string | null;
  domaineNom?: string | null;
  domaineRelation?: { nom?: string | null; couleur?: string | null } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const NIVEAU_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
};

const NIVEAU_COLORS: Record<string, string> = {
  DEBUTANT:
    'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  INTERMEDIAIRE:
    'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  AVANCE:
    'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function getDomaineNom(formation: Formation): string {
  if (formation.domaineRelation?.nom) return formation.domaineRelation.nom;
  if (
    formation.domaine &&
    typeof formation.domaine === 'object' &&
    'nom' in formation.domaine
  ) {
    return (formation.domaine as { nom?: string }).nom ?? 'Sans domaine';
  }
  if (typeof formation.domaine === 'string') return formation.domaine;
  if (formation.domaineNom) return formation.domaineNom;
  return 'Sans domaine';
}

function getDomaineCouleur(formation: Formation): string {
  if (formation.domaineRelation?.couleur) return formation.domaineRelation.couleur;
  if (
    formation.domaine &&
    typeof formation.domaine === 'object' &&
    'couleur' in formation.domaine &&
    (formation.domaine as { couleur?: string }).couleur
  ) {
    return (formation.domaine as { couleur?: string }).couleur!;
  }
  return '#6B7280';
}

function extractFormation(response: unknown): Formation | null {
  if (!response || typeof response !== 'object') return null;
  const r = response as Record<string, unknown>;
  const root = (r.data ?? r) as Record<string, unknown>;
  const f = (root.formation ?? root) as Formation;
  return f?.id ? f : null;
}

function formatDate(date?: string | null): string {
  if (!date) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  } catch {
    return '—';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function FormationDetail({ formationId }: { formationId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  /* ─── Query formation ─── */
  const { data: formation, isLoading, isError, refetch, isFetching } = useQuery<Formation | null>({
    queryKey: ['staff', 'formation', formationId],
    queryFn: async () => {
      const response = await api.get(`/staff/formations/${formationId}`);
      return extractFormation(response.data);
    },
    enabled: !!formationId,
  });

  /* ─── Mutation delete ─── */
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/staff/formations/${formationId}`);
    },
    onSuccess: () => {
      toast.success('Formation supprimée');
      qc.invalidateQueries({ queryKey: ['staff', 'formations'] });
      router.push('/staff/formations');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError || !formation) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Retour
        </Button>
        <Card>
          <CardContent className="p-6">
            <QueryErrorState
              onRetry={() => void refetch()}
              isRetrying={isFetching}
              description="Cette formation n'existe pas ou n'est pas accessible."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Rendu ─── */
  const domaineNom = getDomaineNom(formation);
  const domaineCouleur = getDomaineCouleur(formation);
  const niveauLabel = formation.niveau
    ? NIVEAU_LABELS[formation.niveau] ?? formation.niveau
    : '—';
  const niveauColor = formation.niveau
    ? NIVEAU_COLORS[formation.niveau] ??
      'bg-muted text-muted-foreground border border-border'
    : 'bg-muted text-muted-foreground border border-border';
  const imageUrl = getMediaUrl(formation.imageUrl);

  return (
    <div className="space-y-6">
      {/* Retour */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Retour
      </Button>

      {/* Header : titre + actions */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md ring-1 ring-primary/20">
            <BookOpen
              className="h-6 w-6 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              {formation.titre ?? 'Sans titre'}
            </h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {formation.slug ?? '—'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Statut */}
          <Badge
            className={cn(
              'text-xs font-semibold',
              formation.estPubliee
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'border border-border text-muted-foreground',
            )}
          >
            {formation.estPubliee ? (
              <Eye className="mr-1.5 h-3 w-3" aria-hidden="true" />
            ) : (
              <EyeOff className="mr-1.5 h-3 w-3" aria-hidden="true" />
            )}
            {formation.estPubliee ? 'Publiée' : 'Brouillon'}
          </Badge>

          {/* Modifier */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
            Modifier
          </Button>

          {/* Supprimer */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm(`Supprimer définitivement "${formation.titre ?? 'cette formation'}" ?`)) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Supprimer
          </Button>
        </div>
      </header>

      {/* Grille : image + infos */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Colonne principale */}
        <div className="space-y-6">
          {/* Image */}
          {imageUrl ? (
            <div className="overflow-hidden rounded-xl border border-border bg-muted">
              <img
                src={imageUrl}
                alt={formation.titre ?? 'Formation'}
                className="aspect-video w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border bg-muted">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageOff className="h-10 w-10" aria-hidden="true" />
                <p className="text-sm">Aucune image</p>
              </div>
            </div>
          )}

          {/* Résumé */}
          {formation.resume && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Résumé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{formation.resume}</p>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {formation.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {formation.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar : métadonnées */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Domaine */}
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Domaine
                </p>
                <Badge
                  className="border text-xs font-medium"
                  style={{
                    backgroundColor: `${domaineCouleur}15`,
                    color: domaineCouleur,
                    borderColor: `${domaineCouleur}30`,
                  }}
                >
                  <Layers className="mr-1 h-3 w-3" aria-hidden="true" />
                  {domaineNom}
                </Badge>
              </div>

              <Separator />

              {/* Niveau */}
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Niveau
                </p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    niveauColor,
                  )}
                >
                  {niveauLabel}
                </span>
              </div>

              <Separator />

              {/* Durée */}
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Durée
                </p>
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                  {formation.dureeHeures ? `${formation.dureeHeures} heures` : '—'}
                </p>
              </div>

              {/* Vues */}
              {formation.nbVues != null && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Vues
                    </p>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-foreground tabular-nums">
                      <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
                      {formation.nbVues.toLocaleString('fr-FR')}
                    </p>
                  </div>
                </>
              )}

              {/* Mise en avant */}
              {formation.miseEnAvant && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <Award className="h-4 w-4" aria-hidden="true" />
                    Mise en avant
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Métadonnées temporelles */}
          <Card>
            <CardContent className="space-y-2 p-4 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Créée le</span>
                <span className="tabular-nums">{formatDate(formation.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Modifiée le</span>
                <span className="tabular-nums">{formatDate(formation.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* ⭐ Modal édition (réutilisé) */}
      <FormationFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        formationId={editOpen ? formationId : null}
      />
    </div>
  );
}